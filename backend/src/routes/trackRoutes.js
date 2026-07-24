const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

router.get('/', trackController.getAll);
router.get('/:id', trackController.getById);
router.get('/genre/:genre', trackController.getByGenre);
router.delete('/:id', trackController.delete);

module.exports = router;
