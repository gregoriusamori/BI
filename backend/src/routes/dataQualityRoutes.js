const express = require('express');
const router = express.Router();
const dataQualityController = require('../controllers/dataQualityController');

router.get('/summary', dataQualityController.getSummary);
router.get('/completeness', dataQualityController.getCompleteness);
router.get('/duplicates', dataQualityController.getDuplicates);
router.get('/outlier-summary', dataQualityController.getOutlierSummary);

module.exports = router;
