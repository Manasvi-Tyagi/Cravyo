const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    videoUrl: { type: String },
    image: { type: String },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    tags: {
      cuisine: { type: String },
      ingredients: [{ type: String }],
      dietary: [{ type: String }],
      mood: [{ type: String }],
      aiGenerated: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
