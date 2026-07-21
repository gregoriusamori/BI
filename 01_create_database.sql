/*
================================================================
  Script: Create Database SpotifyClassicHit_DB
  Description: Membuat database OLTP untuk dataset ClassicHit
  Compatible: SQL Server 2022
  Author: BI Project
  Date: 2026-07-19
================================================================
*/

-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================
USE master;
GO

-- Hapus database jika sudah ada
IF DB_ID('SpotifyClassicHit_DB') IS NOT NULL
BEGIN
    ALTER DATABASE SpotifyClassicHit_DB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SpotifyClassicHit_DB;
END
GO

-- Buat database baru
CREATE DATABASE SpotifyClassicHit_DB
ON PRIMARY (
    NAME = N'SpotifyClassicHit_Data',
    FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\SpotifyClassicHit_Data.mdf',
    SIZE = 100MB,
    MAXSIZE = UNLIMITED,
    FILEGROWTH = 50MB
)
LOG ON (
    NAME = N'SpotifyClassicHit_Log',
    FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\SpotifyClassicHit_Log.ldf',
    SIZE = 50MB,
    MAXSIZE = UNLIMITED,
    FILEGROWTH = 25MB
);
GO

USE SpotifyClassicHit_DB;
GO

PRINT 'Database SpotifyClassicHit_DB berhasil dibuat!';
GO

-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

-- Tabel Genre
CREATE TABLE tbl_genre (
    genre_id        INT IDENTITY(1,1) PRIMARY KEY,
    genre_name      VARCHAR(50) NOT NULL UNIQUE,
    genre_category  VARCHAR(50) NULL,
    created_date    DATETIME DEFAULT GETDATE()
);

PRINT 'Tabel tbl_genre berhasil dibuat!';
GO

-- Tabel Artist
CREATE TABLE tbl_artist (
    artist_id       INT IDENTITY(1,1) PRIMARY KEY,
    artist_name     VARCHAR(100) NOT NULL,
    created_date    DATETIME DEFAULT GETDATE()
);

PRINT 'Tabel tbl_artist berhasil dibuat!';
GO

