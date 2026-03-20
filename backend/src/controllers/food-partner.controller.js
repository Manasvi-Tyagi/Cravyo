const foodPartnerModel=require('../models/foodPartner.model');
const foodModel=require('../models/food.model');

async function getFoodPartnerById(req,res){
    const foodPartnerId=req.params.id;
    const foodPartner=await foodPartnerModel.findById(foodPartnerId);
    const foodItemsByFoodPartner=await foodModel.find({foodPartner:foodPartnerId});
    //foodPartner.foodItems=foodItemsByFoodPartner; //why this is needed because we want to include the food items associated with the food partner in the response when retrieving the food partner's details. By adding the food items to the foodPartner object, we can provide a more comprehensive response that includes not only the food partner's information but also the relevant food items they offer, which can be useful for customers when viewing the food partner's profile or menu.
    if(!foodPartner){
        return res.status(404).json({message:"Food Partner not found"});
    }
    res.status(200).json({message:"Food Partner retrieved successfully", foodPartner: {
            ...foodPartner.toObject(),
            foodItems: foodItemsByFoodPartner
        }});
}

module.exports={getFoodPartnerById};