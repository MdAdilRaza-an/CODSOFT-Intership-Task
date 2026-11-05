const { body, param, query, validationResult } = require('express-validator');

const titleRule = body('title')
  .trim()
  .isLength({ min: 1, max: 200 })
  .withMessage('Title must be between 1 and 200 characters');

const descriptionRule = body('description')
  .optional({ values: 'null' })
  .isString()
  .isLength({ max: 5000 })
  .withMessage('Description must be a string of at most 5000 characters')
  .bail();

const dueDateRules = body('due_date')
  .optional({ values: 'null' })
  .isISO8601({ strict: true })
  .withMessage('Due date must be a valid ISO 8601 date');

const priorityRule = body('priority')
  .optional()
  .isIn(['low', 'medium', 'high'])
  .withMessage('Priority must be low, medium, or high');

const categoryRule = body('category')
  .optional({ values: 'null' })
  .isString()
  .trim()
  .isLength({ max: 100 })
  .withMessage('Category must be a string of at most 100 characters');

const createRules = [titleRule, descriptionRule, dueDateRules, priorityRule, categoryRule];

const updateRules = [
  body().custom((value) => {
    if (!value || typeof value !== 'object') return false;
    return true;
  }).withMessage('Request body must be a JSON object'),
  body('title').optional().trim().isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  descriptionRule,
  dueDateRules,
  priorityRule,
  categoryRule,
  body().custom((value) => Object.keys(value).length > 0)
    .withMessage('At least one task field must be provided'),
  body().custom((value) => {
    const allowed = ['title', 'description', 'due_date', 'priority', 'category'];
    return Object.keys(value).every((key) => allowed.includes(key));
  }).withMessage('Update contains unsupported fields')
];

const statusRules = [
  body('status').isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed')
];

const idRule = param('id').isInt({ min: 1 }).toInt()
  .withMessage('Task ID must be a positive integer');

const listRules = [
  query('status').optional().isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
  query('priority').optional().isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  query('category').optional().trim().isLength({ min: 1, max: 100 })
    .withMessage('Category must be between 1 and 100 characters'),
  query('search').optional().trim().isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  query('due_before').optional().isISO8601({ strict: true })
    .withMessage('due_before must be a valid ISO 8601 date'),
  query('due_after').optional().isISO8601({ strict: true })
    .withMessage('due_after must be a valid ISO 8601 date'),
  query('page').optional().isInt({ min: 1 }).toInt()
    .withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['created_at', 'updated_at', 'due_date', 'title', 'priority'])
    .withMessage('Invalid sort field'),
  query('order').optional().toUpperCase().isIn(['ASC', 'DESC'])
    .withMessage('Order must be ASC or DESC')
];

function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: result.array({ onlyFirstError: true }).map(({ path, msg, value }) => ({
        field: path,
        message: msg,
        ...(value !== undefined ? { rejectedValue: value } : {})
      }))
    });
  }
  return next();
}

module.exports = {
  createRules,
  updateRules,
  statusRules,
  idRule,
  listRules,
  validate
};
