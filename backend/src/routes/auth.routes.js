const express = require('express')
const router = express.Router();

const {registerUser,loginUser,logoutUser,registerFoodPartner,loginFoodPartner,logoutFoodPartner} = require('../controllers/auth.controller');
//USER auth api
router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/logout', logoutUser);

//FOOD PARTNER auth api
router.post('/food-partner/register', registerFoodPartner);
router.post('/food-partner/login', loginFoodPartner);
router.get('/food-partner/logout', logoutFoodPartner);


module.exports=router;