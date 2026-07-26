const pool = require('../config/database');

const SearchService = {
  async search(query) {
    const term = `%${query}%`;

    const [tracks, artists, genres] = await Promise.all([
      pool.query(
        `SELECT t.track_id as id, t.track_name as name, a.artist_name as subtitle, g.genre_name as extra, 'track' as type
         FROM tbl_track t
         LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
         LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
         WHERE t.track_name ILIKE $1 OR a.artist_name ILIKE $1 OR g.genre_name ILIKE $1
         ORDER BY t.track_name
         LIMIT 10`,
        [term]
      ),
      pool.query(
        `SELECT a.artist_id as id, a.artist_name as name, NULL as subtitle, NULL as extra, 'artist' as type
         FROM tbl_artist a
         WHERE a.artist_name ILIKE $1
         ORDER BY a.artist_name
         LIMIT 5`,
        [term]
      ),
      pool.query(
        `SELECT g.genre_id as id, g.genre_name as name, NULL as subtitle, NULL as extra, 'genre' as type
         FROM tbl_genre g
         WHERE g.genre_name ILIKE $1
         ORDER BY g.genre_name
         LIMIT 5`,
        [term]
      ),
    ]);

    return {
      tracks: tracks.rows,
      artists: artists.rows,
      genres: genres.rows,
      total: tracks.rows.length + artists.rows.length + genres.rows.length,
    };
  },
};

module.exports = SearchService;
