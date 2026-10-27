import Group from '../models/Group.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import asyncHandler from '../utils/asyncHandler.js';
import { computeBalances, simplifyDebts } from '../utils/splitter.js';

// GET /api/groups  -> groups the logged-in user belongs to, with the user's own balance in each
export const listGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).sort('-createdAt');
  const me = String(req.user._id);
  const expenses = await Expense.find({ group: { $in: groups.map((g) => g._id) } }).select('group amount paidBy splits');

  const mine = {}; // groupId -> my net balance in paise
  for (const e of expenses) {
    const key = String(e.group);
    mine[key] = mine[key] || 0;
    if (String(e.paidBy) === me) mine[key] += e.amount;
    for (const s of e.splits) if (String(s.user) === me) mine[key] -= s.share;
  }

  res.json(
    groups.map((g) => ({
      id: g._id,
      name: g.name,
      memberCount: g.members.length,
      myBalance: mine[String(g._id)] || 0,
    }))
  );
});

// POST /api/groups
export const createGroup = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) {
    res.status(400);
    throw new Error('Give the group a name');
  }
  const group = await Group.create({ name, createdBy: req.user._id, members: [req.user._id] });
  res.status(201).json({ id: group._id, name: group.name });
});

// GET /api/groups/:id  -> everything the group page needs in one call
export const getGroup = asyncHandler(async (req, res) => {
  const group = await req.group.populate('members', 'name email');
  const expenses = await Expense.find({ group: group._id })
    .sort({ date: -1, createdAt: -1 })
    .populate('paidBy', 'name')
    .populate('splits.user', 'name');

  const members = group.members.map((m) => ({ id: String(m._id), name: m.name, email: m.email }));
  const nameOf = Object.fromEntries(members.map((m) => [m.id, m.name]));

  const balances = computeBalances(
    members.map((m) => m.id),
    expenses.map((e) => ({
      paidBy: String(e.paidBy._id),
      amount: e.amount,
      shares: Object.fromEntries(e.splits.map((s) => [String(s.user._id), s.share])),
    }))
  );

  res.json({
    group: { id: group._id, name: group.name, createdBy: String(group.createdBy) },
    members,
    balances: members.map((m) => ({ userId: m.id, name: m.name, balance: balances[m.id] })),
    settleUp: simplifyDebts(balances).map((t) => ({
      from: { id: t.from, name: nameOf[t.from] },
      to: { id: t.to, name: nameOf[t.to] },
      amount: t.amount,
    })),
    expenses: expenses.map((e) => ({
      id: e._id,
      description: e.description,
      amount: e.amount,
      isPayment: e.isPayment,
      category: e.category,
      splitType: e.splitType,
      date: e.date || e.createdAt,
      createdAt: e.createdAt,
      paidBy: { id: String(e.paidBy._id), name: e.paidBy.name },
      splits: e.splits.map((s) => ({ user: { id: String(s.user._id), name: s.user.name }, share: s.share })),
    })),
    totalSpent: expenses.filter((e) => !e.isPayment).reduce((sum, e) => sum + e.amount, 0),
  });
});

// POST /api/groups/:id/members  { email }
export const addMember = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').toLowerCase().trim();
  if (!email) {
    res.status(400);
    throw new Error("Enter the person's email");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No account with that email. Ask them to sign up first');
  }
  if (req.group.members.some((m) => m.equals(user._id))) {
    res.status(400);
    throw new Error(`${user.name} is already in this group`);
  }
  req.group.members.push(user._id);
  await req.group.save();
  res.status(201).json({ id: user._id, name: user.name });
});

// DELETE /api/groups/:id  (only the person who created it)
export const deleteGroup = asyncHandler(async (req, res) => {
  if (!req.group.createdBy.equals(req.user._id)) {
    res.status(403);
    throw new Error('Only the person who created the group can delete it');
  }
  await Expense.deleteMany({ group: req.group._id });
  await req.group.deleteOne();
  res.status(204).end();
});
