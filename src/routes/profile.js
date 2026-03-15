import {Router} from 'express';
import { completeStudentProfile, connectWithStudent, getStudentDetails } from '../controllers/profile.js';
import upload from '../config/upload.js';
import { checkAuthMiddelware } from '../services/middelwares.js';
import { connect } from 'mongoose';

const router = Router();

// api/profile/complete-profile/:email

router.post("/complete-profile/:studentId",upload.single("avatar"), completeStudentProfile);

router.get('/me', checkAuthMiddelware, getStudentDetails);

router.get('/connect/:studentId', checkAuthMiddelware, connectWithStudent);

export default router;