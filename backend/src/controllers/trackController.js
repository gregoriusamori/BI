const Track = require('../models/Track');

const trackController = {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '', sort = 'track_id', order = 'asc', genre = '', artist = '' } = req.query;
      const result = await Track.findAllPaginated({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        sort,
        order,
        genre,
        artist,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const track = await Track.findByIdFull(req.params.id);
      if (!track) return res.status(404).json({ error: 'Track not found' });
      res.json(track);
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

  async create(req, res, next) {
    try {
      const { track_name, artist_id, genre_id } = req.body;
      if (!track_name || !artist_id || !genre_id) {
        return res.status(400).json({ error: 'track_name, artist_id, and genre_id are required' });
      }
      const track = await Track.createWithDetails(req.body);
      res.status(201).json(track);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { track_name, artist_id, genre_id } = req.body;
      if (!track_name || !artist_id || !genre_id) {
        return res.status(400).json({ error: 'track_name, artist_id, and genre_id are required' });
      }
      const existing = await Track.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Track not found' });

      const track = await Track.updateWithDetails(req.params.id, req.body);
      res.json(track);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const existing = await Track.findById(req.params.id);
      if (!existing) return res.status(404).json({ error: 'Track not found' });

      const track = await Track.delete(req.params.id);
      res.json({ message: 'Track deleted', track });
    } catch (err) {
      next(err);
    }
  },

  async filter(req, res, next) {
    try {
      const { genre, artist, year, decade, search, limit } = req.query;
      const tracks = await Track.filter(
        { genre, artist, year, decade, search },
        parseInt(limit) || 100
      );
      res.json({ tracks, total: tracks.length });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = trackController;
