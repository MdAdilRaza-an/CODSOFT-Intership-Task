const { body, validationResult } = require('express-validator');

const registrationRules = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be between 8 and 72 characters')
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('password').isString().notEmpty().withMessage('Password is required')
];

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }
  return next();
}

module.exports = { registrationRules, loginRules, validate };
