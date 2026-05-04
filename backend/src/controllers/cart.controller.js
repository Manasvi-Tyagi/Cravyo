const cartModel = require('../models/cart.model');
const ProductModel = require('../models/product.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const addToCart = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;
  const { productId, quantity = 1 } = req.body;

  const product = await ProductModel.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  let cart = await cartModel.findOne({ customerId });

  if (!cart) {
    cart = await cartModel.create({ customerId, merchantId: product.merchant, items: [], totalAmount: 0 });
  }

  const existingItem = cart.items.find((item) => item.productId.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, name: product.name, price: product.price, image: product.image, quantity });
  }

  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();

  res.status(200).json(new ApiResponse(200, { cart }, "Item added to cart"));
});

const getCart = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;
  const cart = await cartModel.findOne({ customerId });

  if (!cart) return res.status(200).json(new ApiResponse(200, { cart: { items: [], totalAmount: 0 } }));
  res.status(200).json(new ApiResponse(200, { cart }));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;
  const { productId } = req.params;

  const cart = await cartModel.findOne({ customerId });
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
  cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  await cart.save();

  res.status(200).json(new ApiResponse(200, { cart }, "Item removed"));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;
  const { productId, quantity } = req.body;

  const cart = await cartModel.findOne({ customerId });
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) throw new ApiError(404, "Item not in cart");

  item.quantity = quantity;
  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  await cart.save();

  res.status(200).json(new ApiResponse(200, { cart }, "Cart updated"));
});

const clearCart = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;
  await cartModel.findOneAndDelete({ customerId });
  res.status(200).json(new ApiResponse(200, null, "Cart cleared"));
});

module.exports = { addToCart, getCart, removeFromCart, updateCartItem, clearCart };