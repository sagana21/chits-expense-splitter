import Expense from '../models/Expense.js';
import asyncHandler from '../utils/asyncHandler.js';
import { parseExpense } from '../utils/expenseInput.js';

// Drop keys that are undefined so they never overwrite stored values or defaults.
const defined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

// POST /api/groups/:id/expenses
// body: { description, amount (rupees), paidBy, category, date,
//         splitType: 'equal' | 'exact' | 'percent',
//         splitAmong: [userId]                       (equal)
//         splitDetails: [{ user, value }]            (exact rupees, or percent) }
export const addExpense = asyncHandler(async (req, res) => {
  const memberIds = req.group.members.map(String);
  const data = parseExpense(req.body, memberIds, String(req.user._id));
  const expense = await Expense.create({ group: req.group._id, ...defined(data) });
  res.status(201).json({ id: expense._id });
});

// PUT /api/groups/:id/expenses/:expenseId
export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.expenseId, group: req.group._id });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  if (expense.isPayment) {
    res.status(400);
    throw new Error('Payments cannot be edited. Delete it and record a new one');
  }
  const memberIds = req.group.members.map(String);
  const data = parseExpense({ ...req.body, isPayment: false }, memberIds, String(req.user._id));
  Object.assign(expense, defined(data));
  await expense.save();
  res.json({ id: expense._id });
});

// DELETE /api/groups/:id/expenses/:expenseId
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.expenseId, group: req.group._id });
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  await expense.deleteOne();
  res.status(204).end();
});
