import {Router} from 'express';
import { completeStudentProfile, getStudentDetails } from '../controllers/profile.js';
import upload from '../config/upload.js';
import { checkAuthMiddelware } from '../services/middelwares.js';

const router = Router();

// api/profile/complete-profile/:email

router.post("/complete-profile/:studentId",upload.single("avatar"), completeStudentProfile);
router.get('/fetch-student', checkAuthMiddelware, getStudentDetails);

export default router;