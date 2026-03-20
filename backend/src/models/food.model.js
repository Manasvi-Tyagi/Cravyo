const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true,
    },
    video:{
        type:String,
        required:true,
    },//to store the video URL or path for the food item, which can be used to display a video demonstration of the food preparation or presentation on the frontend.because file uploads can be complex to handle, especially when dealing with videos, it's often easier to store the video on a separate service (like AWS S3, Cloudinary, etc.) and save the URL in the database. This way, you can manage video storage and delivery more efficiently without burdening your server with large file handling.
    description: {
        type: String
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"FoodPartner",

    }
    ,likeCount:{
        type:Number,
        default:0
    }
    ,saveCount:{
        type:Number,
        default:0
    }

})
module.exports = mongoose.model('Food', foodSchema);