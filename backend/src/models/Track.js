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

  async createWithDetails(data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const trackResult = await client.query(
        `INSERT INTO tbl_track (track_name, artist_id, genre_id, year, decade, duration_ms, duration_minutes, time_signature, key, key_name, mode, mode_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
        [data.track_name, data.artist_id, data.genre_id, data.year, data.decade || null, data.duration_ms || null, data.duration_minutes || null, data.time_signature || 4, data.key || 0, data.key_name || 'C', data.mode || 0, data.mode_name || 'Major']
      );
      const track = trackResult.rows[0];

      await client.query(
        `INSERT INTO tbl_track_audio_features (track_id, danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence, tempo)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [track.track_id, data.danceability || 0, data.energy || 0, data.loudness || 0, data.speechiness || 0, data.acousticness || 0, data.instrumentalness || 0, data.liveness || 0, data.valence || 0, data.tempo || 0]
      );

      await client.query(
        `INSERT INTO tbl_track_popularity (track_id, popularity_score) VALUES ($1, $2)`,
        [track.track_id, data.popularity_score || 0]
      );

      await client.query('COMMIT');
      return track;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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

  async findAllPaginated({ page = 1, limit = 20, search = '', sort = 'track_id', order = 'asc', genre = '', artist = '' } = {}) {
    const offset = (page - 1) * limit;
    const allowedSort = ['track_id', 'track_name', 'artist_name', 'genre_name', 'year', 'duration_minutes', 'popularity_score', 'danceability', 'energy'];
    const sortCol = allowedSort.includes(sort) ? sort : 'track_id';
    const sortDir = order === 'desc' ? 'DESC' : 'ASC';

    const sortMap = {
      artist_name: 'a.artist_name',
      genre_name: 'g.genre_name',
      popularity_score: 'p.popularity_score',
      danceability: 'af.danceability',
      energy: 'af.energy',
    };
    const orderBy = sortMap[sortCol] || `t.${sortCol}`;

    let where = 'WHERE 1=1';
    const params = [];
    let idx = 1;

    if (search) {
      where += ` AND (t.track_name ILIKE $${idx} OR a.artist_name ILIKE $${idx} OR g.genre_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    if (genre) {
      where += ` AND g.genre_name = $${idx++}`;
      params.push(genre);
    }
    if (artist) {
      where += ` AND a.artist_name = $${idx++}`;
      params.push(artist);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await pool.query(
      `SELECT t.track_id, t.track_name, t.artist_id, t.genre_id, t.year, t.decade,
              t.duration_ms, t.duration_minutes, t.time_signature,
              a.artist_name, g.genre_name,
              af.danceability, af.energy, af.loudness, af.speechiness,
              af.acousticness, af.instrumentalness, af.liveness, af.valence, af.tempo,
              p.popularity_score
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       ${where}
       ORDER BY ${orderBy} ${sortDir}
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    return { data: dataResult.rows, total, page, limit, totalPages: Math.ceil(total / limit) };
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

  async findByIdFull(id) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name,
              af.danceability, af.energy, af.loudness, af.speechiness,
              af.acousticness, af.instrumentalness, af.liveness, af.valence, af.tempo,
              p.popularity_score
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
       LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
       WHERE t.track_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async count() {
    const result = await pool.query('SELECT COUNT(*) FROM tbl_track');
    return parseInt(result.rows[0].count);
  },

  async updateWithDetails(id, data) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE tbl_track SET track_name=$1, artist_id=$2, genre_id=$3, year=$4, decade=$5,
         duration_ms=$6, duration_minutes=$7, time_signature=$8, key=$9, key_name=$10, mode=$11, mode_name=$12
         WHERE track_id=$13`,
        [data.track_name, data.artist_id, data.genre_id, data.year, data.decade || null, data.duration_ms || null, data.duration_minutes || null, data.time_signature || 4, data.key || 0, data.key_name || 'C', data.mode || 0, data.mode_name || 'Major', id]
      );

      await client.query(
        `UPDATE tbl_track_audio_features SET danceability=$1, energy=$2, loudness=$3, speechiness=$4,
         acousticness=$5, instrumentalness=$6, liveness=$7, valence=$8, tempo=$9
         WHERE track_id=$10`,
        [data.danceability || 0, data.energy || 0, data.loudness || 0, data.speechiness || 0, data.acousticness || 0, data.instrumentalness || 0, data.liveness || 0, data.valence || 0, data.tempo || 0, id]
      );

      await client.query(
        `UPDATE tbl_track_popularity SET popularity_score=$1 WHERE track_id=$2`,
        [data.popularity_score || 0, id]
      );

      await client.query('COMMIT');
      return await this.findByIdFull(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
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

  async findByArtist(artistName, limit = 100) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       WHERE a.artist_name = $1
       ORDER BY t.year, t.track_name
       LIMIT $2`,
      [artistName, limit]
    );
    return result.rows;
  },

  async findByYear(year, limit = 200) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       WHERE t.year = $1
       ORDER BY t.track_name
       LIMIT $2`,
      [year, limit]
    );
    return result.rows;
  },

  async findByDecade(decade, limit = 500) {
    const result = await pool.query(
      `SELECT t.*, a.artist_name, g.genre_name
       FROM tbl_track t
       LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
       LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
       WHERE t.decade = $1
       ORDER BY t.year, t.track_name
       LIMIT $2`,
      [decade, limit]
    );
    return result.rows;
  },

  async filter({ genre, artist, year, decade, search }, limit = 100) {
    let query = `
      SELECT t.*, a.artist_name, g.genre_name,
             p.popularity_score
      FROM tbl_track t
      LEFT JOIN tbl_artist a ON t.artist_id = a.artist_id
      LEFT JOIN tbl_genre g ON t.genre_id = g.genre_id
      LEFT JOIN tbl_track_popularity p ON t.track_id = p.track_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (genre) {
      query += ` AND g.genre_name = $${idx++}`;
      params.push(genre);
    }
    if (artist) {
      query += ` AND a.artist_name = $${idx++}`;
      params.push(artist);
    }
    if (year) {
      query += ` AND t.year = $${idx++}`;
      params.push(parseInt(year));
    }
    if (decade) {
      query += ` AND t.decade = $${idx++}`;
      params.push(parseInt(decade));
    }
    if (search) {
      query += ` AND (t.track_name ILIKE $${idx} OR a.artist_name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY p.popularity_score DESC NULLS LAST, t.track_name LIMIT $${idx}`;
    params.push(limit);

    const result = await pool.query(query, params);
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM tbl_track_popularity WHERE track_id = $1', [id]);
      await client.query('DELETE FROM tbl_track_audio_features WHERE track_id = $1', [id]);
      const result = await client.query('DELETE FROM tbl_track WHERE track_id = $1 RETURNING *', [id]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};

module.exports = Track;
