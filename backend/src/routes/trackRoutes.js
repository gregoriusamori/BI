const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { authMiddleware } = require('../middleware/auth');

router.get('/filter', trackController.filter);
router.get('/', trackController.getAll);
router.get('/:id', trackController.getById);
router.get('/genre/:genre', trackController.getByGenre);

router.post('/', authMiddleware, trackController.create);
router.put('/:id', authMiddleware, trackController.update);
router.delete('/:id', authMiddleware, trackController.delete);

module.exports = router;
