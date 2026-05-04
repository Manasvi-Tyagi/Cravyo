const express = require('express');
const router = express.Router();
const { authCustomerMiddleware } = require('../middlewares/auth.middleware');
const { addToCart, getCart, removeFromCart, updateCartItem, clearCart } = require('../controllers/cart.controller');

router.use(authCustomerMiddleware);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/update', updateCartItem);
router.delete('/item/:productId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;