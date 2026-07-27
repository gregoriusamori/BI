const pool = require('../config/database');
const InsightGenerator = require('../utils/insightGenerator');

const MiningService = {
  async getCorrelationMatrix() {
    const result = await pool.query(
      `SELECT
        CORR(danceability, energy) as dance_energy,
        CORR(danceability, valence) as dance_valence,
        CORR(energy, loudness) as energy_loud,
        CORR(speechiness, energy) as speech_energy,
        CORR(acousticness, energy) as acoustic_energy,
        CORR(valence, energy) as valence_energy,
        CORR(tempo, energy) as tempo_energy
       FROM tbl_track_audio_features`
    );
    const data = result.rows[0];
    return { data, insight: InsightGenerator.correlation(data) };
  },

  async getOutliers(column) {
    const validColumns = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];
    if (!validColumns.includes(column)) {
      throw { status: 400, message: 'Invalid column' };
    }

    const result = await pool.query(`
      WITH stats AS (
        SELECT
          AVG(${column}) as mean,
          STDDEV(${column}) as stddev
        FROM tbl_track_audio_features
      )
      SELECT af.*, t.track_name, a.artist_name
      FROM tbl_track_audio_features af
      JOIN tbl_track t ON af.track_id = t.track_id
      JOIN tbl_artist a ON t.artist_id = a.artist_id, stats
      WHERE ABS(af.${column} - stats.mean) > 2 * stats.stddev
      ORDER BY ABS(af.${column} - stats.mean) DESC
      LIMIT 20
    `);
    return result.rows;
  },

  async getFeatureStats() {
    const result = await pool.query(`
      SELECT
        MIN(danceability) as min_danceability, MAX(danceability) as max_danceability, AVG(danceability) as avg_danceability,
        MIN(energy) as min_energy, MAX(energy) as max_energy, AVG(energy) as avg_energy,
        MIN(speechiness) as min_speechiness, MAX(speechiness) as max_speechiness, AVG(speechiness) as avg_speechiness,
        MIN(acousticness) as min_acousticness, MAX(acousticness) as max_acousticness, AVG(acousticness) as avg_acousticness,
        MIN(instrumentalness) as min_instrumentalness, MAX(instrumentalness) as max_instrumentalness, AVG(instrumentalness) as avg_instrumentalness,
        MIN(liveness) as min_liveness, MAX(liveness) as max_liveness, AVG(liveness) as avg_liveness,
        MIN(valence) as min_valence, MAX(valence) as max_valence, AVG(valence) as avg_valence,
        MIN(tempo) as min_tempo, MAX(tempo) as max_tempo, AVG(tempo) as avg_tempo
      FROM tbl_track_audio_features
    `);
    const data = result.rows[0];
    return { data, insight: InsightGenerator.audioFeatures(data) };
  },

  async getPatterns() {
    const result = await pool.query(`
      SELECT
        g.genre_name,
        AVG(af.energy) as avg_energy,
        AVG(af.danceability) as avg_danceability,
        AVG(af.valence) as avg_valence,
        AVG(af.acousticness) as avg_acousticness,
        (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE genre_id = g.genre_id)) as avg_popularity,
        COUNT(*) as track_count
      FROM tbl_track t
      JOIN tbl_genre g ON t.genre_id = g.genre_id
      JOIN tbl_track_audio_features af ON t.track_id = af.track_id
      GROUP BY g.genre_id, g.genre_name
      HAVING COUNT(*) >= 5
      ORDER BY avg_energy DESC
    `);
    return result.rows;
  },
};

module.exports = MiningService;
