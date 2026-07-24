const pool = require('../config/database');

const BIAnalysisService = {
  async getOverview() {
    const [trackCount, artistCount, genreCount, avgPopularity] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tbl_track'),
      pool.query('SELECT COUNT(*) FROM tbl_artist'),
      pool.query('SELECT COUNT(*) FROM tbl_genre'),
      pool.query('SELECT AVG(popularity_score) as avg_pop FROM tbl_track_popularity'),
    ]);

    return {
      totalTracks: parseInt(trackCount.rows[0].count),
      totalArtists: parseInt(artistCount.rows[0].count),
      totalGenres: parseInt(genreCount.rows[0].count),
      avgPopularity: parseFloat(avgPopularity.rows[0].avg_pop || 0).toFixed(2),
    };
  },

  async getGenreDistribution() {
    const result = await pool.query(
      `SELECT g.genre_name, COUNT(t.track_id) as count
       FROM tbl_genre g
       LEFT JOIN tbl_track t ON g.genre_id = t.genre_id
       GROUP BY g.genre_id, g.genre_name
       ORDER BY count DESC`
    );
    return result.rows;
  },

  async getYearTrend() {
    const result = await pool.query(
      `SELECT year, COUNT(*) as track_count, AVG(p.popularity_score) as avg_popularity
       FROM tbl_track t
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       WHERE year IS NOT NULL
       GROUP BY year
       ORDER BY year`
    );
    return result.rows;
  },

  async getTopArtists(limit = 10) {
    const result = await pool.query(
      `SELECT a.artist_name, COUNT(t.track_id) as track_count,
              AVG(p.popularity_score) as avg_popularity
       FROM tbl_artist a
       JOIN tbl_track t ON a.artist_id = t.artist_id
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       GROUP BY a.artist_id, a.artist_name
       ORDER BY track_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  async getAudioFeaturesStats() {
    const result = await pool.query(
      `SELECT
        AVG(danceability) as avg_danceability,
        AVG(energy) as avg_energy,
        AVG(speechiness) as avg_speechiness,
        AVG(acousticness) as avg_acousticness,
        AVG(instrumentalness) as avg_instrumentalness,
        AVG(liveness) as avg_liveness,
        AVG(valence) as avg_valence,
        AVG(tempo) as avg_tempo
       FROM tbl_track_audio_features`
    );
    return result.rows[0];
  },

  async getPopularityDistribution() {
    const result = await pool.query(
      `SELECT
        CASE
          WHEN popularity_score < 20 THEN '0-19'
          WHEN popularity_score < 40 THEN '20-39'
          WHEN popularity_score < 60 THEN '40-59'
          WHEN popularity_score < 80 THEN '60-79'
          ELSE '80-100'
        END as range,
        COUNT(*) as count
       FROM tbl_track_popularity
       GROUP BY range
       ORDER BY range`
    );
    return result.rows;
  },
};

module.exports = BIAnalysisService;
