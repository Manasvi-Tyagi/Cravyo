require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/db/db');
const config = require('./src/config');

connectDB();
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});