const pool = require('../config/database');

const Artist = {
  async create(artistName) {
    const result = await pool.query(
      'INSERT INTO tbl_artist (artist_name) VALUES ($1) RETURNING *',
      [artistName]
    );
    return result.rows[0];
  },

  async findOrCreate(artistName) {
    let result = await pool.query('SELECT * FROM tbl_artist WHERE artist_name = $1', [artistName]);
    if (result.rows.length > 0) return result.rows[0];
    return this.create(artistName);
  },

  async findAll(limit = 100, offset = 0) {
    const result = await pool.query(
      'SELECT * FROM tbl_artist ORDER BY artist_id LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM tbl_artist WHERE artist_id = $1', [id]);
    return result.rows[0];
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM tbl_artist');
    return parseInt(result.rows[0].count);
  },

  async getTopArtists(limit = 10) {
    const result = await pool.query(
      `SELECT a.artist_name, COUNT(t.track_id) as track_count, AVG(p.popularity_score) as avg_popularity
       FROM tbl_artist a
       LEFT JOIN tbl_track t ON a.artist_id = t.artist_id
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       GROUP BY a.artist_id, a.artist_name
       ORDER BY track_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },
};

module.exports = Artist;
