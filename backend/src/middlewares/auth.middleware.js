const foodPartnerModel = require('../models/foodPartner.model');
const foodPartner = require('../models/foodPartner.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authFoodPartnerMiddleware(req,res,next){
    const token = req.cookies.token;
    if(!token){return res.status(401).json({message:"Unauthorized : Please login or Register first "})} //why token in cookies because we are storing the JWT token in cookies for authentication, so we need to check if the token exists in the incoming request's cookies to verify the user's identity and grant access to protected routes.
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET) ;//why jwt.verify to verify the token's authenticity and integrity using the secret key from the environment variables, ensuring that the token is valid and has not been tampered with. if verified successfully it will return the decoded payload which contains the user id.if fails it will throw an error which we catch in catch block.
        const foodPartner= await foodPartnerModel.findById(decoded.id);//why findById to find the food partner in the database using the id extracted from the decoded token, which allows us to retrieve the food partner's information and attach it to the request object for use in subsequent middleware or route handlers.
        req.foodPartner=foodPartner;//creating new prp in req.....why attach food partner to request object to make the authenticated food partner's information available in the request object, allowing subsequent middleware or route handlers to access the food partner's details and perform actions based on their identity and permissions.
        next(); //why next() to pass control to the next middleware function or route handler in the Express.js request-response cycle, allowing the request to proceed to the intended destination after successful authentication.
    }catch(err){
        return res.status(401).json({message:"invalid token"});
    }
}

async function authCustomerMiddleware(req,res,next){
    // Similar implementation as authFoodPartnerMiddleware but for customers
    const token = req.cookies.token; 
    if(!token){return res.status(401).json({message:"Unauthorized : Please login or Register first "})}
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET) ;
        const customer= await userModel.findById(decoded.id);
        req.customer=customer;
        next();
    }catch(err){
        return res.status(401).json({message:"invalid token"});
    }
}
module.exports={authFoodPartnerMiddleware, authCustomerMiddleware};