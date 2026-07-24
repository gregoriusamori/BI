const IntegrationService = require('../services/integrationService');

const integrationController = {
  async importCSV(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await IntegrationService.importCSV(req.file.path);
      await IntegrationService.saveImportLog(req.file.originalname, result.imported, result.skipped);

      res.json({
        message: 'Import completed',
        ...result,
        filename: req.file.originalname,
      });
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req, res, next) {
    try {
      const history = await IntegrationService.getImportHistory();
      res.json(history);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = integrationController;
