const UserModel = require('../models/user.model');
const MerchantModel = require('../models/merchant.model');
const config = require('../config');
const { getMySqlPool } = require('../db/mysql');

const tableFor = (role) => role === 'customer' ? 'customers' : 'merchants';
const mongoModelFor = (role) => role === 'customer' ? UserModel : MerchantModel;

async function findSqlByEmail(role, email) {
  const [rows] = await getMySqlPool().execute(
    `SELECT * FROM ${tableFor(role)} WHERE email = ? LIMIT 1`,
    [email.toLowerCase()],
  );
  return rows[0] || null;
}

async function createSqlAccount(role, values) {
  const pool = getMySqlPool();
  if (role === 'customer') {
    const [result] = await pool.execute(
      'INSERT INTO customers (name, email, password) VALUES (?, ?, ?)',
      [values.name, values.email.toLowerCase(), values.password],
    );
    return result.insertId;
  }
  const [result] = await pool.execute(
    'INSERT INTO merchants (name, restaurant_name, phone, address, email, password) VALUES (?, ?, ?, ?, ?, ?)',
    [values.name, values.restaurantName || null, values.phone || null, values.address || null, values.email.toLowerCase(), values.password],
  );
  return result.insertId;
}

async function ensureMongoMirror(role, values, sqlId) {
  const Model = mongoModelFor(role);
  const email = values.email.toLowerCase();
  const update = {
    name: values.name,
    email,
    authProvider: 'mysql',
    externalAuthId: String(sqlId),
  };
  if (values.password) update.password = values.password;
  if (role === 'merchant') {
    Object.assign(update, {
      restaurantName: values.restaurantName,
      phone: values.phone,
      address: values.address,
    });
  }
  return Model.findOneAndUpdate(
    { email },
    { $set: update },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
}

async function findByEmail(role, email) {
  if (config.authDatabase === 'mongodb') return mongoModelFor(role).findOne({ email: email.toLowerCase() });
  const sqlAccount = await findSqlByEmail(role, email);
  if (!sqlAccount) return null;
  const mongoAccount = await ensureMongoMirror(role, {
    ...sqlAccount,
    restaurantName: sqlAccount.restaurant_name,
  }, sqlAccount.id);
  return { mongoAccount, password: sqlAccount.password };
}

async function create(role, values) {
  if (config.authDatabase === 'mongodb') return mongoModelFor(role).create(values);
  const sqlId = await createSqlAccount(role, values);
  return ensureMongoMirror(role, values, sqlId);
}

async function credentialsFor(account) {
  if (config.authDatabase === 'mongodb') return { mongoAccount: account, password: account.password };
  return account;
}

module.exports = { findByEmail, create, credentialsFor };