-- Tabel Track
CREATE TABLE tbl_track (
    track_id            INT IDENTITY(1,1) PRIMARY KEY,
    track_name          VARCHAR(200) NOT NULL,
    artist_id           INT NOT NULL,
    genre_id            INT NOT NULL,
    year                INT NOT NULL,
    decade              INT NOT NULL,
    duration_ms         BIGINT NOT NULL,
    duration_minutes    DECIMAL(6,2) NOT NULL,
    time_signature      INT NOT NULL DEFAULT 4,
    key                 INT NOT NULL,
    key_name            VARCHAR(5) NOT NULL,
    mode                INT NOT NULL,
    mode_name           VARCHAR(10) NOT NULL,
    created_date        DATETIME DEFAULT GETDATE(),

    -- Foreign Keys
    CONSTRAINT FK_track_artist FOREIGN KEY (artist_id)
        REFERENCES tbl_artist(artist_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT FK_track_genre FOREIGN KEY (genre_id)
        REFERENCES tbl_genre(genre_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Check Constraints
    CONSTRAINT CK_track_year CHECK (year >= 1900 AND year <= 2100),
    CONSTRAINT CK_track_duration CHECK (duration_ms > 0),
    CONSTRAINT CK_track_key CHECK (key >= 0 AND key <= 11),
    CONSTRAINT CK_track_mode CHECK (mode IN (0, 1)),
    CONSTRAINT CK_track_time_sig CHECK (time_signature IN (3, 4, 5))
);

PRINT 'Tabel tbl_track berhasil dibuat!';
GO

-- Tabel Audio Features
CREATE TABLE tbl_track_audio_features (
    feature_id          INT IDENTITY(1,1) PRIMARY KEY,
    track_id            INT NOT NULL UNIQUE,
    danceability        DECIMAL(5,4) NOT NULL,
    energy              DECIMAL(5,4) NOT NULL,
    loudness            DECIMAL(7,3) NOT NULL,
    speechiness         DECIMAL(5,4) NOT NULL,
    acousticness        DECIMAL(5,4) NOT NULL,
    instrumentalness    DECIMAL(5,4) NOT NULL,
    liveness            DECIMAL(5,4) NOT NULL,
    valence             DECIMAL(5,4) NOT NULL,
    tempo               DECIMAL(7,3) NOT NULL,
    created_date        DATETIME DEFAULT GETDATE(),

    -- Foreign Key
    CONSTRAINT FK_audio_track FOREIGN KEY (track_id)
        REFERENCES tbl_track(track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Check Constraints
    CONSTRAINT CK_audio_dance CHECK (danceability >= 0 AND danceability <= 1),
    CONSTRAINT CK_audio_energy CHECK (energy >= 0 AND energy <= 1),
    CONSTRAINT CK_audio_speech CHECK (speechiness >= 0 AND speechiness <= 1),
    CONSTRAINT CK_audio_acoustic CHECK (acousticness >= 0 AND acousticness <= 1),
    CONSTRAINT CK_audio_instrument CHECK (instrumentalness >= 0 AND instrumentalness <= 1),
    CONSTRAINT CK_audio_live CHECK (liveness >= 0 AND liveness <= 1),
    CONSTRAINT CK_audio_valence CHECK (valence >= 0 AND valence <= 1),
    CONSTRAINT CK_audio_tempo CHECK (tempo >= 0)
);

PRINT 'Tabel tbl_track_audio_features berhasil dibuat!';
GO

-- Tabel Popularity
CREATE TABLE tbl_track_popularity (
    popularity_id       INT IDENTITY(1,1) PRIMARY KEY,
    track_id            INT NOT NULL,
    popularity_score    INT NOT NULL,
    recorded_date       DATE NOT NULL DEFAULT GETDATE(),
    created_date        DATETIME DEFAULT GETDATE(),

    -- Foreign Key
    CONSTRAINT FK_popularity_track FOREIGN KEY (track_id)
        REFERENCES tbl_track(track_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    -- Check Constraints
    CONSTRAINT CK_popularity_score CHECK (popularity_score >= 0 AND popularity_score <= 100)
);

PRINT 'Tabel tbl_track_popularity berhasil dibuat!';
GO

-- ============================================================
-- 3. CREATE INDEXES
-- ============================================================

-- Index untuk performa query
CREATE INDEX IX_track_artist ON tbl_track(artist_id);
CREATE INDEX IX_track_genre ON tbl_track(genre_id);
CREATE INDEX IX_track_year ON tbl_track(year);
CREATE INDEX IX_track_decade ON tbl_track(decade);
CREATE INDEX IX_track_name ON tbl_track(track_name);
CREATE INDEX IX_audio_track ON tbl_track_audio_features(track_id);
CREATE INDEX IX_popularity_track ON tbl_track_popularity(track_id);
CREATE INDEX IX_popularity_score ON tbl_track_popularity(popularity_score);

PRINT 'Indexes berhasil dibuat!';
GO

-- ============================================================
-- 4. CREATE VIEWS
-- ============================================================

-- View: Lengkap dengan join semua tabel
CREATE VIEW vw_track_complete AS
SELECT
    t.track_id,
    t.track_name,
    a.artist_name,
    g.genre_name,
    t.year,
    t.decade,
    t.duration_minutes,
    t.time_signature,
    t.key_name,
    t.mode_name,
    af.danceability,
    af.energy,
    af.loudness,
    af.speechiness,
    af.acousticness,
    af.instrumentalness,
    af.liveness,
    af.valence,
    af.tempo,
    tp.popularity_score
FROM tbl_track t
INNER JOIN tbl_artist a ON t.artist_id = a.artist_id
INNER JOIN tbl_genre g ON t.genre_id = g.genre_id
LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
LEFT JOIN tbl_track_popularity tp ON t.track_id = tp.track_id;

PRINT 'View vw_track_complete berhasil dibuat!';
GO

-- View: Statistik per Genre
CREATE VIEW vw_genre_statistics AS
SELECT
    g.genre_name,
    COUNT(DISTINCT t.track_id) AS total_tracks,
    COUNT(DISTINCT a.artist_id) AS total_artists,
    AVG(t.duration_minutes) AS avg_duration_min,
    AVG(af.energy) AS avg_energy,
    AVG(af.danceability) AS avg_danceability,
    AVG(af.loudness) AS avg_loudness,
    AVG(tp.popularity_score) AS avg_popularity
FROM tbl_genre g
INNER JOIN tbl_track t ON g.genre_id = t.genre_id
INNER JOIN tbl_artist a ON t.artist_id = a.artist_id
LEFT JOIN tbl_track_audio_features af ON t.track_id = af.track_id
LEFT JOIN tbl_track_popularity tp ON t.track_id = tp.track_id
GROUP BY g.genre_name;

PRINT 'View vw_genre_statistics berhasil dibuat!';
GO

-- ============================================================
-- 5. SELEKSI
-- ============================================================

PRINT '====================================';
PRINT 'SPOTIFY CLASSIC HIT DB - SELESAI!';
PRINT '====================================';
PRINT 'Tabel yang dibuat:';
PRINT '  1. tbl_genre';
PRINT '  2. tbl_artist';
PRINT '  3. tbl_track';
PRINT '  4. tbl_track_audio_features';
PRINT '  5. tbl_track_popularity';
PRINT '';
PRINT 'Views yang dibuat:';
PRINT '  1. vw_track_complete';
PRINT '  2. vw_genre_statistics';
PRINT '';
PRINT 'Indexes yang dibuat:';
PRINT '  1. IX_track_artist';
PRINT '  2. IX_track_genre';
PRINT '  3. IX_track_year';
PRINT '  4. IX_track_decade';
PRINT '  5. IX_track_name';
PRINT '  6. IX_audio_track';
PRINT '  7. IX_popularity_track';
PRINT '  8. IX_popularity_score';
GO
