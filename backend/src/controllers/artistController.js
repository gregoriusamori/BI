const Artist = require('../models/Artist');
const BIAnalysisService = require('../services/biAnalysisService');

const artistController = {
  async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const artists = await Artist.findAll(limit, offset);
      const total = await Artist.count();
      res.json({ artists, total });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const artist = await Artist.findById(req.params.id);
      if (!artist) return res.status(404).json({ error: 'Artist not found' });
      res.json(artist);
    } catch (err) {
      next(err);
    }
  },

  async getTop(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const artists = await BIAnalysisService.getTopArtists(limit);
      res.json(artists);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = artistController;
