const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  image: String,
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" },
  items: [cartItemSchema],
  totalAmount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);