const foodModel=require('../models/food.model');
const {authFoodPartnerMiddleware}=require('../middlewares/auth.middleware');
const {uploadFileToImageKit}=require('../services/storage.services');
const {v4:uuid}=require('uuid');

//controller fro uploading video ,description name of food item by food partner
async function createFood(req, res) {
    console.log("foodPartner:",req.foodPartner);
    console.log("body:",req.body);
    console.log("file:",req.file);

    const fileUploadResult = await uploadFileToImageKit(req.file.buffer,uuid() + "-" + req.file.originalname);
    //why req.file.buffer to access the file data in memory, which is necessary because we configured multer to store uploaded files in memory using memoryStorage. This allows us to handle the file data directly without needing to manage file storage on the server, making it easier to process the file (e.g., uploading it to a cloud storage service) before saving any relevant information to the database.
    //why uuid() to generate a unique identifier for the uploaded file, which can be used as part of the file name when uploading to ImageKit. This helps to ensure that each uploaded file has a unique name, preventing potential conflicts or overwriting of files with the same name in the storage service.
    const foodItem=await foodModel.create({
        name:req.body.name,
        description:req.body.description,
        video:fileUploadResult.url,
        foodPartner:req.foodPartner._id
    })    
    console.log("foodItem:",foodItem);
    
    //creating a new food item in the database using the foodModel, where we set the name and description from the request body, the video URL from the result of the file upload to ImageKit, and associate it with the food partner's ID from the request (which is set by the authFoodPartnerMiddleware). This allows us to store all relevant information about the food item in our database for later retrieval and use in our application.

     //console.log(fileUploadResult);   
    res.status(201).json({ message: 'Food created successfully', food: foodItem });
}

async function getFoodItems(req,res){
    const foodItems=await foodModel.find({})
    res.status(200).json({ message: 'Food items retrieved successfully', food: foodItems });
}
module.exports={createFood, getFoodItems};
