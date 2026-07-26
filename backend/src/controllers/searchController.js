const SearchService = require('../services/searchService');

const searchController = {
  async search(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 2) {
        return res.json({ tracks: [], artists: [], genres: [], total: 0 });
      }
      const results = await SearchService.search(q.trim());
      res.json(results);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = searchController;
