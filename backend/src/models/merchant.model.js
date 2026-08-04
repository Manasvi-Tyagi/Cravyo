const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    restaurantName: { type: String, trim: true },
    image: { type: String },
    refreshToken: { type: String },
    authProvider: { type: String, enum: ['mongodb', 'mysql'], default: 'mongodb' },
    externalAuthId: { type: String, sparse: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Merchant", merchantSchema);
