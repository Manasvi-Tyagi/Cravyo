require('dotenv').config();
const connectMongoDB = require('../src/db/db');
const { connectMySQL, getMySqlPool } = require('../src/db/mysql');
const User = require('../src/models/user.model');
const Merchant = require('../src/models/merchant.model');

async function migrate() {
  if (process.env.AUTH_DATABASE !== 'mysql') {
    throw new Error('Set AUTH_DATABASE=mysql before migrating accounts');
  }
  await connectMongoDB();
  await connectMySQL();
  const pool = getMySqlPool();

  for (const user of await User.find({})) {
    const [result] = await pool.execute(
      `INSERT INTO customers (name, email, password) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password = VALUES(password), id = LAST_INSERT_ID(id)`,
      [user.name, user.email.toLowerCase(), user.password],
    );
    user.authProvider = 'mysql';
    user.externalAuthId = String(result.insertId);
    await user.save();
  }

  for (const merchant of await Merchant.find({})) {
    const [result] = await pool.execute(
      `INSERT INTO merchants (name, restaurant_name, phone, address, email, password)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), restaurant_name = VALUES(restaurant_name),
       phone = VALUES(phone), address = VALUES(address), password = VALUES(password), id = LAST_INSERT_ID(id)`,
      [merchant.name, merchant.restaurantName || null, merchant.phone || null, merchant.address || null, merchant.email.toLowerCase(), merchant.password],
    );
    merchant.authProvider = 'mysql';
    merchant.externalAuthId = String(result.insertId);
    await merchant.save();
  }

  console.log('Existing MongoDB accounts copied to MySQL and linked');
  await pool.end();
  await require('mongoose').disconnect();
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
