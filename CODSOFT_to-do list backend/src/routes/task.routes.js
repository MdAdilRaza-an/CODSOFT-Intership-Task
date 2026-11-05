const express = require('express');
const authenticate = require('../middleware/auth.middleware');
const taskController = require('../controllers/task.controller');
const {
  createRules,
  updateRules,
  statusRules,
  idRule,
  listRules,
  validate
} = require('../validators/task.validator');

const router = express.Router();

router.use(authenticate);
router.post('/', createRules, validate, taskController.createTask);
router.get('/', listRules, validate, taskController.getTasks);
router.get('/:id', idRule, validate, taskController.getTaskById);
router.patch('/:id', idRule, updateRules, validate, taskController.updateTask);
router.patch('/:id/status', idRule, statusRules, validate, taskController.updateTaskStatus);
router.delete('/:id', idRule, validate, taskController.deleteTask);

module.exports = router;
