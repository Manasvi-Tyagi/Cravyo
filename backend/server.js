require('dotenv').config();//to load environment variables from .env file into process.env, which is essential for keeping sensitive information like JWT secrets out of the source code and allowing for different configurations in development and production environments.

//start server //db conected here
const app = require('./src/app');
const connectDB = require('./src/db/db');

connectDB();
app.listen(1234,()=>{
    console.log("server is running at port 1234");
});