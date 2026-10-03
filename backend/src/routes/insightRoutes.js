import { Router } from 'express';
import { getInsights, generateAIInsights } from '../controllers/insightController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();
router.get('/', auth, authorize('faculty', 'admin'), getInsights);
router.post('/generate', auth, authorize('faculty', 'admin'), generateAIInsights);
export default router;
