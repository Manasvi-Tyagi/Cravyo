require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');
const config = require('./src/config');
const { connectMySQL } = require('./src/db/mysql');

async function startServer() {
  await connectDB();
  await connectMySQL();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
