require('dotenv').config();

const crypto = require('crypto');
const mongoose = require('mongoose');
const app = require('../src/app');
const config = require('../src/config');
const connectDB = require('../src/db/db');
const { connectMySQL, getMySqlPool, closeMySQL } = require('../src/db/mysql');
const Cache = require('../src/services/redis.service');
const Search = require('../src/services/search.service');
const { reconcileInfrastructure } = require('../src/services/reconciliation.service');

async function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });
}

async function closeServer(server) {
  if (!server) return;
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

async function verify() {
  const results = {};
  const errors = {};
  let server;
  const checkId = crypto.randomUUID();
  const cacheKey = `cravyo:connection-check:${checkId}`;
  const documentId = `connection-check-${checkId}`;

  try {
    try {
      await connectDB();
      const mongoPing = await mongoose.connection.db.admin().ping();
      results.mongodb = mongoPing.ok === 1;
    } catch (error) {
      results.mongodb = false;
      errors.mongodb = error.code || error.message;
    }

    try {
      await connectMySQL();
      const [mysqlPing] = await getMySqlPool().query('SELECT 1 AS connected');
      const [tables] = await getMySqlPool().query(
        `SELECT TABLE_NAME FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('customers', 'merchants')`,
        [config.mysql.database],
      );
      results.mysql = mysqlPing[0].connected === 1 && tables.length === 2;
      results.mysqlTables = tables.map((row) => row.TABLE_NAME).sort();
    } catch (error) {
      results.mysql = false;
      errors.mysql = error.code || error.message;
    }

    try {
      await Cache.connectRedis();
      await Cache.setJson(cacheKey, { checkId }, 30);
      const cached = await Cache.getJson(cacheKey);
      const ttl = await Cache.getRedisClient().ttl(cacheKey);
      await Cache.deleteKeys(cacheKey);
      results.valkey = cached?.checkId === checkId && ttl > 0 && await Cache.getJson(cacheKey) === null;
    } catch (error) {
      results.valkey = false;
      errors.valkey = error.code || error.message;
    }

    try {
      await Search.connectSearch();
      const reconciliation = results.mongodb ? await reconcileInfrastructure() : { skipped: true };
      const searchClient = Search.getSearchClient();
      await searchClient.index({
        index: config.opensearchIndex,
        id: documentId,
        refresh: true,
        body: { name: `Connection Check ${checkId}`, description: 'Temporary Cravyo connectivity document' },
      });
      const searchResponse = await searchClient.search({
        index: config.opensearchIndex,
        body: { query: { match: { name: checkId } } },
      });
      const searchBody = searchResponse.body ?? searchResponse;
      results.opensearch = searchBody.hits.hits.some((hit) => hit._id === documentId);
      results.reconciliation = !reconciliation.skipped;
      await searchClient.delete({ index: config.opensearchIndex, id: documentId, refresh: true });
    } catch (error) {
      results.opensearch = false;
      results.reconciliation = false;
      errors.opensearch = error.code || error.message;
    }

    server = await listen();
    const healthResponse = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
    const health = await healthResponse.json();
    results.apiHealth = healthResponse.status === 200 && health.success === true;
    results.dependencies = health.dependencies;

    if (!Object.values({
      mongodb: results.mongodb,
      mysql: results.mysql,
      valkey: results.valkey,
      opensearch: results.opensearch,
      reconciliation: results.reconciliation,
      apiHealth: results.apiHealth,
    }).every(Boolean)) {
      errors.apiHealth = `HTTP ${healthResponse.status}`;
    }

    console.log(JSON.stringify({ ...results, errors }, null, 2));
    if (Object.keys(errors).length) throw new Error('One or more dependency checks failed');
  } finally {
    await Promise.allSettled([
      closeServer(server),
      Cache.deleteKeys(cacheKey),
      Cache.closeRedis(),
      Search.closeSearch(),
      closeMySQL(),
      mongoose.disconnect(),
    ]);
  }
}

verify().catch((error) => {
  console.error(`Connection verification failed: ${error.message}`);
  process.exitCode = 1;
});
