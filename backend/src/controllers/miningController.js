const MiningService = require('../services/miningService');

const miningController = {
  async getCorrelation(req, res, next) {
    try {
      const data = await MiningService.getCorrelationMatrix();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getOutliers(req, res, next) {
    try {
      const data = await MiningService.getOutliers(req.params.column);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getFeatureStats(req, res, next) {
    try {
      const data = await MiningService.getFeatureStats();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getPatterns(req, res, next) {
    try {
      const data = await MiningService.getPatterns();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = miningController;
