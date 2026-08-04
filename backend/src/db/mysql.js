const mysql = require('mysql2/promise');
const config = require('../config');

let pool;

function getMySqlPool() {
  if (config.authDatabase !== 'mysql') return null;
  if (!pool) {
    pool = mysql.createPool({
      ...config.mysql,
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
  console.log('MySQL authentication store connected');
}

module.exports = { connectMySQL, getMySqlPool };
