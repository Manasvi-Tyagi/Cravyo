/*
 * Seeds 100 customers + 100 merchants in MySQL (mirrored into MongoDB, matching
 * account.service.js's real signup flow), and Product "reels" with real
 * videos uploaded to ImageKit (assigned to merchants in order).
 * Use this to exercise the redis cron (reconciliation.service.js) and
 * OpenSearch sync end to end.
 *
 * Video sources:
 *  - 15 free food clips downloaded from mixkit.co into scripts/seed-videos/
 *  - 12 pre-existing clips from the repo-root videos/ folder
 *
 * Reel creation is idempotent by name, so re-running this script only
 * uploads/creates reels that don't already exist yet.
 *
 * Usage: node scripts/seed-test-data.js
 */
require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const connectMongoDB = require('../src/db/mongodb');
const { connectMySQL, getMySqlPool } = require('../src/db/mysql');
const { uploadFileToImageKit } = require('../src/services/storage.services');
const config = require('../src/config');

const UserModel = require('../src/models/user.model');
const MerchantModel = require('../src/models/merchant.model');
const ProductModel = require('../src/models/product.model');

const CUSTOMER_COUNT = 100;
const MERCHANT_COUNT = 100;
const SEED_VIDEO_DIR = path.join(__dirname, 'seed-videos');
const ROOT_VIDEO_DIR = path.join(__dirname, '..', '..', 'videos');

const CUISINES = ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Continental', 'Bakery'];
const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur'];

