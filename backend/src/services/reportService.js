const pool = require('../config/database');
const InsightGenerator = require('../utils/insightGenerator');

const ReportService = {
  async generateGenreReport() {
    const result = await pool.query(`
      SELECT g.genre_name, COUNT(t.track_id) as total_tracks,
             (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE genre_id = g.genre_id)) as avg_popularity,
             (SELECT AVG(energy) FROM tbl_track_audio_features WHERE track_id IN (SELECT track_id FROM tbl_track WHERE genre_id = g.genre_id)) as avg_energy,
             (SELECT AVG(danceability) FROM tbl_track_audio_features WHERE track_id IN (SELECT track_id FROM tbl_track WHERE genre_id = g.genre_id)) as avg_danceability,
             MIN(t.year) as earliest_year, MAX(t.year) as latest_year
      FROM tbl_genre g
      JOIN tbl_track t ON g.genre_id = t.genre_id
      GROUP BY g.genre_id, g.genre_name
      ORDER BY total_tracks DESC
    `);
    const rows = result.rows;
    return { data: rows, insight: InsightGenerator.genreReport(rows) };
  },

  async generateArtistReport(limit = 20) {
    const result = await pool.query(`
      SELECT a.artist_name, COUNT(t.track_id) as total_tracks,
             (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE artist_id = a.artist_id)) as avg_popularity,
             (SELECT AVG(energy) FROM tbl_track_audio_features WHERE track_id IN (SELECT track_id FROM tbl_track WHERE artist_id = a.artist_id)) as avg_energy,
             MIN(t.year) as earliest_year, MAX(t.year) as latest_year
      FROM tbl_artist a
      JOIN tbl_track t ON a.artist_id = t.artist_id
      GROUP BY a.artist_id, a.artist_name
      ORDER BY total_tracks DESC
      LIMIT $1
    `, [limit]);
    const rows = result.rows;
    return { data: rows, insight: InsightGenerator.artistReport(rows) };
  },

  async generateDecadeReport() {
    const result = await pool.query(`
      SELECT decade, COUNT(t.track_id) as total_tracks,
             (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE decade = t.decade)) as avg_popularity,
             (SELECT AVG(energy) FROM tbl_track_audio_features WHERE track_id IN (SELECT track_id FROM tbl_track WHERE decade = t.decade)) as avg_energy,
             (SELECT AVG(danceability) FROM tbl_track_audio_features WHERE track_id IN (SELECT track_id FROM tbl_track WHERE decade = t.decade)) as avg_danceability
      FROM tbl_track t
      WHERE decade > 0
      GROUP BY decade
      ORDER BY decade
    `);
    const rows = result.rows;
    return { data: rows, insight: InsightGenerator.decadeReport(rows) };
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
    const data = overview.rows[0];
    return { ...data, insight: InsightGenerator.overview({
      totalTracks: parseInt(data.total_tracks),
      totalArtists: parseInt(data.total_artists),
      totalGenres: parseInt(data.total_genres),
      avgPopularity: parseFloat(data.avg_popularity || 0).toFixed(2),
    })};
  },
};

module.exports = ReportService;
