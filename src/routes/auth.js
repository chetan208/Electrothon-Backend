import { Router } from "express";
import { registerStudent, verifyOTP } from "../controllers/auth.js";

const router = Router();

router.post('/register', registerStudent);

router.post('/verify-otp/:email', verifyOTP);


export default router;