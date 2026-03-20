const express=require('express');
const router=express.Router();

const {authFoodPartnerMiddleware, authCustomerMiddleware}=require('../middlewares/auth.middleware');
const {getFoodPartnerById,}=require('../controllers/food-partner.controller');

router.get('/:id',authCustomerMiddleware,getFoodPartnerById)

module.exports=router;