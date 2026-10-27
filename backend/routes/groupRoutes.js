import { Router } from 'express';
import {
  listGroups, createGroup, getGroup, addMember, deleteGroup,
} from '../controllers/groupController.js';
import { protect } from '../middlewares/auth.js';
import { loadGroup } from '../middlewares/groupAccess.js';
import expenseRoutes from './expenseRoutes.js';

const router = Router();
router.use(protect);

router.route('/').get(listGroups).post(createGroup);
router.route('/:id').get(loadGroup, getGroup).delete(loadGroup, deleteGroup);
router.post('/:id/members', loadGroup, addMember);
router.use('/:id/expenses', loadGroup, expenseRoutes);

export default router;
