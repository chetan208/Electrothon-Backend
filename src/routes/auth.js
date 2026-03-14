import { Router } from "express";
import { login, logout, registerStudent, setPassword, verifyOTP } from "../controllers/auth.js";
import { checkAuthMiddelware } from "../services/middelwares.js";

const router = Router();

router.post('/register', registerStudent);

router.post('/verify-otp/:email', verifyOTP)

router.post('/set-password', setPassword)

router.post('/login', login)

router.post('/logout', logout )

router.get('/check-auth',checkAuthMiddelware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated",
        student: req.student
    });
})


export default router;