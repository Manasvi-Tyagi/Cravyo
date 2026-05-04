const OrderModel = require('../models/order.model');
const CartModel = require('../models/cart.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// Customer: place order from current cart
const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.customer._id;
  const { deliveryAddress } = req.body;

  const cart = await CartModel.findOne({ customerId });
  if (!cart || cart.items.length === 0) throw new ApiError(400, "Cart is empty");

  const order = await OrderModel.create({
    customerId,
    merchantId: cart.merchantId,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    })),
    totalAmount: cart.totalAmount,
    deliveryAddress,
  });

  await CartModel.findOneAndDelete({ customerId });

  res.status(201).json(new ApiResponse(201, { order }, "Order placed successfully"));
});

// Customer: view their orders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.find({ customerId: req.customer._id })
    .populate('merchantId', 'name restaurantName image')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { orders }));
});

// Customer: cancel their own order
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await OrderModel.findOne({ _id: orderId, customerId: req.customer._id });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.status !== 'PLACED') throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);

  order.status = 'CANCELLED';
  await order.save();
  res.status(200).json(new ApiResponse(200, { order }, "Order cancelled"));
});

// Merchant: view incoming orders
const getMerchantOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.find({ merchantId: req.merchant._id })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { orders }));
});

// Merchant: update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const VALID = ['PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!VALID.includes(status)) throw new ApiError(400, `Invalid status. Choose from: ${VALID.join(', ')}`);

  const order = await OrderModel.findOne({ _id: orderId, merchantId: req.merchant._id });
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;
  await order.save();
  res.status(200).json(new ApiResponse(200, { order }, "Order status updated"));
});

module.exports = { placeOrder, getMyOrders, cancelOrder, getMerchantOrders, updateOrderStatus };