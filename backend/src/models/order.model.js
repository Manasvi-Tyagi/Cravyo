const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  items: [],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["PLACED", "PREPARING", "DELIVERED"],
    default: "PLACED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);