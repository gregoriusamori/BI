const pool = require('../config/database');

const Genre = {
  async create(genreName, genreCategory = null) {
    const result = await pool.query(
      'INSERT INTO tbl_genre (genre_name, genre_category) VALUES ($1, $2) RETURNING *',
      [genreName, genreCategory]
    );
    return result.rows[0];
  },

  async findOrCreate(genreName) {
    let result = await pool.query('SELECT * FROM tbl_genre WHERE genre_name = $1', [genreName]);
    if (result.rows.length > 0) return result.rows[0];
    return this.create(genreName);
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM tbl_genre ORDER BY genre_id');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM tbl_genre WHERE genre_id = $1', [id]);
    return result.rows[0];
  },

  async getGenreStats() {
    const result = await pool.query(
      `SELECT g.genre_name, COUNT(t.track_id) as track_count, AVG(p.popularity_score) as avg_popularity
       FROM tbl_genre g
       LEFT JOIN tbl_track t ON g.genre_id = t.genre_id
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       GROUP BY g.genre_id, g.genre_name
       ORDER BY track_count DESC`
    );
    return result.rows;
  },
};

module.exports = Genre;
