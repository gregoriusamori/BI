const Track = require('../models/Track');

const trackController = {
  async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;
      const tracks = await Track.findAll(limit, offset);
      const total = await Track.count();
      res.json({ tracks, total, limit, offset });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const track = await Track.findById(req.params.id);
      if (!track) return res.status(404).json({ error: 'Track not found' });
      const audio = await Track.getAudioFeatures(req.params.id);
      const popularity = await Track.getPopularity(req.params.id);
      res.json({ ...track, audio_features: audio, popularity });
    } catch (err) {
      next(err);
    }
  },

  async getByGenre(req, res, next) {
    try {
      const tracks = await Track.findByGenre(req.params.genre, parseInt(req.query.limit) || 50);
      res.json(tracks);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const track = await Track.delete(req.params.id);
      if (!track) return res.status(404).json({ error: 'Track not found' });
      res.json({ message: 'Track deleted', track });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = trackController;
