const pool = require('../config/database');
const InsightGenerator = require('../utils/insightGenerator');

const ClusterService = {
  async getClusters() {
    const result = await pool.query(
      'SELECT * FROM tbl_clusters ORDER BY cluster_id'
    );
    return result.rows;
  },

  async getClusteredTracks(clusterId) {
    const result = await pool.query(
      `SELECT t.track_name, a.artist_name, g.genre_name, tc.cluster_id, tc.cluster_label,
              af.danceability, af.energy, af.valence,
              (SELECT popularity_score FROM tbl_track_popularity WHERE track_id = tc.track_id LIMIT 1) as popularity_score
       FROM tbl_track_clusters tc
       JOIN tbl_track t ON tc.track_id = t.track_id
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       LEFT JOIN tbl_track_audio_features af ON tc.track_id = af.track_id
       WHERE tc.cluster_id = $1
       ORDER BY popularity_score DESC
       LIMIT 50`,
      [clusterId]
    );
    return result.rows;
  },

  async getClusterStats() {
    const result = await pool.query(
      `SELECT tc.cluster_id, tc.cluster_label, COUNT(*) as track_count,
              AVG(p.popularity_score) as avg_popularity,
              AVG(af.energy) as avg_energy,
              AVG(af.danceability) as avg_danceability,
              AVG(af.valence) as avg_valence
       FROM tbl_track_clusters tc
       JOIN tbl_track_popularity p ON tc.track_id = p.track_id
       JOIN tbl_track_audio_features af ON tc.track_id = af.track_id
       GROUP BY tc.cluster_id, tc.cluster_label
       ORDER BY tc.cluster_id`
    );
    const rows = result.rows;
    return { data: rows, insight: InsightGenerator.clusterStats(rows) };
  },

  async getGenreByCluster() {
    const result = await pool.query(
      `SELECT tc.cluster_id, tc.cluster_label, g.genre_name, COUNT(*) as count
       FROM tbl_track_clusters tc
       JOIN tbl_track t ON tc.track_id = t.track_id
       JOIN tbl_genre g ON t.genre_id = g.genre_id
       GROUP BY tc.cluster_id, tc.cluster_label, g.genre_name
       ORDER BY tc.cluster_id, count DESC`
    );
    return result.rows;
  },

  async runClustering(k = 5) {
    if (k < 2 || k > 10) {
      throw { status: 400, message: 'K must be between 2 and 10' };
    }

    const result = await pool.query(`
      WITH features AS (
        SELECT track_id, danceability, energy, loudness, speechiness,
               acousticness, instrumentalness, liveness, valence, tempo
        FROM tbl_track_audio_features
      ),
      normalized AS (
        SELECT track_id,
          CASE WHEN MAX(danceability) - MIN(danceability) = 0 THEN 0
            ELSE (danceability - MIN(danceability)) / (MAX(danceability) - MIN(danceability)) END as n_dance,
          CASE WHEN MAX(energy) - MIN(energy) = 0 THEN 0
            ELSE (energy - MIN(energy)) / (MAX(energy) - MIN(energy)) END as n_energy,
          CASE WHEN MAX(valence) - MIN(valence) = 0 THEN 0
            ELSE (valence - MIN(valence)) / (MAX(valence) - MIN(valence)) END as n_valence,
          CASE WHEN MAX(acousticness) - MIN(acousticness) = 0 THEN 0
            ELSE (acousticness - MIN(acousticness)) / (MAX(acousticness) - MIN(acousticness)) END as n_acoustic,
          CASE WHEN MAX(tempo) - MIN(tempo) = 0 THEN 0
            ELSE (tempo - MIN(tempo)) / (MAX(tempo) - MIN(tempo)) END as n_tempo
        FROM features
        GROUP BY track_id, danceability, energy, valence, acousticness, tempo
      )
      SELECT * FROM normalized
    `);

    const data = result.rows;
    if (data.length === 0) {
      throw { status: 400, message: 'No data available for clustering' };
    }

    const maxIter = 50;
    const dims = 5;

    let centroids = [];
    const step = Math.floor(data.length / k);
    for (let i = 0; i < k; i++) {
      const idx = Math.min(i * step, data.length - 1);
      centroids.push([
        data[idx].n_dance || 0,
        data[idx].n_energy || 0,
        data[idx].n_valence || 0,
        data[idx].n_acoustic || 0,
        data[idx].n_tempo || 0,
      ]);
    }

    let assignments = new Array(data.length).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;

      for (let i = 0; i < data.length; i++) {
        const point = [
          data[i].n_dance || 0,
          data[i].n_energy || 0,
          data[i].n_valence || 0,
          data[i].n_acoustic || 0,
          data[i].n_tempo || 0,
        ];
        let minDist = Infinity;
        let bestCluster = 0;

        for (let c = 0; c < k; c++) {
          let dist = 0;
          for (let d = 0; d < dims; d++) {
            dist += Math.pow(point[d] - centroids[c][d], 2);
          }
          if (dist < minDist) {
            minDist = dist;
            bestCluster = c;
          }
        }

        if (assignments[i] !== bestCluster) {
          assignments[i] = bestCluster;
          changed = true;
        }
      }

      if (!changed) break;

      for (let c = 0; c < k; c++) {
        const members = data.filter((_, i) => assignments[i] === c);
        if (members.length > 0) {
          for (let d = 0; d < dims; d++) {
            centroids[c][d] = members.reduce((sum, m) => {
              const val = [m.n_dance, m.n_energy, m.n_valence, m.n_acoustic, m.n_tempo][d];
              return sum + (val || 0);
            }, 0) / members.length;
          }
        }
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM tbl_track_clusters');

      const defaultLabels = [
        'Low Energy Acoustic', 'High Speechiness', 'Instrumental',
        'High Energy', 'Happy/Upbeat', 'Mellow', 'Intense', 'Chill',
        'Dynamic', 'Ambient',
      ];

      const batchSize = 500;
      for (let start = 0; start < data.length; start += batchSize) {
        const end = Math.min(start + batchSize, data.length);
        const values = [];
        const params = [];
        let paramIdx = 1;

        for (let i = start; i < end; i++) {
          const clusterId = assignments[i];
          const label = defaultLabels[clusterId] || `Cluster ${clusterId}`;
          values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
          params.push(data[i].track_id, clusterId, label);
        }

        await client.query(
          `INSERT INTO tbl_track_clusters (track_id, cluster_id, cluster_label) VALUES ${values.join(',')}`,
          params
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    return { clusters: k, tracks: data.length };
  },
};

module.exports = ClusterService;
