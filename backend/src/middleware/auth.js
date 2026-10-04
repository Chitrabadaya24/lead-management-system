const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
exports.protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new AppError('Not authenticated', 401);
  let decoded;
  try { decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET); } catch { throw new AppError('Invalid or expired token', 401); }
  const user = await User.findById(decoded.id);
  if (!user || user.status !== 'active') throw new AppError('Account unavailable', 401);
  req.user = user;
  next();
});
exports.authorize = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new AppError('Forbidden: insufficient permissions', 403));