const REELS = [
  { file: '49231.mp4', dir: SEED_VIDEO_DIR, name: 'Slow-Motion Veggie Sauté', description: 'Fresh vegetables hitting a hot pan in glorious slow motion.' },
  { file: '40524.mp4', dir: SEED_VIDEO_DIR, name: 'Knife Skills: Veggie Slicing', description: 'Top-down view of precise vegetable slicing for a fresh prep.' },
  { file: '10434.mp4', dir: SEED_VIDEO_DIR, name: 'Rinsed Berries & Grapes', description: 'Strawberries, apples and grapes washed fresh under running water.' },
  { file: '43925.mp4', dir: SEED_VIDEO_DIR, name: 'Yogurt & Fruit Bowl', description: 'A creamy yogurt bowl topped with fresh seasonal fruit.' },
  { file: '42910.mp4', dir: SEED_VIDEO_DIR, name: 'Classic Egg Omelet Flip', description: 'A perfectly flipped omelet, hot off the pan.' },
  { file: '10419.mp4', dir: SEED_VIDEO_DIR, name: 'Fresh Sliced Fruit Platter', description: 'A colorful platter of freshly sliced fruit.' },
  { file: '10428.mp4', dir: SEED_VIDEO_DIR, name: 'Fresh Orange Juice', description: 'Juice poured into a glass alongside whole oranges.' },
  { file: '12171.mp4', dir: SEED_VIDEO_DIR, name: 'Spaghetti Bolognese', description: 'Parmesan shaved over a rich spaghetti bolognese.' },
  { file: '10424.mp4', dir: SEED_VIDEO_DIR, name: 'Rotating Fruit Bowl', description: 'A vibrant bowl of mixed fruit on a clean white background.' },
  { file: '3806.mp4', dir: SEED_VIDEO_DIR, name: 'Meatballs in Sauce', description: 'Meatballs simmering gently in a rich tomato sauce.' },
  { file: '44001.mp4', dir: SEED_VIDEO_DIR, name: 'Pepperoni Pizza Close-Up', description: 'A close-up of a fresh, cheesy pepperoni pizza.' },
  { file: '26085.mp4', dir: SEED_VIDEO_DIR, name: 'Fresh Garden Salad', description: 'A crisp, fresh salad enjoyed at the kitchen table.' },
  { file: '10420.mp4', dir: SEED_VIDEO_DIR, name: 'Fresh Veggies on a Board', description: 'A close-up view of fresh vegetables on a wooden board.' },
  { file: '43941.mp4', dir: SEED_VIDEO_DIR, name: 'Coffee Pour', description: 'Freshly brewed coffee poured into a cup.' },
  { file: '43063.mp4', dir: SEED_VIDEO_DIR, name: 'Crispy Fried Bacon', description: 'Diced bacon frying to a crisp in a skillet.' },
  { file: '12888245_1080_1920_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 12888245', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '12888289_1080_1920_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 12888289', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '12888314_1080_1920_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 12888314', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '12888345_1080_1920_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 12888345', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '13069717_720_1280_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 13069717', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '13439516_1080_1920_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 13439516', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '13476284_1080_1920_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 13476284', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '20712257-hd_1080_1920_60fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 20712257', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '3827379-uhd_2160_3840_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 3827379', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '6096029-uhd_2160_4096_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 6096029', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '8844367-uhd_2160_3840_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 8844367', description: 'Signature dish reel, shot vertically for the feed.' },
  { file: '8844427-uhd_2160_3840_30fps.mp4', dir: ROOT_VIDEO_DIR, name: 'Reel Special 8844427', description: 'Signature dish reel, shot vertically for the feed.' },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedMySqlAndMirror(pool) {
  const hashedPassword = await bcrypt.hash('Password@123', 10);

  const customerIds = [];
  const merchantIds = [];

  for (let i = 1; i <= CUSTOMER_COUNT; i++) {
    const email = `customer${i}.seed@cravyo.test`;
    const [result] = await pool.execute(
      `INSERT INTO customers (name, email, password) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), id = LAST_INSERT_ID(id)`,
      [`Test Customer ${i}`, email, hashedPassword],
    );
    const sqlId = result.insertId;

    const mongoUser = await UserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          name: `Test Customer ${i}`,
          email,
          password: hashedPassword,
          authProvider: 'mysql',
          externalAuthId: String(sqlId),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    customerIds.push(mongoUser._id);
  }

  for (let i = 1; i <= MERCHANT_COUNT; i++) {
    const email = `merchant${i}.seed@cravyo.test`;
    const restaurantName = `Test Kitchen ${i}`;
    const [result] = await pool.execute(
      `INSERT INTO merchants (name, restaurant_name, phone, address, email, password)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), restaurant_name = VALUES(restaurant_name),
       phone = VALUES(phone), address = VALUES(address), password = VALUES(password), id = LAST_INSERT_ID(id)`,
      [`Merchant Owner ${i}`, restaurantName, `98765${String(i).padStart(5, '0')}`, `${i} MG Road, ${pick(CITIES)}`, email, hashedPassword],
    );
    const sqlId = result.insertId;

    const mongoMerchant = await MerchantModel.findOneAndUpdate(
      { email },
      {
        $set: {
          name: `Merchant Owner ${i}`,
          email,
          password: hashedPassword,
          restaurantName,
          phone: `98765${String(i).padStart(5, '0')}`,
          address: `${i} MG Road, ${pick(CITIES)}`,
          authProvider: 'mysql',
          externalAuthId: String(sqlId),
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );
    merchantIds.push(mongoMerchant._id);
  }

  return { customerIds, merchantIds };
}

async function seedReelsWithRealVideos(merchantIds) {
  const created = [];
  let skipped = 0;
  for (let i = 0; i < REELS.length; i++) {
    const reel = REELS[i];
    const merchantId = merchantIds[i];

    const existing = await ProductModel.findOne({ name: reel.name }).select('_id videoUrl').lean();
    if (existing) {
      skipped += 1;
      console.log(`  Skipping "${reel.name}" — already seeded (${existing.videoUrl}).`);
      continue;
    }

    const filePath = path.join(reel.dir, reel.file);
    const buffer = await fs.readFile(filePath);

    console.log(`  Uploading ${reel.file} -> "${reel.name}" (merchant ${i + 1})...`);
    const uploadResult = await uploadFileToImageKit(buffer, `seed-reel-${uuid()}-${reel.file}`);

    const product = await ProductModel.create({
      name: reel.name,
      description: reel.description,
      price: Math.round((99 + Math.random() * 400) * 100) / 100,
      videoUrl: uploadResult.url,
      merchant: merchantId,
      tags: {
        cuisine: pick(CUISINES),
        aiGenerated: false,
      },
    });
    created.push(product);
  }
  return { created, skipped };
}

async function main() {
  if (config.authDatabase !== 'mysql') {
    throw new Error('Set AUTH_DATABASE=mysql in .env before running this seed script');
  }

  await connectMongoDB();
  await connectMySQL();
  const pool = getMySqlPool();

  console.log(`Seeding ${CUSTOMER_COUNT} customers and ${MERCHANT_COUNT} merchants into MySQL (mirrored to MongoDB)...`);
  const { customerIds, merchantIds } = await seedMySqlAndMirror(pool);
  console.log(`Done: ${customerIds.length} customers, ${merchantIds.length} merchants.`);

  console.log(`Uploading up to ${REELS.length} real videos to ImageKit and creating reels...`);
  const { created, skipped } = await seedReelsWithRealVideos(merchantIds);
  console.log(`Done: ${created.length} new reels uploaded and created, ${skipped} already existed.`);

  console.log('\nSeed complete.');
  await pool.end();
  await require('mongoose').disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
