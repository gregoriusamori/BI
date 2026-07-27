const BIAnalysisService = require('../services/biAnalysisService');
const Genre = require('../models/Genre');
const MiningService = require('../services/miningService');

const biController = {
  async getOverview(req, res, next) {
    try {
      const overview = await BIAnalysisService.getOverview();
      res.json(overview);
    } catch (err) {
      next(err);
    }
  },

  async getGenreDistribution(req, res, next) {
    try {
      const data = await Genre.getGenreStats();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getYearTrend(req, res, next) {
    try {
      const data = await BIAnalysisService.getYearTrend();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getTopArtists(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await BIAnalysisService.getTopArtists(limit);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getAudioFeaturesStats(req, res, next) {
    try {
      const data = await MiningService.getFeatureStats();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getPopularityDistribution(req, res, next) {
    try {
      const data = await BIAnalysisService.getPopularityDistribution();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getAllArtists(req, res, next) {
    try {
      const data = await BIAnalysisService.getAllArtists();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = biController;
