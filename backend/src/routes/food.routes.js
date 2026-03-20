const express=require('express');
const router=express.Router();
const {createFood,getFoodItems,likefood,savefood}=require('../controllers/food.controller');
const {authFoodPartnerMiddleware, authCustomerMiddleware}=require('../middlewares/auth.middleware');
const multer=require('multer');
const upload=multer({storage: multer.memoryStorage(),limits: { fileSize: 50 * 1024 * 1024 }})//multer middleware to handle file uploads, specifying the destination folder for uploaded files as 'uploads/'.
// In this case, we are configuring multer to store uploaded files in memory (using memoryStorage) instead of saving them to disk. This allows us to handle the file data directly in our controller without needing to manage file storage on the server, which can be useful for processing the file (e.g., uploading it to a cloud storage service) before saving any relevant information to the database.

// /api/food [protected route for food partners to add food items]=>middleware to ensure that only authorized food partners can access this route and perform the action of creating a food item, enhancing the security of the application by preventing unauthorized access to sensitive operations.
//first authFoodPartnerMiddleware will check if the request has a valid token and if the food partner is authenticated, then it will allow the request to proceed (next()) to the createFood controller function which will handle the logic for creating a new food item in the database.
//middleware is providing req.foodPartner which contains the authenticated food partner's information, allowing the createFood controller to access details about the food partner who is creating the food item, such as their ID or name, which can be useful for associating the food item with the correct food partner in the database.
router.post('/',
    authFoodPartnerMiddleware,
    upload.single('videos'),
    createFood)
//why upload.single('videos')? because we are expecting a single file upload with the field name 'videos' in the incoming request. This middleware will handle the file upload process, allowing us to access the uploaded file's data in our controller through req.file, which is essential for processing the file (e.g., uploading it to a cloud storage service) before saving any relevant information to the database.

//get /api/food => to get all food items (for customers to view and order from)
router.get('/',authCustomerMiddleware,getFoodItems)
//get /api/food/food-partner/:id => to get details of a specific food item (for customers to view and order from)

//put /api/food/:id => to update details of a specific food item (for food partners to manage their food items)
//delete /api/food/:id => to delete a specific food item (for food partners to manage their food items)

router.post('/like',authCustomerMiddleware,likefood);
router.post('/save',authCustomerMiddleware,savefood);

module.exports=router;