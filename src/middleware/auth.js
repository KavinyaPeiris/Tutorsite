const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  try {
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

exports.requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Forbidden' });