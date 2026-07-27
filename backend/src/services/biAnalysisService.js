const pool = require('../config/database');
const InsightGenerator = require('../utils/insightGenerator');

const BIAnalysisService = {
  async getOverview() {
    const [trackCount, artistCount, genreCount, avgPopularity] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM tbl_track'),
      pool.query('SELECT COUNT(*) FROM tbl_artist'),
      pool.query('SELECT COUNT(*) FROM tbl_genre'),
      pool.query('SELECT AVG(popularity_score) as avg_pop FROM tbl_track_popularity'),
    ]);

    const data = {
      totalTracks: parseInt(trackCount.rows[0].count),
      totalArtists: parseInt(artistCount.rows[0].count),
      totalGenres: parseInt(genreCount.rows[0].count),
      avgPopularity: parseFloat(avgPopularity.rows[0].avg_pop || 0).toFixed(2),
    };
    data.insight = InsightGenerator.overview(data);
    return data;
  },

  async getYearTrend() {
    const result = await pool.query(
      `SELECT year, COUNT(*) as track_count,
              (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE year = t.year)) as avg_popularity
       FROM tbl_track t
       WHERE year IS NOT NULL
       GROUP BY year
       ORDER BY year`
    );
    const rows = result.rows;
    return { data: rows, insight: InsightGenerator.yearTrend(rows) };
  },

  async getTopArtists(limit = 10) {
    const result = await pool.query(
      `SELECT a.artist_name, COUNT(t.track_id) as track_count,
              (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE artist_id = a.artist_id)) as avg_popularity
       FROM tbl_artist a
       JOIN tbl_track t ON a.artist_id = t.artist_id
       GROUP BY a.artist_id, a.artist_name
       ORDER BY track_count DESC
       LIMIT $1`,
      [limit]
    );
    const rows = result.rows;
    const insight = InsightGenerator.topArtists(rows);
    return { data: rows, insight };
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
    const rows = result.rows;
    return { data: rows, insight: InsightGenerator.popularityDistribution(rows) };
  },

  async getAllArtists() {
    const result = await pool.query(
      `SELECT a.artist_id, a.artist_name,
              COUNT(t.track_id) as track_count,
              (SELECT AVG(popularity_score) FROM tbl_track_popularity WHERE track_id IN (SELECT track_id FROM tbl_track WHERE artist_id = a.artist_id)) as avg_popularity,
              MIN(t.year) as first_year,
              MAX(t.year) as last_year,
              (SELECT STRING_AGG(DISTINCT g.genre_name, ', ' ORDER BY g.genre_name)
               FROM tbl_genre g
               JOIN tbl_track t2 ON g.genre_id = t2.genre_id
               WHERE t2.artist_id = a.artist_id) as genres
       FROM tbl_artist a
       JOIN tbl_track t ON a.artist_id = t.artist_id
       GROUP BY a.artist_id, a.artist_name
       ORDER BY track_count DESC`
    );

    const rows = result.rows.map(r => {
      const trackCount = Number(r.track_count);
      const avgPop = Number(r.avg_popularity || 0).toFixed(1);
      const yearRange = r.first_year && r.last_year
        ? r.first_year === r.last_year ? `tahun ${r.first_year}` : `${r.first_year}-${r.last_year}`
        : '';
      const popLevel = avgPop >= 70 ? 'populer' : avgPop >= 40 ? 'cukup populer' : 'kurang populer';
      const genreText = r.genres ? `Genre: ${r.genres}` : '';

      let desc = `${r.artist_name} memiliki ${trackCount} track`;
      if (yearRange) desc += `, aktif dari ${yearRange}`;
      desc += `, ${popLevel} (avg ${avgPop})`;
      if (genreText) desc += `. ${genreText}`;

      return {
        artist_id: r.artist_id,
        artist_name: r.artist_name,
        track_count: trackCount,
        avg_popularity: avgPop,
        first_year: r.first_year,
        last_year: r.last_year,
        genres: r.genres || '',
        description: desc,
      };
    });

    return rows;
  },
};

module.exports = BIAnalysisService;
