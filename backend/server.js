require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');
const config = require('./src/config');
const { connectMySQL } = require('./src/db/mysql');
const { connectRedis, closeRedis } = require('./src/services/redis.service');
const { connectSearch } = require('./src/services/search.service');
const { reconcileInfrastructure } = require('./src/services/reconciliation.service');
const { startInfrastructureSync, stopInfrastructureSync } = require('./src/jobs/infrastructure-sync.job');

async function startServer() {
  await connectDB();
  await connectMySQL();
  await Promise.all([connectRedis(), connectSearch()]);
  await reconcileInfrastructure();
  startInfrastructureSync();
  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });

  const shutdown = async () => {
    stopInfrastructureSync();
    server.close();
    await Promise.allSettled([
      closeRedis(),
      require('./src/services/search.service').closeSearch(),
      require('./src/db/mysql').closeMySQL(),
      require('mongoose').disconnect(),
    ]);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
