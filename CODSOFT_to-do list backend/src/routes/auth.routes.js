const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const { registrationRules, loginRules, validate } = require('../validators/auth.validator');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts; please try again later' }
});

router.post('/register', authLimiter, registrationRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.get('/me', authenticate, (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = router;
