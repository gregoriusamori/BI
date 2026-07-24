const express = require('express');
const router = express.Router();
const miningController = require('../controllers/miningController');

router.get('/correlation', miningController.getCorrelation);
router.get('/outliers/:column', miningController.getOutliers);
router.get('/feature-stats', miningController.getFeatureStats);
router.get('/patterns', miningController.getPatterns);

module.exports = router;
