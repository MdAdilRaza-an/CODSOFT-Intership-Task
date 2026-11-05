const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Authentication token is required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT id, name, email, role, is_active FROM users WHERE id = ?', [payload.sub]);
    if (!rows.length || !rows[0].is_active) return res.status(401).json({ error: 'Invalid or inactive account' });
    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token' });
    }
    next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

module.exports = { authenticate, authorize };
