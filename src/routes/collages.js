import {Router} from 'express';
import { addCollage, getCollages } from '../controllers/collage.js';
const router = Router();


router.post('/add', addCollage);

router.get('/get', getCollages);

export default router;