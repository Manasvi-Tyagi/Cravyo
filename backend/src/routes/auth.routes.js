const express = require('express')
const router = express.Router();

const {
  registerUser, loginUser, logoutUser, getCurrentUser,
  registerMerchant, loginMerchant, logoutMerchant, getCurrentMerchant,
  refreshAccessToken,
} = require('../controllers/auth.controller');
const { authCustomerMiddleware, authMerchantMiddleware } = require('../middlewares/auth.middleware');

// ── CUSTOMER ──────────────────────────────────────────────────────────────────
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);
router.get('/user/me', authCustomerMiddleware, getCurrentUser);

// ── MERCHANT ──────────────────────────────────────────────────────────────────
router.post('/merchant/register', registerMerchant);
router.post('/merchant/login', loginMerchant);
router.get('/merchant/logout', logoutMerchant);
router.get('/merchant/me', authMerchantMiddleware, getCurrentMerchant);

// Backward compat: old food-partner paths still work
router.post('/food-partner/register', registerMerchant);
router.post('/food-partner/login', loginMerchant);
router.get('/food-partner/logout', logoutMerchant);
router.get('/food-partner/me', authMerchantMiddleware, getCurrentMerchant);

// ── REFRESH ───────────────────────────────────────────────────────────────────
router.post('/refresh', refreshAccessToken);

module.exports = router;