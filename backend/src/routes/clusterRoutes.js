const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/clusterController');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.get('/', clusterController.getClusters);
router.get('/stats', clusterController.getClusterStats);
router.get('/genre-by-cluster', clusterController.getGenreByCluster);
router.get('/:id/tracks', clusterController.getClusteredTracks);
router.post('/run', authMiddleware, adminOnly, clusterController.runClustering);

module.exports = router;
