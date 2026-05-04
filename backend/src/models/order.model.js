const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: String,
  quantity: { type: Number, required: true, min: 1 },
});

const ORDER_STATUS = ["PLACED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ORDER_STATUS, default: "PLACED" },
  deliveryAddress: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);