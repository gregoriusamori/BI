const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../config/database');
const Genre = require('../models/Genre');
const Artist = require('../models/Artist');

const IntegrationService = {
  async importCSV(filePath) {
    const results = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const imported = await this.processData(results);
            resolve(imported);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', reject);
    });
  },

  async processData(rows) {
    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      try {
        if (!row.Track || !row.Artist) {
          skipped++;
          continue;
        }

        const genre = await Genre.findOrCreate(row.Genre || 'Unknown');
        const artist = await Artist.findOrCreate(row.Artist);

        const durationMs = parseInt(row.Duration) || 0;
        const durationMin = parseFloat((durationMs / 60000).toFixed(2));
        const year = parseInt(row.Year) || 0;
        const decade = year ? Math.floor(year / 10) * 10 : 0;

        const keyMap = { '0': 'C', '1': 'C#', '2': 'D', '3': 'D#', '4': 'E', '5': 'F', '6': 'F#', '7': 'G', '8': 'G#', '9': 'A', '10': 'A#', '11': 'B' };
        const keyNum = parseInt(row.Key) || 0;
        const keyName = keyMap[keyNum.toString()] || 'C';
        const modeName = parseInt(row.Mode) === 1 ? 'Major' : 'Minor';

        const trackResult = await pool.query(
          `INSERT INTO tbl_track (track_name, artist_id, genre_id, year, decade, duration_ms, duration_minutes, time_signature, key, key_name, mode, mode_name)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING track_id`,
          [row.Track, artist.artist_id, genre.genre_id, year, decade, durationMs, durationMin, parseInt(row.Time_Signature) || 4, keyNum, keyName, parseInt(row.Mode) || 0, modeName]
        );

        const trackId = trackResult.rows[0].track_id;

        await pool.query(
          `INSERT INTO tbl_track_audio_features (track_id, danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence, tempo)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [trackId, parseFloat(row.Danceability) || 0, parseFloat(row.Energy) || 0, parseFloat(row.Loudness) || 0, parseFloat(row.Speechiness) || 0, parseFloat(row.Acousticness) || 0, parseFloat(row.Instrumentalness) || 0, parseFloat(row.Liveness) || 0, parseFloat(row.Valence) || 0, parseFloat(row.Tempo) || 0]
        );

        await pool.query(
          'INSERT INTO tbl_track_popularity (track_id, popularity_score) VALUES ($1, $2)',
          [trackId, parseInt(row.Popularity) || 0]
        );

        imported++;
      } catch (err) {
        skipped++;
      }
    }

    return { imported, skipped, total: rows.length };
  },

  async getImportHistory() {
    const result = await pool.query(
      'SELECT * FROM import_history ORDER BY imported_at DESC LIMIT 50'
    );
    return result.rows;
  },

  async saveImportLog(filename, imported, skipped) {
    await pool.query(
      'INSERT INTO import_history (filename, records_imported, records_skipped) VALUES ($1, $2, $3)',
      [filename, imported, skipped]
    );
  },
};

module.exports = IntegrationService;
