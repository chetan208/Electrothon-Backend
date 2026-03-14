import { Router } from "express";
import { login, registerStudent, setPassword, verifyOTP } from "../controllers/auth.js";

const router = Router();

router.post('/register', registerStudent);

router.post('/verify-otp/:email', verifyOTP)

router.post('/set-password', setPassword)

router.post('/login', login)




export default router;