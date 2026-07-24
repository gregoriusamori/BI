const Genre = require('../models/Genre');

const genreController = {
  async getAll(req, res, next) {
    try {
      const genres = await Genre.findAll();
      res.json(genres);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const genre = await Genre.findById(req.params.id);
      if (!genre) return res.status(404).json({ error: 'Genre not found' });
      res.json(genre);
    } catch (err) {
      next(err);
    }
  },

  async getStats(req, res, next) {
    try {
      const stats = await Genre.getGenreStats();
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = genreController;
