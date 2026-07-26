const pool = require('../config/database');

const initSQL = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_genre (
  genre_id SERIAL PRIMARY KEY,
  genre_name VARCHAR(100) NOT NULL,
  genre_category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS tbl_artist (
  artist_id SERIAL PRIMARY KEY,
  artist_name VARCHAR(255) NOT NULL,
  created_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbl_track (
  track_id SERIAL PRIMARY KEY,
  track_name VARCHAR(255) NOT NULL,
  artist_id INTEGER REFERENCES tbl_artist(artist_id),
  genre_id INTEGER REFERENCES tbl_genre(genre_id),
  year INTEGER,
  decade INTEGER,
  duration_ms INTEGER,
  duration_minutes NUMERIC(10,2),
  time_signature INTEGER,
  key INTEGER,
  key_name VARCHAR(10),
  mode INTEGER,
  mode_name VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS tbl_track_audio_features (
  feature_id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES tbl_track(track_id) ON DELETE CASCADE,
  danceability NUMERIC(5,4),
  energy NUMERIC(5,4),
  loudness NUMERIC(8,3),
  speechiness NUMERIC(5,4),
  acousticness NUMERIC(5,4),
  instrumentalness NUMERIC(5,4),
  liveness NUMERIC(5,4),
  valence NUMERIC(5,4),
  tempo NUMERIC(8,3)
);

CREATE TABLE IF NOT EXISTS tbl_track_popularity (
  popularity_id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES tbl_track(track_id) ON DELETE CASCADE,
  popularity_score INTEGER
);

CREATE TABLE IF NOT EXISTS tbl_clusters (
  id SERIAL PRIMARY KEY,
  cluster_id INTEGER,
  cluster_label VARCHAR(100),
  track_id INTEGER REFERENCES tbl_track(track_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_track_clusters (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES tbl_track(track_id) ON DELETE CASCADE,
  cluster_id INTEGER,
  cluster_label VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS import_history (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255),
  records_imported INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  imported_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, email, password, role) VALUES
  ('admin', 'admin@bi.com', '$2a$10$RWtuk/5FK/Cu6YFQveio2OGSCcDzNzyacrRkl5r2xEEtU89HdnqzW', 'admin')
ON CONFLICT (email) DO NOTHING;

DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
`;

async function initDatabase() {
  try {
    console.log('Initializing database...');
    await pool.query(initSQL);
    console.log('Database initialized successfully!');
    console.log('Default admin: admin@bi.com / password');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
}

if (require.main === module) {
  initDatabase().then(() => process.exit(0));
}

module.exports = { initDatabase, initSQL };
