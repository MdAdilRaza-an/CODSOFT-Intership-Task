const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');

const router = express.Router();

router.post('/', enrollmentController.create);
router.get('/', enrollmentController.list);
router.get('/:id', enrollmentController.getById);
router.put('/:id', enrollmentController.update);
router.delete('/:id', enrollmentController.remove);

module.exports = router;
