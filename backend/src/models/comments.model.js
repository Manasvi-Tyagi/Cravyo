const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    actorId: { type: String, index: true },
    actorType: { type: String, enum: ["customer", "merchant"], default: "customer" },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    likeCount: {
        type: Number,
        default: 0
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    likedByActors: [{
        actorId: { type: String, required: true },
        actorType: { type: String, enum: ["customer", "merchant"], required: true }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("Comment", commentSchema);
