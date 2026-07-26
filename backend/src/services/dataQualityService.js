const pool = require('../config/database');

const DataQualityService = {
  async getCompleteness() {
    const columns = [
      { table: 'tbl_track', column: 'track_name' },
      { table: 'tbl_track', column: 'artist_id' },
      { table: 'tbl_track', column: 'genre_id' },
      { table: 'tbl_track', column: 'year' },
      { table: 'tbl_track', column: 'duration_ms' },
      { table: 'tbl_track', column: 'key' },
      { table: 'tbl_track', column: 'mode' },
      { table: 'tbl_track', column: 'time_signature' },
      { table: 'tbl_track_audio_features', column: 'danceability' },
      { table: 'tbl_track_audio_features', column: 'energy' },
      { table: 'tbl_track_audio_features', column: 'speechiness' },
      { table: 'tbl_track_audio_features', column: 'acousticness' },
      { table: 'tbl_track_audio_features', column: 'instrumentalness' },
      { table: 'tbl_track_audio_features', column: 'liveness' },
      { table: 'tbl_track_audio_features', column: 'valence' },
      { table: 'tbl_track_audio_features', column: 'tempo' },
      { table: 'tbl_track_popularity', column: 'popularity_score' },
    ];

    const totalResult = await pool.query('SELECT COUNT(*) FROM tbl_track');
    const totalRows = parseInt(totalResult.rows[0].count);

    const results = await Promise.all(
      columns.map(async ({ table, column }) => {
        const nullCount = await pool.query(
          `SELECT COUNT(*) FROM ${table} WHERE ${column} IS NULL`
        );
        const nulls = parseInt(nullCount.rows[0].count);
        return {
          table,
          column,
          total: totalRows,
          nulls,
          filled: totalRows - nulls,
          completeness: totalRows > 0 ? ((totalRows - nulls) / totalRows * 100).toFixed(1) : 100,
        };
      })
    );

    return { totalRows, columns: results };
  },

  async getDuplicates() {
    const result = await pool.query(
      `SELECT t.track_name, a.artist_name, COUNT(*) as duplicate_count
       FROM tbl_track t
       JOIN tbl_artist a ON t.artist_id = a.artist_id
       GROUP BY t.track_name, a.artist_name
       HAVING COUNT(*) > 1
       ORDER BY duplicate_count DESC
       LIMIT 20`
    );
    return result.rows;
  },

  async getOutlierSummary() {
    const features = ['danceability', 'energy', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];

    const results = await Promise.all(
      features.map(async (feature) => {
        const result = await pool.query(
          `SELECT
            AVG(${feature}) as mean,
            STDDEV(${feature}) as stddev,
            MIN(${feature}) as min,
            MAX(${feature}) as max
           FROM tbl_track_audio_features`
        );
        const { mean, stddev, min, max } = result.rows[0];

        const outlierCount = await pool.query(
          `SELECT COUNT(*) FROM tbl_track_audio_features
           WHERE ${feature} < $1::numeric - 2 * $2::numeric
              OR ${feature} > $1::numeric + 2 * $2::numeric`,
          [mean, stddev]
        );

        return {
          feature,
          mean: parseFloat(mean).toFixed(3),
          stddev: parseFloat(stddev).toFixed(3),
          min: parseFloat(min).toFixed(3),
          max: parseFloat(max).toFixed(3),
          outliers: parseInt(outlierCount.rows[0].count),
        };
      })
    );

    return results;
  },

  async getSummary() {
    const [trackCount, audioCount, popularityCount, artistCount, genreCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tbl_track'),
      pool.query('SELECT COUNT(*) FROM tbl_track_audio_features'),
      pool.query('SELECT COUNT(*) FROM tbl_track_popularity'),
      pool.query('SELECT COUNT(*) FROM tbl_artist'),
      pool.query('SELECT COUNT(*) FROM tbl_genre'),
    ]);

    const tracks = parseInt(trackCount.rows[0].count);
    const audio = parseInt(audioCount.rows[0].count);
    const popularity = parseInt(popularityCount.rows[0].count);

    return {
      totalTracks: tracks,
      totalArtists: parseInt(artistCount.rows[0].count),
      totalGenres: parseInt(genreCount.rows[0].count),
      audioFeatureCoverage: tracks > 0 ? ((audio / tracks) * 100).toFixed(1) : 0,
      popularityCoverage: tracks > 0 ? ((popularity / tracks) * 100).toFixed(1) : 0,
      orphanedAudio: audio - tracks,
      orphanedPopularity: popularity - tracks,
    };
  },
};

module.exports = DataQualityService;
