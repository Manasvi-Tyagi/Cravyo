const express = require('express')
const router = express.Router();

const {registerUser,loginUser,logoutUser,getCurrentUser,registerFoodPartner,loginFoodPartner,logoutFoodPartner,getCurrentFoodPartner} = require('../controllers/auth.controller');
const { authFoodPartnerMiddleware } = require('../middlewares/auth.middleware');
//USER auth api
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);
router.get('/user/me', require('../middlewares/auth.middleware').authCustomerMiddleware, getCurrentUser);

//FOOD PARTNER auth api
router.post('/food-partner/register', registerFoodPartner);
router.post('/food-partner/login', loginFoodPartner);
router.get('/food-partner/me', authFoodPartnerMiddleware, getCurrentFoodPartner);
router.get('/food-partner/logout', logoutFoodPartner);


module.exports=router;