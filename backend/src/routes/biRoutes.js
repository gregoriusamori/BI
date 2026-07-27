const express = require('express');
const router = express.Router();
const biController = require('../controllers/biController');

router.get('/overview', biController.getOverview);
router.get('/genre-distribution', biController.getGenreDistribution);
router.get('/year-trend', biController.getYearTrend);
router.get('/top-artists', biController.getTopArtists);
router.get('/audio-features', biController.getAudioFeaturesStats);
router.get('/popularity-distribution', biController.getPopularityDistribution);
router.get('/all-artists', biController.getAllArtists);

module.exports = router;
