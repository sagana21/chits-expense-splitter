import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error('Name, email and password are all required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }
  if (await User.findOne({ email: email.toLowerCase().trim() })) {
    res.status(400);
    throw new Error('That email is already registered');
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: generateToken(user._id), user: publicUser(user) });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) {
    res.status(401);
    throw new Error('Wrong email or password');
  }
  res.json({ token: generateToken(user._id), user: publicUser(user) });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});
