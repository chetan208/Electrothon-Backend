import { Router } from "express";   
import { checkAuthMiddelware } from "../services/middelwares.js";
import { addPost } from "../controllers/post.js";
import upload from "../config/upload.js";

const router = Router();

router.post('/add',checkAuthMiddelware, upload.array('images') ,addPost)

export default router;