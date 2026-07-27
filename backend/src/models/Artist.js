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

};

module.exports = Artist;
