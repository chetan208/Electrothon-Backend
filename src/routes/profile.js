import {Router} from 'express';
import { completeStudentProfile, getStudentDetails } from '../controllers/profile.js';
import upload from '../config/upload.js';

const router = Router();

// api/profile/complete-profile/:email

router.post("/complete-profile/:studentId",upload.single("avatar"), completeStudentProfile);
router.get('/fetch-student/:email', getStudentDetails)

export default router;