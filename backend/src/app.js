//create server 
const express=require('express');
const app=express();  
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
//middleware to parse json data from request body

const cors = require('cors');
app.use(cors({origin:'http://localhost:5173',credentials:true})); //why this is needed because we want to allow cross-origin requests from our frontend (running on http://localhost:5173) to our backend (running on a different port, e.g., http://localhost:1234). This is essential for enabling communication between the frontend and backend during development, allowing us to make API calls from the React application to the Express server without running into CORS (Cross-Origin Resource Sharing) issues. The credentials: true option allows cookies (such as authentication tokens) to be included in cross-origin requests, which is important for maintaining user sessions and authentication state across the frontend and backend.


const cookieParser = require('cookie-parser');
app.use(cookieParser());//middleware to parse cookies from incoming requests, which is essential for handling authentication tokens stored in cookies.

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth',authRoutes);// why this is needed because we want to prefix all auth routes with /api for better organization and to avoid potential route conflicts in the future as our application grows. It also helps to clearly indicate that these routes are part of our API, making it easier for developers to understand the structure of our backend.

const foodRoutes = require('./routes/food.routes');
app.use('/api/food',foodRoutes);// why this is needed because we want to prefix all food routes with /api for better organization and to avoid potential route conflicts in the future as our application grows. It also helps to clearly indicate that these routes are part of our API, making it easier for developers to understand the structure of our backend.

const foodPartnerRoutes = require('./routes/food-partner.routes');
app.use('/api/food-partner',foodPartnerRoutes);// why this is needed because we want to prefix all food partner routes with /api for better organization and to avoid potential route conflicts in the future as our application grows. It also helps to clearly indicate that these routes are part of our API, making it easier for developers to understand the structure of our backend.
app.get('/',(req,res)=>{
    res.send("Hello World");
});

module.exports=app;
