import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();
router.get('/', auth, authorize('faculty', 'admin'), getUsers);
router.patch('/:id/role', auth, authorize('faculty', 'admin'), updateUserRole);
export default router;
