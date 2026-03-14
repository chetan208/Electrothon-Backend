import { Router } from "express";
import { login, logout, registerStudent, setPassword, verifyOTP } from "../controllers/auth.js";

const router = Router();

router.post('/register', registerStudent);

router.post('/verify-otp/:email', verifyOTP)

router.post('/set-password', setPassword)

router.post('/login', login)

router.post('/logout', logout )




export default router;