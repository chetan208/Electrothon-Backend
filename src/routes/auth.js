import { Router } from "express";
<<<<<<< HEAD
import { registerStudent, verifyOTP } from "../controllers/auth.js";
=======
import { login, registerStudent, setPassword, verifyOTP } from "../controllers/auth.js";
>>>>>>> cdec2edcc466e2bda5715260c1a0f0a0679787f5

const router = Router();

router.post('/register', registerStudent);

<<<<<<< HEAD
router.post('/verify-otp/:email', verifyOTP);
=======
router.post('/verify-otp/:email', verifyOTP)

router.post('/set-password', setPassword)

router.post('/login', login)


>>>>>>> cdec2edcc466e2bda5715260c1a0f0a0679787f5


export default router;