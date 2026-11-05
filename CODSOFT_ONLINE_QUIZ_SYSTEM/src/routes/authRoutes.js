const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const auth = require('../controllers/authController');

const router = express.Router();
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 72 })
], validate, auth.register);
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty()
], validate, auth.login);
router.get('/profile', authenticate, auth.profile);
module.exports = router;
