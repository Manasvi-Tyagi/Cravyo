const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const { v4: uuid } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

const ProductModel = require('../models/product.model');
const LikeModel = require('../models/likes.model');
const SaveModel = require('../models/save.model');
const CommentModel = require('../models/comments.model');
const { uploadFileToImageKit } = require('../services/storage.services');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const UserModel = require('../models/user.model');
const MerchantModel = require('../models/merchant.model');
const Cache = require('../services/redis.service');
const Search = require('../services/search.service');

const feedCacheKey = (page, limit, query = '') => `feed:${page}:${limit}:${query.toLowerCase()}`;
const productCacheKey = (id) => `product:${id}`;
const likedCacheKey = (userId) => `user:${userId}:liked`;
const savedCacheKey = (userId) => `user:${userId}:saved`;
const interactionCacheKey = (userId, productId) => `interaction:${userId}:${productId}`;

async function setInteractionState(userId, productId, patch) {
  const key = interactionCacheKey(userId, productId);
  const current = await Cache.getJson(key) || {};
  return Cache.setJson(key, { ...current, ...patch });
}

async function invalidateProductCaches(productId, userId, listType) {
  await Promise.all([
    Cache.deleteByPattern('feed:*'),
    Cache.deleteKeys(productCacheKey(productId), listType === 'liked' ? likedCacheKey(userId) : savedCacheKey(userId)),
  ]);
}

function actorFromRequest(req) {
  if (req.authActor) return req.authActor;
  if (req.customer) return { id: req.customer._id.toString(), type: 'customer', account: req.customer };
  if (req.merchant) return { id: req.merchant._id.toString(), type: 'merchant', account: req.merchant };
  return null;
}

function ownsComment(comment, actor) {
  const id = comment.actorId || comment.user?.toString();
  const type = comment.actorId ? comment.actorType : 'customer';
  return id === actor.id && type === actor.type;
}

async function presentComment(comment, actor = null) {
  const raw = comment.toObject();
  const actorId = raw.actorId || raw.user?.toString();
  const actorType = raw.actorId ? raw.actorType : 'customer';
  const Model = actorType === 'merchant' ? MerchantModel : UserModel;
  const account = actorId && require('mongoose').isValidObjectId(actorId)
    ? await Model.findById(actorId).select('name profileImage image restaurantName')
    : null;
  const likedByActor = actor && (
    raw.likedByActors?.some((entry) => entry.actorId === actor.id && entry.actorType === actor.type) ||
    (actor.type === 'customer' && raw.likedBy?.some((id) => id.toString() === actor.id))
  );
  return {
    ...raw,
    user: account ? {
      _id: account._id,
      id: account._id,
      name: account.restaurantName || account.name,
      profileImage: account.profileImage || account.image || '',
      role: actorType,
    } : { _id: actorId, id: actorId, name: actorType === 'merchant' ? 'Merchant' : 'User', role: actorType },
    isLikedByUser: Boolean(likedByActor),
    isOwnComment: actor ? actorId === actor.id && actorType === actor.type : false,
  };
}

// ── CREATE ─────────────────────────────────────────────────────────────────────

const createProduct = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Video file is required");
  if (!req.merchant) throw new ApiError(401, "Merchant not authenticated");

  const { name, description, price } = req.body;
  if (!name) throw new ApiError(400, "Product name is required");
  if (price === undefined || price === '') throw new ApiError(400, "Product price is required");

  const inputFilePath = path.join(os.tmpdir(), `${uuid()}-input-${req.file.originalname}`);
  const outputFilePath = path.join(os.tmpdir(), `${uuid()}-compressed-${req.file.originalname}`);

  await fs.writeFile(inputFilePath, req.file.buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(inputFilePath)
      .outputOptions(['-c:v libx264', '-preset medium', '-crf 28', '-c:a aac', '-b:a 128k', '-movflags +faststart'])
      .output(outputFilePath)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const compressedBuffer = await fs.readFile(outputFilePath);
  const fileUploadResult = await uploadFileToImageKit(compressedBuffer, `${uuid()}-${req.file.originalname}`);

  await fs.rm(inputFilePath, { force: true });
  await fs.rm(outputFilePath, { force: true });

  const product = await ProductModel.create({
    name,
    description,
    price: Number(price),
    videoUrl: fileUploadResult.url,
    merchant: req.merchant._id,
  });

  const indexedProduct = await ProductModel.findById(product._id).populate('merchant', 'name restaurantName image');
  await Promise.all([Search.indexProduct(indexedProduct), Cache.deleteByPattern('feed:*')]);

  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

// ── FEED ───────────────────────────────────────────────────────────────────────

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const search = req.query.q?.trim();
  const key = feedCacheKey(page, limit, search || '');
  const cached = await Cache.getJson(key);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, 'Products loaded from cache'));

  let products;
  let total;
  if (search && Search.isSearchAvailable()) {
    const result = await Search.searchProductIds(search, page, limit);
    const rows = await ProductModel.find({ _id: { $in: result.ids } })
      .populate('merchant', 'name restaurantName image');
    const byId = new Map(rows.map((item) => [item._id.toString(), item]));
    products = result.ids.map((id) => byId.get(id)).filter(Boolean);
    total = result.total;
  } else {
    const filter = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    } : {};
    products = await ProductModel.find(filter)
      .populate('merchant', 'name restaurantName image')
      .sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit);
    total = await ProductModel.countDocuments(filter);
  }

  const payload = { products, pagination: { page, limit, total, hasMore: skip + products.length < total } };
  await Cache.setJson(key, payload);
  res.status(200).json(new ApiResponse(200, payload));
});

