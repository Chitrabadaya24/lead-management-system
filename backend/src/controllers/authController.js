const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({ name, email, password, role: 'user' }); // role is never client-controlled
  res.status(201).json({ token: sign(user), user });
});
exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password))) throw new AppError('Invalid email or password', 401);
  if (user.status !== 'active') throw new AppError('Account is inactive', 403);
  res.json({ token: sign(user), user });
});
exports.me = (req, res) => res.json({ user: req.user });
exports.updateMe = asyncHandler(async (req, res) => {
  const { name, email, password, currentPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found', 404);
  if (password) {
    if (!currentPassword) throw new AppError('Current password is required to set a new password', 400);
    if (!(await user.matchPassword(currentPassword))) throw new AppError('Current password is incorrect', 400);
    user.password = password;
  }
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  await user.save();
  res.json({ user });
});
exports.listUsers = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? { status: 'active' } : { _id: req.user._id };
  res.json({ data: await User.find(filter).select('name email role').sort('name') });
});
