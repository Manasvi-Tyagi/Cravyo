const express=require('express');
const router=express.Router();

const {getFoodPartnerById,}=require('../controllers/food-partner.controller');

router.get('/:id', getFoodPartnerById)

module.exports=router;