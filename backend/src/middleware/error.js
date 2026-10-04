exports.notFound = (req, _res, next) => { const e = new Error(`Route not found: ${req.originalUrl}`); e.status = 404; next(e); };
exports.errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}`; }
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'Email already in use'; }
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Internal server error' : message });
};
