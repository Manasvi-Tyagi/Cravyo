const UserModel = require('../models/user.model');
const FoodPartnerModel = require('../models/foodPartner.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req,res){
    const {name,email,password} = req.body;
    const ifUserExist = await UserModel.findOne({email});

    if(ifUserExist){
        return res.status(400).json({message:"User already exist"});
    }
    const hashedPassword=await bcrypt.hash(password,10);//hashing password with bcrypt important for security in case of data breach
    const user =await UserModel.create({name,email,password:hashedPassword});

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET);//creating token with user id and secret key 
    res.cookie('token',token)
    res.status(201).json({message:"User registered successfully",user:{id:user._id,name:user.name,email:user.email}});
}
async function loginUser(req,res){
    const {email,password}=req.body;

    const user = await UserModel.findOne({email});
    if(!user){res.status(400).json({message:"Invalid email or password"});}
    
    const isPasswordValid = await bcrypt.compare(password,user.password);
    if(!isPasswordValid){res.status(400).json({message:"Invalid email or password"});} //why bcrypt.compare

    const token = jwt.sign({id:user._id},process.env.JWT_SECRET);//creating token with user id and secret key from env file for security
    res.cookie('token',token);
    res.status(200).json({message:"User logged in successfully",user:{id:user._id,name:user.name,email:user.email}});
}
function logoutUser(req,res){
    res.clearCookie('token');
    res.status(200).json({message:"User logged out successfully"});
}
async function registerFoodPartner(req,res){
    const {name,contactName,phone,address,email,password} = req.body;
    const ifFoodPartnerExist = await FoodPartnerModel.findOne({email});

    if(ifFoodPartnerExist){
        return res.status(400).json({message:"Food Partner already exist"});
    }
    const hashedPassword=await bcrypt.hash(password,10);//hashing password with bcrypt important for security in case of data breach
    const FoodPartner =await FoodPartnerModel.create({name,contactName,phone,address,email,password:hashedPassword});

    const token = jwt.sign({id:FoodPartner._id},process.env.JWT_SECRET);//creating token with FoodPartner id and secret key 
    res.cookie('token',token)
    res.status(201).json({message:"Food Partner registered successfully",FoodPartner:{id:FoodPartner._id,name:FoodPartner.name,email:FoodPartner.email}});
}
async function loginFoodPartner(req,res){
    const {email,password}=req.body;

    const FoodPartner = await FoodPartnerModel.findOne({email});
    if(!FoodPartner){res.status(400).json({message:"Invalid email or password"});}
    
    const isPasswordValid = await bcrypt.compare(password,FoodPartner.password);
    if(!isPasswordValid){res.status(400).json({message:"Invalid email or password"});} //why bcrypt.compare

    const token = jwt.sign({id:FoodPartner._id},process.env.JWT_SECRET);//creating token with FoodPartner id and secret key from env file for security
    res.cookie('token',token);
    res.status(200).json({message:"FoodPartner logged in successfully",FoodPartner:{id:FoodPartner._id,name:FoodPartner.name,email:FoodPartner.email}});
}
function logoutFoodPartner(req,res){
    res.clearCookie('token');
    res.status(200).json({message:"FoodPartner logged out successfully"});
}
module.exports={registerUser,loginUser,logoutUser,registerFoodPartner,loginFoodPartner,logoutFoodPartner};