const DataQualityService = require('../services/dataQualityService');

const dataQualityController = {
  async getSummary(req, res, next) {
    try {
      const summary = await DataQualityService.getSummary();
      res.json(summary);
    } catch (err) {
      next(err);
    }
  },

  async getCompleteness(req, res, next) {
    try {
      const data = await DataQualityService.getCompleteness();
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async getDuplicates(req, res, next) {
    try {
      const duplicates = await DataQualityService.getDuplicates();
      res.json(duplicates);
    } catch (err) {
      next(err);
    }
  },

  async getOutlierSummary(req, res, next) {
    try {
      const outliers = await DataQualityService.getOutlierSummary();
      res.json(outliers);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dataQualityController;
