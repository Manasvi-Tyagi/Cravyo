const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const foodModel=require('../models/food.model');
const {authFoodPartnerMiddleware}=require('../middlewares/auth.middleware');
const {uploadFileToImageKit}=require('../services/storage.services');
const {v4:uuid}=require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);
const likeModel=require("../models/likes.model.js")
const saveModel=require("../models/save.model.js")
const commentModel = require("../models/comments.model.js");

async function getLikedFoods(req,res) {
    //const userId = req.user._id;
    const customer = req.customer;
if (!customer) {
   return res.status(401).json({
      success: false,
      message: "Customer not authenticated"
   });
}
    const likes = await likeModel.find({ user: customer._id }).populate('food');
    const foods = likes.map(like => like.food).filter(f => f !== null);
    res.status(200).json({ message: 'Liked foods retrieved successfully', foods });
}

async function getSavedFoods(req,res) {
    // const userId = req.user._id;
    const customer = req.customer;
if (!customer) {
   return res.status(401).json({
      success: false,
      message: "Customer not authenticated"
   });
}
    const saves = await saveModel.find({ user: customer._id }).populate('food');
    const foods = saves.map(save => save.food).filter(f => f !== null);
    res.status(200).json({ message: 'Saved foods retrieved successfully', foods });
}
//controller fro uploading video ,description name of food item by food partner
async function createFood(req, res) {
    try {
        console.log("foodPartner:", req.foodPartner);
        console.log("body:", req.body);
        console.log("file:", req.file);

        const inputFilePath = path.join(os.tmpdir(), `${uuid()}-input-${req.file.originalname}`);
        const outputFilePath = path.join(os.tmpdir(), `${uuid()}-compressed-${req.file.originalname}`);

        await fs.writeFile(inputFilePath, req.file.buffer);

        await new Promise((resolve, reject) => {
            ffmpeg(inputFilePath)
                .outputOptions([
                    '-c:v libx264',
                    '-preset medium',
                    '-crf 28',
                    '-c:a aac',
                    '-b:a 128k',
                    '-movflags +faststart'
                ])
                .output(outputFilePath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        const compressedBuffer = await fs.readFile(outputFilePath);
        const fileUploadResult = await uploadFileToImageKit(compressedBuffer, uuid() + "-" + req.file.originalname);

        await fs.rm(inputFilePath, { force: true });
        await fs.rm(outputFilePath, { force: true });

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id
        });

        console.log("foodItem:", foodItem);
        res.status(201).json({ message: 'Food created successfully', food: foodItem });
    } catch (error) {
        console.error('Error creating food:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getFoodItems(req,res){
    const foodItems=await foodModel.find({})
    res.status(200).json({ message: 'Food items retrieved successfully', food: foodItems });
}
async function likefood(req,res) {
    const {foodId}=req.body;
    const user = req.customer;
    
    const isLiked=await likeModel.findOne({
        user:user._id,food:foodId
    })
    if(isLiked){
        await likeModel.deleteOne({
             user:user._id,food:foodId
        })
    await foodModel.findByIdAndUpdate(foodId,{$inc:{likeCount:-1}})

    res.status(201).json({message:'Food Unliked succesfully'})
    }
    const like=await likeModel.create({
        user:user._id,food:foodId
    
    })
    await foodModel.findByIdAndUpdate(foodId,{$inc:{likeCount:1}})
    res.status(201).json({message:"Food Liked Successfully",like})
}
async function savefood(req,res) {
    const {foodId}=req.body;
    const user=req.user;
    
    const isSaved=await saveModel.findOne({
        user:user._id,food:foodId
    })
    if(isSaved){
        await saveModel.deleteOne({
             user:user._id,food:foodId
        })
   await foodModel.findByIdAndUpdate(foodId,{$inc:{saveCount:-1}})

    res.status(201).json({message:'Food Unsaved succesfully'})
    }
    const save=await saveModel.create({
        user:user._id,food:foodId
    
    })
   await foodModel.findByIdAndUpdate(foodId,{$inc:{saveCount:1}})
    res.status(201).json({message:"Food Saved Successfully",save})
}

async function addComment(req, res) {
    try {
        const { foodId, text } = req.body;
        const userId = req.user._id;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment cannot be empty"
            });
        }

        const food = await foodModel.findById(foodId);
        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        const comment = await commentModel.create({
            user: userId,
            food: foodId,
            text
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { commentCount: 1 }
        });

        const populatedComment = await commentModel.findById(comment._id)
            .populate("user", "name profileImage");

        return res.status(201).json({
            message: "Comment added successfully",
            comment: populatedComment
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function getComments(req, res) {
    try {
        const { foodId } = req.params;
        const userId = req.user._id;

        const comments = await commentModel.find({
            food: foodId
        })
        .populate("user", "name profileImage")
        .sort({ createdAt: -1 });

        // Add isLikedByUser field to each comment
        const commentsWithLikeStatus = comments.map(comment => ({
            ...comment.toObject(),
            isLikedByUser: comment.likedBy.includes(userId)
        }));

        return res.status(200).json({
            comments: commentsWithLikeStatus
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
async function deleteComment(req, res) {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await commentModel.findOne({
            _id: commentId,
            user: userId
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        await commentModel.deleteOne({
            _id: commentId
        });

        await foodModel.findByIdAndUpdate(comment.food, {
            $inc: { commentCount: -1 }
        });

        return res.status(200).json({
            message: "Comment deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function editComment(req, res) {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || !text.trim()) {
            return res.status(400).json({
                message: "Comment text cannot be empty"
            });
        }

        const comment = await commentModel.findOne({
            _id: commentId,
            user: userId
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found or you don't have permission to edit it"
            });
        }

        comment.text = text.trim();
        await comment.save();

        const updatedComment = await commentModel.findById(commentId)
            .populate("user", "name profileImage");

        return res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function likeComment(req, res) {
    try {
        const { commentId } = req.body;
        const userId = req.user._id;

        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                message: "Comment not found"
            });
        }

        const userLikedIndex = comment.likedBy.indexOf(userId);
        let isLiked = false;
        let message = "";

        if (userLikedIndex > -1) {
            // User already liked, so unlike
            comment.likedBy.splice(userLikedIndex, 1);
            comment.likeCount = Math.max(0, comment.likeCount - 1);
            message = "Comment unliked successfully";
        } else {
            // User hasn't liked, so like
            comment.likedBy.push(userId);
            comment.likeCount += 1;
            isLiked = true;
            message = "Comment liked successfully";
        }

        await comment.save();

        return res.status(200).json({
            message,
            isLiked,
            likeCount: comment.likeCount
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports={createFood, getFoodItems,likefood,savefood,getLikedFoods,getSavedFoods,addComment,getComments,deleteComment,editComment,likeComment};
