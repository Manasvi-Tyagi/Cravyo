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

  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

// ── FEED ───────────────────────────────────────────────────────────────────────

const getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(20, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const products = await ProductModel.find({})
    .populate('merchant', 'name restaurantName image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await ProductModel.countDocuments();

  res.status(200).json(new ApiResponse(200, {
    products,
    pagination: { page, limit, total, hasMore: skip + products.length < total },
  }));
});

// ── LIKE ───────────────────────────────────────────────────────────────────────

const likeProduct = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const { productId } = req.body;
  if (!productId) throw new ApiError(400, "productId is required");

  const existing = await LikeModel.findOne({ user: customer._id, product: productId });
  if (existing) {
    await LikeModel.deleteOne({ _id: existing._id });
    await ProductModel.findByIdAndUpdate(productId, { $inc: { likeCount: -1 } });
    return res.status(200).json(new ApiResponse(200, { liked: false }, "Product unliked"));
  }

  await LikeModel.create({ user: customer._id, product: productId });
  await ProductModel.findByIdAndUpdate(productId, { $inc: { likeCount: 1 } });
  res.status(200).json(new ApiResponse(200, { liked: true }, "Product liked"));
});

// ── SAVE ───────────────────────────────────────────────────────────────────────

const saveProduct = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const { productId } = req.body;
  if (!productId) throw new ApiError(400, "productId is required");

  const existing = await SaveModel.findOne({ user: customer._id, product: productId });
  if (existing) {
    await SaveModel.deleteOne({ _id: existing._id });
    await ProductModel.findByIdAndUpdate(productId, { $inc: { saveCount: -1 } });
    return res.status(200).json(new ApiResponse(200, { saved: false }, "Product unsaved"));
  }

  await SaveModel.create({ user: customer._id, product: productId });
  await ProductModel.findByIdAndUpdate(productId, { $inc: { saveCount: 1 } });
  res.status(200).json(new ApiResponse(200, { saved: true }, "Product saved"));
});

// ── LIKED / SAVED LISTS ────────────────────────────────────────────────────────

const getLikedProducts = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const likes = await LikeModel.find({ user: customer._id }).populate({
    path: 'product',
    populate: { path: 'merchant', select: 'name restaurantName image' },
  });
  const products = likes.map((l) => l.product).filter(Boolean);
  res.status(200).json(new ApiResponse(200, { products }));
});

const getSavedProducts = asyncHandler(async (req, res) => {
  const customer = req.customer;
  if (!customer) throw new ApiError(401, "Not authenticated");

  const saves = await SaveModel.find({ user: customer._id }).populate({
    path: 'product',
    populate: { path: 'merchant', select: 'name restaurantName image' },
  });
  const products = saves.map((s) => s.product).filter(Boolean);
  res.status(200).json(new ApiResponse(200, { products }));
});

// ── COMMENTS ──────────────────────────────────────────────────────────────────

const addComment = asyncHandler(async (req, res) => {
  const { productId, text } = req.body;
  const userId = req.customer._id;

  if (!text || !text.trim()) throw new ApiError(400, "Comment cannot be empty");

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const comment = await CommentModel.create({ user: userId, product: productId, text: text.trim() });
  await ProductModel.findByIdAndUpdate(productId, { $inc: { commentCount: 1 } });

  const populated = await CommentModel.findById(comment._id).populate('user', 'name profileImage');
  res.status(201).json(new ApiResponse(201, { comment: populated }, "Comment added"));
});

const getComments = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.customer._id;

  const comments = await CommentModel.find({ product: productId })
    .populate('user', 'name profileImage')
    .sort({ createdAt: -1 });

  const withStatus = comments.map((c) => ({
    ...c.toObject(),
    isLikedByUser: c.likedBy.includes(userId),
  }));

  res.status(200).json(new ApiResponse(200, { comments: withStatus }));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.customer._id;

  const comment = await CommentModel.findOne({ _id: commentId, user: userId });
  if (!comment) throw new ApiError(404, "Comment not found or not yours");

  await CommentModel.deleteOne({ _id: commentId });
  await ProductModel.findByIdAndUpdate(comment.product, { $inc: { commentCount: -1 } });
  res.status(200).json(new ApiResponse(200, null, "Comment deleted"));
});

const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;
  const userId = req.customer._id;

  if (!text || !text.trim()) throw new ApiError(400, "Comment text cannot be empty");

  const comment = await CommentModel.findOne({ _id: commentId, user: userId });
  if (!comment) throw new ApiError(404, "Comment not found or not yours");

  comment.text = text.trim();
  await comment.save();

  const updated = await CommentModel.findById(commentId).populate('user', 'name profileImage');
  res.status(200).json(new ApiResponse(200, { comment: updated }, "Comment updated"));
});

const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.body;
  const userId = req.customer._id;

  const comment = await CommentModel.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const idx = comment.likedBy.findIndex((id) => id.toString() === userId.toString());
  let isLiked;
  if (idx > -1) {
    comment.likedBy.splice(idx, 1);
    comment.likeCount = Math.max(0, comment.likeCount - 1);
    isLiked = false;
  } else {
    comment.likedBy.push(userId);
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
    const product = await ProductModel.findById(req.params.id)
      .populate('merchant', 'name restaurantName image');
    if (!product) throw new ApiError(404, "Product not found");
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
