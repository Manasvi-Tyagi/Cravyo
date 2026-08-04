require('dotenv').config();
const connectDB = require('../src/db/db');
const { connectRedis, closeRedis } = require('../src/services/redis.service');
const { connectSearch } = require('../src/services/search.service');
const { reconcileInfrastructure } = require('../src/services/reconciliation.service');

async function run() {
  await connectDB();
  await Promise.all([connectRedis(), connectSearch()]);
  console.log(await reconcileInfrastructure());
  await closeRedis();
  await require('mongoose').disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
