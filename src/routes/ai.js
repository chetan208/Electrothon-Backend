import {Router} from 'express';
import { opportunityRecomendation } from '../controllers/aiAgent.js';

const router = Router();

router.get('/opportunity-recommendation', opportunityRecomendation)

export default router;