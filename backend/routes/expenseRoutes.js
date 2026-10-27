import { Router } from 'express';
import { addExpense, updateExpense, deleteExpense } from '../controllers/expenseController.js';

// Mounted at /api/groups/:id/expenses (protect + loadGroup already ran)
const router = Router({ mergeParams: true });
router.post('/', addExpense);
router.route('/:expenseId').put(updateExpense).delete(deleteExpense);

export default router;
