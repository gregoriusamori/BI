const pool = require('../config/database');

const ReportService = {
  async generateGenreReport() {
    const result = await pool.query(`
      SELECT g.genre_name, COUNT(t.track_id) as total_tracks,
             AVG(p.popularity_score) as avg_popularity,
             AVG(af.energy) as avg_energy,
             AVG(af.danceability) as avg_danceability,
             MIN(t.year) as earliest_year, MAX(t.year) as latest_year
      FROM tbl_genre g
      LEFT JOIN tbl_track t ON g.genre_id = t.genre_id
      LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
      LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
      GROUP BY g.genre_id, g.genre_name
      ORDER BY total_tracks DESC
    `);
    return result.rows;
  },

  async generateArtistReport(limit = 20) {
    const result = await pool.query(`
      SELECT a.artist_name, COUNT(t.track_id) as total_tracks,
             AVG(p.popularity_score) as avg_popularity,
             AVG(af.energy) as avg_energy,
             MIN(t.year) as earliest_year, MAX(t.year) as latest_year
      FROM tbl_artist a
      LEFT JOIN tbl_track t ON a.artist_id = t.artist_id
      LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
      LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
      GROUP BY a.artist_id, a.artist_name
      HAVING COUNT(t.track_id) > 0
      ORDER BY total_tracks DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  },

  async generateDecadeReport() {
    const result = await pool.query(`
      SELECT decade, COUNT(t.track_id) as total_tracks,
             AVG(p.popularity_score) as avg_popularity,
             AVG(af.energy) as avg_energy,
             AVG(af.danceability) as avg_danceability
      FROM tbl_track t
      LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
      LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
      WHERE decade > 0
      GROUP BY decade
      ORDER BY decade
    `);
    return result.rows;
  },

  async generateSummary() {
    const overview = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM tbl_track) as total_tracks,
        (SELECT COUNT(*) FROM tbl_artist) as total_artists,
        (SELECT COUNT(*) FROM tbl_genre) as total_genres,
        (SELECT AVG(popularity_score) FROM tbl_track_popularity) as avg_popularity,
        (SELECT AVG(energy) FROM tbl_track_audio_features) as avg_energy,
        (SELECT AVG(danceability) FROM tbl_track_audio_features) as avg_danceability
    `);
    return overview.rows[0];
  },
};

module.exports = ReportService;
