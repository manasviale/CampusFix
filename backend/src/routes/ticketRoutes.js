import { Router } from 'express';
import { getTickets, getTicket, createTicket, updateTicket, deleteTicket, checkDuplicateTicket } from '../controllers/ticketController.js';
import { toggleUpvote } from '../controllers/upvoteController.js';
import auth from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.get('/', auth, getTickets);
router.post('/check-duplicate', auth, checkDuplicateTicket);
router.get('/:id', auth, getTicket);
router.post('/', auth, authorize('volunteer', 'admin'), upload.single('image'), createTicket);
router.patch('/:id', auth, authorize('admin'), updateTicket);
router.delete('/:id', auth, authorize('admin'), deleteTicket);
router.post('/:id/upvote', auth, toggleUpvote);
router.post('/:id/affected', auth, toggleUpvote);
export default router;
