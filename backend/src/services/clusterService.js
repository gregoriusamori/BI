const pool = require('../config/database');

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
              af.danceability, af.energy, af.valence, p.popularity_score
       FROM tbl_track_clusters tc
       JOIN tbl_track t ON tc.track_id = t.track_id
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       WHERE tc.cluster_id = $1
       ORDER BY p.popularity_score DESC
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
    return result.rows;
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
    const result = await pool.query(`
      WITH features AS (
        SELECT track_id, danceability, energy, loudness, speechiness,
               acousticness, instrumentalness, liveness, valence, tempo
        FROM tbl_track_audio_features
      ),
      normalized AS (
        SELECT track_id,
          (danceability - (SELECT MIN(danceability) FROM features)) / NULLIF((SELECT MAX(danceability) - MIN(danceability) FROM features), 0) as n_dance,
          (energy - (SELECT MIN(energy) FROM features)) / NULLIF((SELECT MAX(energy) - MIN(energy) FROM features), 0) as n_energy,
          (valence - (SELECT MIN(valence) FROM features)) / NULLIF((SELECT MAX(valence) - MIN(valence) FROM features), 0) as n_valence,
          (acousticness - (SELECT MIN(acousticness) FROM features)) / NULLIF((SELECT MAX(acousticness) - MIN(acousticness) FROM features), 0) as n_acoustic,
          (tempo - (SELECT MIN(tempo) FROM features)) / NULLIF((SELECT MAX(tempo) - MIN(tempo) FROM features), 0) as n_tempo
        FROM features
      )
      SELECT * FROM normalized
    `);

    const data = result.rows;
    const maxIter = 50;

    let centroids = data.slice(0, k).map(d => [d.n_dance, d.n_energy, d.n_valence, d.n_acoustic, d.n_tempo]);
    let assignments = new Array(data.length).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;

      for (let i = 0; i < data.length; i++) {
        const point = [data[i].n_dance || 0, data[i].n_energy || 0, data[i].n_valence || 0, data[i].n_acoustic || 0, data[i].n_tempo || 0];
        let minDist = Infinity;
        let bestCluster = 0;

        for (let c = 0; c < k; c++) {
          let dist = 0;
          for (let d = 0; d < point.length; d++) {
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
          for (let d = 0; d < centroids[c].length; d++) {
            centroids[c][d] = members.reduce((sum, m) => {
              const val = [m.n_dance, m.n_energy, m.n_valence, m.n_acoustic, m.n_tempo][d];
              return sum + (val || 0);
            }, 0) / members.length;
          }
        }
      }
    }

    await pool.query('DELETE FROM tbl_track_clusters');

    const defaultLabels = ['Low Energy Acoustic', 'High Speechiness', 'Instrumental', 'High Energy', 'Happy/Upbeat'];
    const labels = defaultLabels.slice(0, k);
    while (labels.length < k) {
      labels.push(`Cluster ${labels.length}`);
    }

    for (let i = 0; i < data.length; i++) {
      await pool.query(
        'INSERT INTO tbl_track_clusters (track_id, cluster_id, cluster_label) VALUES ($1, $2, $3)',
        [data[i].track_id, assignments[i], labels[assignments[i]]]
      );
    }

    return { clusters: k, tracks: data.length };
  },
};

module.exports = ClusterService;
