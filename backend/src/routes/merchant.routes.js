const express = require('express');
const router = express.Router();
const { authMerchantMiddleware, authCustomerMiddleware } = require('../middlewares/auth.middleware');
const { getMerchantById } = require('../controllers/merchant.controller');
const { getMerchantOrders, updateOrderStatus } = require('../controllers/order.controller');

// Merchant: their own orders dashboard (must be before /:id to avoid conflict)
router.get('/orders/all', authMerchantMiddleware, getMerchantOrders);
router.patch('/orders/:orderId/status', authMerchantMiddleware, updateOrderStatus);

// Public / customer: get merchant profile + products
router.get('/:id', getMerchantById);

module.exports = router;
