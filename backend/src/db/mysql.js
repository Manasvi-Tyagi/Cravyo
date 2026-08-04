const mysql = require('mysql2/promise');
const config = require('../config');

let pool;

function getMySqlPool() {
  if (config.authDatabase !== 'mysql') return null;
  if (!pool) {
    const { ssl, sslRejectUnauthorized, ...mysqlConfig } = config.mysql;
    pool = mysql.createPool({
      ...mysqlConfig,
      ...(ssl ? { ssl: { rejectUnauthorized: sslRejectUnauthorized } } : {}),
      waitForConnections: true,
      queueLimit: 0,
    });
  }
  return pool;
}

async function connectMySQL() {
  const activePool = getMySqlPool();
  if (!activePool) return;
  const connection = await activePool.getConnection();
  connection.release();
  await ensureMySqlSchema();
  console.log('MySQL authentication store connected');
}

async function ensureMySqlSchema() {
  const activePool = getMySqlPool();
  if (!activePool) return;
  await activePool.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await activePool.execute(`
    CREATE TABLE IF NOT EXISTS merchants (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      restaurant_name VARCHAR(160),
      phone VARCHAR(40),
      address VARCHAR(500),
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function closeMySQL() {
  if (pool) await pool.end();
  pool = undefined;
}

module.exports = { connectMySQL, getMySqlPool, ensureMySqlSchema, closeMySQL };