// ── LIKE ───────────────────────────────────────────────────────────────────────

const likeProduct = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const { productId } = req.body;
  if (!productId) throw new ApiError(400, "productId is required");

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existing = await LikeModel.findOne({ user: customer._id, product: productId });
  if (existing) {
    await LikeModel.deleteOne({ _id: existing._id });
    const updated = await ProductModel.findByIdAndUpdate(productId, [
      { $set: { likeCount: { $max: [0, { $subtract: ['$likeCount', 1] }] } } },
    ], { returnDocument: 'after' });
    await Promise.all([
      setInteractionState(customer._id, productId, { liked: false }),
      Cache.setJson(`social:product:${productId}`, { likeCount: updated.likeCount, saveCount: updated.saveCount }),
      invalidateProductCaches(productId, customer._id, 'liked'),
    ]);
    return res.status(200).json(new ApiResponse(200, { liked: false, likeCount: updated.likeCount }, "Product unliked"));
  }

  try {
    await LikeModel.create({ user: customer._id, product: productId });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return res.status(200).json(new ApiResponse(200, { liked: true, likeCount: product.likeCount }, "Product already liked"));
  }
  const updated = await ProductModel.findByIdAndUpdate(productId, { $inc: { likeCount: 1 } }, { returnDocument: 'after' });
  await Promise.all([
    setInteractionState(customer._id, productId, { liked: true }),
    Cache.setJson(`social:product:${productId}`, { likeCount: updated.likeCount, saveCount: updated.saveCount }),
    invalidateProductCaches(productId, customer._id, 'liked'),
  ]);
  res.status(200).json(new ApiResponse(200, { liked: true, likeCount: updated.likeCount }, "Product liked"));
});

// ── SAVE ───────────────────────────────────────────────────────────────────────

const saveProduct = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const { productId } = req.body;
  if (!productId) throw new ApiError(400, "productId is required");

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const existing = await SaveModel.findOne({ user: customer._id, product: productId });
  if (existing) {
    await SaveModel.deleteOne({ _id: existing._id });
    const updated = await ProductModel.findByIdAndUpdate(productId, [
      { $set: { saveCount: { $max: [0, { $subtract: ['$saveCount', 1] }] } } },
    ], { returnDocument: 'after' });
    await Promise.all([
      setInteractionState(customer._id, productId, { saved: false }),
      Cache.setJson(`social:product:${productId}`, { likeCount: updated.likeCount, saveCount: updated.saveCount }),
      invalidateProductCaches(productId, customer._id, 'saved'),
    ]);
    return res.status(200).json(new ApiResponse(200, { saved: false, saveCount: updated.saveCount }, "Product unsaved"));
  }

  try {
    await SaveModel.create({ user: customer._id, product: productId });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return res.status(200).json(new ApiResponse(200, { saved: true, saveCount: product.saveCount }, "Product already saved"));
  }
  const updated = await ProductModel.findByIdAndUpdate(productId, { $inc: { saveCount: 1 } }, { returnDocument: 'after' });
  await Promise.all([
    setInteractionState(customer._id, productId, { saved: true }),
    Cache.setJson(`social:product:${productId}`, { likeCount: updated.likeCount, saveCount: updated.saveCount }),
    invalidateProductCaches(productId, customer._id, 'saved'),
  ]);
  res.status(200).json(new ApiResponse(200, { saved: true, saveCount: updated.saveCount }, "Product saved"));
});

// ── LIKED / SAVED LISTS ────────────────────────────────────────────────────────

