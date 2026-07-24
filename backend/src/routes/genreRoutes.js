const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

router.get('/', genreController.getAll);
router.get('/stats', genreController.getStats);
router.get('/:id', genreController.getById);

module.exports = router;
