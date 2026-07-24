const pool = require('../config/database');

const Track = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO tbl_track (track_name, artist_id, genre_id, year, decade, duration_ms, duration_minutes, time_signature, key, key_name, mode, mode_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [data.track_name, data.artist_id, data.genre_id, data.year, data.decade, data.duration_ms, data.duration_minutes, data.time_signature, data.key, data.key_name, data.mode, data.mode_name]
    );
    return result.rows[0];
  },

  async findAll(limit = 100, offset = 0) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       ORDER BY t.track_id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       WHERE t.track_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM tbl_track');
    return parseInt(result.rows[0].count);
  },

  async findByGenre(genreName, limit = 50) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       WHERE g.genre_name = $1
       ORDER BY t.track_id
       LIMIT $2`,
      [genreName, limit]
    );
    return result.rows;
  },

  async getAudioFeatures(trackId) {
    const result = await pool.query(
      'SELECT * FROM tbl_track_audio_features WHERE track_id = $1',
      [trackId]
    );
    return result.rows[0];
  },

  async getPopularity(trackId) {
    const result = await pool.query(
      'SELECT * FROM tbl_track_popularity WHERE track_id = $1',
      [trackId]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM tbl_track_popularity WHERE track_id = $1', [id]);
    await pool.query('DELETE FROM tbl_track_audio_features WHERE track_id = $1', [id]);
    const result = await pool.query('DELETE FROM tbl_track WHERE track_id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

module.exports = Track;
