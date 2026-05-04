const express = require('express');
const router = express.Router();
const { authCustomerMiddleware } = require('../middlewares/auth.middleware');
const { placeOrder, getMyOrders, cancelOrder } = require('../controllers/order.controller');

router.use(authCustomerMiddleware);

router.post('/place', placeOrder);
router.get('/my', getMyOrders);
router.patch('/:orderId/cancel', cancelOrder);

module.exports = router;