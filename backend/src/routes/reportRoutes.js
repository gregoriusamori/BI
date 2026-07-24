const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/genre', reportController.getGenreReport);
router.get('/artist', reportController.getArtistReport);
router.get('/decade', reportController.getDecadeReport);
router.get('/summary', reportController.getSummary);

module.exports = router;
