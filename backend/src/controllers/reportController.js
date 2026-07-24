const ReportService = require('../services/reportService');

const reportController = {
  async getGenreReport(req, res, next) {
    try {
      const data = await ReportService.generateGenreReport();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getArtistReport(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await ReportService.generateArtistReport(limit);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getDecadeReport(req, res, next) {
    try {
      const data = await ReportService.generateDecadeReport();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getSummary(req, res, next) {
    try {
      const data = await ReportService.generateSummary();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = reportController;
