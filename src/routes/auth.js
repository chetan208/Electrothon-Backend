import { Router } from "express";
import { registerStudent } from "../controllers/auth.js";

const router = Router();

router.post('/register', registerStudent);


export default router;