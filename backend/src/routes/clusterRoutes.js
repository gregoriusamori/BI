const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/clusterController');
const { authMiddleware } = require('../middleware/auth');

const clusterRateLimit = {};
const CLUSTER_COOLDOWN = 2 * 60 * 1000;

function clusterRateLimiter(req, res, next) {
  const userId = req.user.id;
  const now = Date.now();
  if (clusterRateLimit[userId] && now - clusterRateLimit[userId] < CLUSTER_COOLDOWN) {
    const remaining = Math.ceil((CLUSTER_COOLDOWN - (now - clusterRateLimit[userId])) / 1000);
    return res.status(429).json({ error: `Please wait ${remaining}s before running clustering again.` });
  }
  clusterRateLimit[userId] = now;
  next();
}

router.get('/', clusterController.getClusters);
router.get('/stats', clusterController.getClusterStats);
router.get('/genre-by-cluster', clusterController.getGenreByCluster);
router.get('/:id/tracks', clusterController.getClusteredTracks);
router.post('/run', authMiddleware, clusterRateLimiter, clusterController.runClustering);

module.exports = router;
