import { Router } from "express";   
import { checkAuthMiddelware } from "../services/middelwares.js";
import { addPost, fetchMyPosts, getFeed } from "../controllers/post.js";
import upload from "../config/upload.js";
import { notifyFriendPost } from "../utils/notificationHelper.js";

const router = Router();

router.post('/add',checkAuthMiddelware, upload.array('images[]') ,addPost)

router.get('/fetch',checkAuthMiddelware, getFeed)

router.get('/fetch-my-posts',checkAuthMiddelware, fetchMyPosts)



export default router;