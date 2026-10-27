import Group from '../models/Group.js';
import asyncHandler from '../utils/asyncHandler.js';

/** Loads the group in :id and makes sure the logged-in user belongs to it.
 *  Must run after `protect`. Puts the group on req.group. */
export const loadGroup = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }
  if (!group.members.some((m) => m.equals(req.user._id))) {
    res.status(403);
    throw new Error('You are not a member of this group');
  }
  req.group = group;
  next();
});