const getLikedProducts = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const key = likedCacheKey(customer._id);
  const cached = await Cache.getJson(key);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, 'Liked products loaded from cache'));

  const likes = await LikeModel.find({ user: customer._id }).populate({
    path: 'product',
    populate: { path: 'merchant', select: 'name restaurantName image' },
  });
  const products = likes.map((l) => l.product).filter(Boolean);
  const payload = { products };
  await Cache.setJson(key, payload);
  res.status(200).json(new ApiResponse(200, payload));
});

const getSavedProducts = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const key = savedCacheKey(customer._id);
  const cached = await Cache.getJson(key);
  if (cached) return res.status(200).json(new ApiResponse(200, cached, 'Saved products loaded from cache'));

  const saves = await SaveModel.find({ user: customer._id }).populate({
    path: 'product',
    populate: { path: 'merchant', select: 'name restaurantName image' },
  });
  const products = saves.map((s) => s.product).filter(Boolean);
  const payload = { products };
  await Cache.setJson(key, payload);
  res.status(200).json(new ApiResponse(200, payload));
});

// ── COMMENTS ──────────────────────────────────────────────────────────────────

const addComment = asyncHandler(async (req, res) => {
  const { productId, text } = req.body;
  const actor = actorFromRequest(req);
  if (!actor) throw new ApiError(401, "Not authenticated");

  if (!text || !text.trim()) throw new ApiError(400, "Comment cannot be empty");

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const comment = await CommentModel.create({
    user: actor.type === 'customer' ? actor.id : undefined,
    actorId: actor.id,
    actorType: actor.type,
    product: productId,
    text: text.trim(),
  });
  await ProductModel.findByIdAndUpdate(productId, { $inc: { commentCount: 1 } });

  const populated = await presentComment(comment, actor);
  res.status(201).json(new ApiResponse(201, { comment: populated }, "Comment added"));
});

const getComments = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const actor = actorFromRequest(req);

  const comments = await CommentModel.find({ product: productId })
    .sort({ createdAt: -1 });

  const withStatus = await Promise.all(comments.map((comment) => presentComment(comment, actor)));

  res.status(200).json(new ApiResponse(200, { comments: withStatus }));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const actor = actorFromRequest(req);

  const comment = await CommentModel.findById(commentId);
  if (!comment || !ownsComment(comment, actor)) throw new ApiError(404, "Comment not found or not yours");

  await CommentModel.deleteOne({ _id: commentId });
  await ProductModel.findByIdAndUpdate(comment.product, { $inc: { commentCount: -1 } });
  res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
});

const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const actor = actorFromRequest(req);

  if (!text || !text.trim()) throw new ApiError(400, "Comment text cannot be empty");

  const comment = await CommentModel.findById(commentId);
  if (!comment || !ownsComment(comment, actor)) throw new ApiError(404, "Comment not found or not yours");

  comment.text = text.trim();
  await comment.save();

  const updated = await presentComment(comment, actor);
  res.status(200).json(new ApiResponse(200, { comment: updated }, "Comment updated"));
});

const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.body;
  const actor = actorFromRequest(req);

  const comment = await CommentModel.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const idx = comment.likedByActors.findIndex((entry) => entry.actorId === actor.id && entry.actorType === actor.type);
  const legacyIdx = actor.type === 'customer'
    ? comment.likedBy.findIndex((id) => id.toString() === actor.id)
    : -1;
  let isLiked;
  if (idx > -1 || legacyIdx > -1) {
    if (idx > -1) comment.likedByActors.splice(idx, 1);
    if (legacyIdx > -1) comment.likedBy.splice(legacyIdx, 1);
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    isLiked = false;
  } else {
    comment.likedByActors.push({ actorId: actor.id, actorType: actor.type });
    comment.likeCount += 1;
    isLiked = true;
  }
  await comment.save();

  res.status(200).json(new ApiResponse(200, { isLiked, likeCount: comment.likeCount }));
});

module.exports = {
  createProduct,
  getProducts,
  getProductById: asyncHandler(async (req, res) => {
    const cached = await Cache.getJson(productCacheKey(req.params.id));
    if (cached) return res.status(200).json(new ApiResponse(200, cached, 'Product loaded from cache'));
    const product = await ProductModel.findById(req.params.id)
      .populate('merchant', 'name restaurantName image');
    if (!product) throw new ApiError(404, "Product not found");
    await Cache.setJson(productCacheKey(req.params.id), product);
    res.status(200).json(new ApiResponse(200, product));
  }),
  likeProduct,
  saveProduct,
  getLikedProducts,
  getSavedProducts,
  addComment,
  getComments,
  deleteComment,
  editComment,
  likeComment,
  // Backward compat aliases
  createFood: createProduct,
  getFoodItems: getProducts,
  likefood: likeProduct,
  savefood: saveProduct,
  getLikedFoods: getLikedProducts,
  getSavedFoods: getSavedProducts,
};
