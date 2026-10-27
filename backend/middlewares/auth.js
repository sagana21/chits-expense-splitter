import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Requires `Authorization: Bearer <token>`. Puts the user on req.user. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Please log in to continue');
  }
  let payload;
  try {
    payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Your session has expired. Please log in again');
  }
  const user = await User.findById(payload.id);
  if (!user) {
    res.status(401);
    throw new Error('This account no longer exists');
  }
  req.user = user;
  next();
});
