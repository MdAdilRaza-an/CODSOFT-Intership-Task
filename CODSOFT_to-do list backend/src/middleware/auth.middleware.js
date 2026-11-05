const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication token is required' });
  }

  const token = authorization.slice(7).trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User associated with this token was not found' });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Authentication token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }
    return next(error);
  }
}

module.exports = authenticate;
