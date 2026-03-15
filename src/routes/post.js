import { Router } from "express";   
import { checkAuthMiddelware } from "../services/middelwares.js";
import { addPost, fetchMyPosts, getFeed } from "../controllers/post.js";
import upload from "../config/upload.js";
import { notifyFriendPost } from "../utils/notificationHelper.js";
import mongoose from "mongoose";
import PostModel from "../model/postModel.js";



const router = Router();

router.post('/add',checkAuthMiddelware, upload.array('images[]') ,addPost)

router.get('/fetch',checkAuthMiddelware, getFeed)

router.get('/fetch-my-posts',checkAuthMiddelware, fetchMyPosts)

router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
 
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: "Invalid postId" });
    }
 
    const post = await PostModel.findById(postId)
      .populate("createdBy", "name avatar branch headline _id")
      .lean();
 
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
 
    res.json({ success: true, post });
  } catch (err) {
    console.error("[post detail] ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});



export default router;