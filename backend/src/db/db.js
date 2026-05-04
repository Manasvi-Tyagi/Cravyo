const mongoose = require('mongoose');
const config = require('../config');

function connectDB() {
    mongoose.connect(config.mongoUri)
        .then(() => console.log("Connected to database"))
        .catch((err) => {
            console.error("Database connection error:", err);
            process.exit(1);
        });
}
module.exports = connectDB;