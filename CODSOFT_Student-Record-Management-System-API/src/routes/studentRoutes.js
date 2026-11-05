const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

router.post('/', studentController.create);
router.get('/', studentController.list);
router.get('/:id', studentController.getById);
router.put('/:id', studentController.update);
router.delete('/:id', studentController.remove);

module.exports = router;
