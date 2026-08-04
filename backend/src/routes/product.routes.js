const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authMerchantMiddleware, authCustomerMiddleware, authCustomerOrMerchantMiddleware, optionalAuthActorMiddleware } = require('../middlewares/auth.middleware');
const {
  createProduct, getProducts, getProductById,
  likeProduct, saveProduct,
  getLikedProducts, getSavedProducts,
  addComment, getComments, deleteComment, editComment, likeComment,
} = require('../controllers/product.controller');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

// Public
router.get('/feed', getProducts);

// Customer auth required
router.post('/like', authCustomerMiddleware, likeProduct);
router.post('/save', authCustomerMiddleware, saveProduct);
router.get('/liked', authCustomerMiddleware, getLikedProducts);
router.get('/saved', authCustomerMiddleware, getSavedProducts);

// Comments
router.post('/comment', authCustomerOrMerchantMiddleware, addComment);
// Comments — GET is public, write actions require auth
router.get('/comment/:productId', optionalAuthActorMiddleware, getComments);
router.delete('/comment/:commentId', authCustomerOrMerchantMiddleware, deleteComment);
router.patch('/comment/:commentId', authCustomerOrMerchantMiddleware, editComment);
router.post('/comment/like', authCustomerOrMerchantMiddleware, likeComment);

// Merchant auth required
router.post('/create', authMerchantMiddleware, upload.single('video'), createProduct);

// Public: get single product by ID (must be last to avoid swallowing named routes)
router.get('/:id', getProductById);

module.exports = router;
