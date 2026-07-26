const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/tracks', require('./trackRoutes'));
router.use('/artists', require('./artistRoutes'));
router.use('/genres', require('./genreRoutes'));
router.use('/bi', require('./biRoutes'));
router.use('/integration', require('./integrationRoutes'));
router.use('/mining', require('./miningRoutes'));
router.use('/clusters', require('./clusterRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/dynamic', require('./dynamicRoutes'));
router.use('/search', require('./searchRoutes'));
router.use('/data-quality', require('./dataQualityRoutes'));

module.exports = router;
