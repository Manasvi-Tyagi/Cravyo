const Product = require('../models/product.model');
const Like = require('../models/likes.model');
const Save = require('../models/save.model');
const Cache = require('./redis.service');
const Search = require('./search.service');

let running = false;

async function countsByProduct(Model) {
  const rows = await Model.aggregate([
    { $match: { product: { $ne: null } } },
    { $group: { _id: '$product', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

async function reconcileInfrastructure() {
  if (running) return { skipped: true, reason: 'already-running' };
  running = true;
  try {
    const [products, likeCounts, saveCounts, likes, saves] = await Promise.all([
      Product.find({}).populate('merchant', 'name restaurantName image'),
      countsByProduct(Like),
      countsByProduct(Save),
      Like.find({}).select('user product').lean(),
      Save.find({}).select('user product').lean(),
    ]);

    const operations = [];
    for (const product of products) {
      const id = product._id.toString();
      const likeCount = likeCounts.get(id) || 0;
      const saveCount = saveCounts.get(id) || 0;
      if (product.likeCount !== likeCount || product.saveCount !== saveCount) {
        operations.push({
          updateOne: { filter: { _id: product._id }, update: { $set: { likeCount, saveCount } } },
        });
        product.likeCount = likeCount;
        product.saveCount = saveCount;
      }
    }
    if (operations.length) await Product.bulkWrite(operations);

    const interactions = new Map();
    for (const like of likes) {
      interactions.set(`${like.user}:${like.product}`, { liked: true, saved: false });
    }
    for (const save of saves) {
      const key = `${save.user}:${save.product}`;
      interactions.set(key, { ...(interactions.get(key) || { liked: false }), saved: true });
    }

    await Promise.all([
      Search.bulkReplaceProducts(products),
      Cache.deleteByPattern('feed:*'),
      Cache.deleteByPattern('product:*'),
      Cache.deleteByPattern('user:*:liked'),
      Cache.deleteByPattern('user:*:saved'),
      Cache.deleteByPattern('interaction:*'),
    ]);
    await Promise.all([
      ...products.map((product) => Cache.setJson(`social:product:${product._id}`, {
        likeCount: product.likeCount,
        saveCount: product.saveCount,
      })),
      ...Array.from(interactions, ([key, state]) => Cache.setJson(`interaction:${key}`, state)),
    ]);

    return { skipped: false, products: products.length, interactions: interactions.size, countersRepaired: operations.length };
  } finally {
    running = false;
  }
}

module.exports = { reconcileInfrastructure, countsByProduct };
