const ClusterService = require('../services/clusterService');

const clusterController = {
  async getClusters(req, res, next) {
    try {
      const clusters = await ClusterService.getClusters();
      res.json(clusters);
    } catch (err) {
      next(err);
    }
  },

  async getClusteredTracks(req, res, next) {
    try {
      const tracks = await ClusterService.getClusteredTracks(req.params.id);
      res.json(tracks);
    } catch (err) {
      next(err);
    }
  },

  async getClusterStats(req, res, next) {
    try {
      const stats = await ClusterService.getClusterStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },

  async getGenreByCluster(req, res, next) {
    try {
      const data = await ClusterService.getGenreByCluster();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async runClustering(req, res, next) {
    try {
      const k = parseInt(req.body.k);
      if (!k || k < 2 || k > 10) {
        return res.status(400).json({ error: 'K must be between 2 and 10' });
      }
      const result = await ClusterService.runClustering(k);
      res.json({ message: 'Clustering completed', ...result });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  },
};

module.exports = clusterController;
