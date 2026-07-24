# Spotify Classic Hits - Business Intelligence Project

## Latar Belakang

Project Business Intelligence ini dibangun untuk menganalisis dataset musik Spotify yang berisi lagu-lagu klasik dari berbagai genre. Dataset ini memiliki 15,150 records dengan 18 kolom yang mencakup informasi audio features, popularitas, dan metadata lagu.

Business Intelligence diperlukan untuk:
- Mengolah data mentah menjadi informasi yang bermakna
- Membantu pengambilan keputusan berbasis data
- Menyediakan dashboard dan laporan untuk analisis mendalam
- Mengidentifikasi pola dan tren dalam industri musik

## Tujuan Project

1. **Analisis Data**: Memahami struktur dan karakteristik dataset
2. **Database Design**: Merancang database OLTP yang ternormalisasi menggunakan PostgreSQL
3. **Data Warehouse**: Membangun Data Warehouse dengan Star Schema menggunakan dbt
4. **ETL Process**: Mengimplementasikan proses ETL menggunakan Apache Airflow
5. **OLAP Cube**: Merancang cube untuk analisis multidimensi
6. **Data Mining**: Menggunakan K-Means Clustering untuk pengelompokan lagu
7. **Reporting**: Membuat dashboard menggunakan Apache Superset

## Deskripsi Dataset

**File**: `ClassicHit.csv`

| Kolom | Tipe Data | Deskripsi |
|-------|-----------|-----------|
| Track | string | Nama lagu |
| Artist | string | Nama artis |
| Year | integer | Tahun rilis |
| Duration | integer | Durasi dalam milidetik |
| Time_Signature | integer | Time signature (3, 4, 5) |
| Danceability | float | Skor danceability (0-1) |
| Energy | float | Skor energy (0-1) |
| Key | integer | Nada dasar (0-11) |
| Loudness | float | Loudness dalam dB |
| Mode | integer | Mode (0=Minor, 1=Major) |
| Speechiness | float | Skor speechiness (0-1) |
| Acousticness | float | Skor acousticness (0-1) |
| Instrumentalness | float | Skor instrumentalness (0-1) |
| Liveness | float | Skor liveness (0-1) |
| Valence | float | Skor valence (0-1) |
| Tempo | float | Tempo dalam BPM |
| Popularity | integer | Skor popularitas (0-100) |
| Genre | string | Genre musik |

**Statistik Utama**:
- Total Records: 15,150
- Total Genre: 19
- Total Artist: 3,083
- Rentang Tahun: 1899 - 2024
- Missing Values: 0

## Arsitektur Business Intelligence

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS INTEGRATION LAYER                    │
│  Apache Superset │ Grafana │ REST API │ Web Dashboard            │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYSIS LAYER                                │
│  Data Mining (K-Means) │ OLAP Cube │ Calculated Members        │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    DATA WAREHOUSE LAYER                          │
│  Star Schema │ Fact Tables │ Dimension Tables │ Aggregates      │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    ETL LAYER (Apache Airflow)                    │
│  Extraction │ Staging │ Transformation │ Loading                 │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    DATA SOURCE LAYER                             │
│  ClassicHit.csv │ PostgreSQL (OLTP) │ Redis (Cache)             │
└─────────────────────────────────────────────────────────────────┘
```

## Perancangan Database

### Database OLTP: PostgreSQL

**ERD (Entity Relationship Diagram)**:

```
+------------------+       +------------------+
|    tbl_genre     |       |    tbl_artist    |
|------------------|       |------------------|
| *genre_id (PK)   |       | *artist_id (PK)  |
|  genre_name      |       |  artist_name     |
|  genre_category  |       |  created_date    |
+------------------+       +------------------+
         |                          |
         | 1:N                      | 1:N
         v                          v
+--------------------------------------------------------------+
|                       tbl_track                              |
|--------------------------------------------------------------|
| *track_id (PK)                                               |
|  track_name                                                  |
|  artist_id (FK)                                              |
|  genre_id (FK)                                               |
|  year, decade, duration_ms, duration_minutes                 |
|  time_signature, key, key_name, mode, mode_name              |
+--------------------------------------------------------------+
         |                                    |
         | 1:1                                | 1:N
         v                                    v
+------------------------------+  +------------------------------+
| tbl_track_audio_features     |  | tbl_track_popularity         |
|------------------------------|  |------------------------------|
| *feature_id (PK)             |  | *popularity_id (PK)          |
|  track_id (FK)               |  |  track_id (FK)               |
|  danceability, energy, etc.  |  |  popularity_score            |
+------------------------------+  +------------------------------+
```

**Tabel yang Dibuat**:
1. `tbl_genre` - 19 records
2. `tbl_artist` - 3,083 records
3. `tbl_track` - 15,149 records
4. `tbl_track_audio_features` - 15,149 records
5. `tbl_track_popularity` - 15,149 records

**Normalisasi**: 3NF (Third Normal Form)

### Data Warehouse: Star Schema

**Star Schema**:

```
                    +------------------+
                    |    dim_time      |
                    |------------------|
                    | *time_key (PK)   |
                    |  year, decade    |
                    |  quarter, month  |
                    +--------+---------+
                             │
                             │ 1:N
                             v
+------------------+  +------------------+  +------------------+
|    dim_genre     |  |    fact_track    |  |    dim_artist    |
|------------------|  |------------------|  |------------------|
| *genre_key (PK)  |  | *track_fact_key  |  | *artist_key (PK) |
|  genre_name      |<--+  track_key (FK) |  |  artist_name     |
|  genre_category  |  |  genre_key (FK)  |-->|                  |
+------------------+  |  artist_key (FK) |  +------------------+
                      |  time_key (FK)   |
+------------------+  |  audio_key (FK)  |  +------------------+
| dim_audio_features|  |  popularity_score|  |   dim_track      |
|------------------|<--+  track_count     |  |------------------|
| *audio_key (PK)  |  +------------------+  | *track_key (PK)  |
|  danceability    |                         |  track_name      |
|  energy_level    |                         |  key_name        |
|  dance_level     |                         |  duration_minutes|
+------------------+                         +------------------+
```

**Dimension Tables**:
- `dim_genre` - 19 records
- `dim_artist` - 3,083 records
- `dim_time` - 108 records
- `dim_track` - 15,149 records
- `dim_audio_features` - 15,149 records

**Fact Tables**:
- `fact_track` - 15,149 records

**Aggregate Tables**:
- `agg_genre_stats` - 991 records
- `agg_artist_stats` - 8,565 records

## ETL (Apache Airflow)

### Proses ETL

1. **Extraction**: Membaca data dari CSV file
2. **Staging**: Menyimpan data mentah di staging table
3. **Transformation**:
   - Pembersihan data (menghapus duplikat)
   - Feature engineering (Duration_Minutes, Decade, Key_Name, Mode_Name)
   - Validasi data
4. **Loading**: Memuat data ke Data Warehouse

### Flow ETL

```
CSV File → Staging Table → Data Cleaning → Dimension Tables → Fact Table → Aggregate Tables
```

## Data Transformation (dbt)

### Models

1. **Staging Models**: `stg_classic_hit.csv`
2. **Dimension Models**: `dim_genre`, `dim_artist`, `dim_time`, `dim_track`, `dim_audio_features`
3. **Fact Models**: `fact_track`
4. **Aggregate Models**: `agg_genre_stats`, `agg_artist_stats`

### Tests

- Uniqueness tests on primary keys
- Not null tests on required fields
- Referential integrity tests on foreign keys
- Accepted value tests on categorical fields

## Data Mining

### K-Means Clustering

**Fitur yang Digunakan**:
1. Danceability
2. Energy
3. Loudness
4. Speechiness
5. Acousticness
6. Instrumentalness
7. Liveness
8. Valence
9. Tempo

**Hasil Clustering (K=5)**:

| Cluster | Label | Jumlah | Top Genre | Avg Popularity |
|---------|-------|--------|-----------|----------------|
| 0 | Low Energy Acoustic | 3,461 | Pop | 37.5 |
| 1 | High Speechiness | 1,100 | Rap | 49.2 |
| 2 | Instrumental | 1,224 | Jazz | 33.3 |
| 3 | High Energy | 3,970 | Metal | 45.4 |
| 4 | Happy/Upbeat | 5,395 | Pop | 45.7 |

**Silhouette Score**: 0.1874

**Business Insight**:
- Cluster 0: Cocok untuk playlist chill/relax/study
- Cluster 1: Cocok untuk playlist hip-hop/rap
- Cluster 2: Cocok untuk playlist instrumental/jazz
- Cluster 3: Cocok untuk playlist workout/gym
- Cluster 4: Cocok untuk playlist happy/morning

## Reporting (Apache Superset)

### Dashboard yang Dibuat

1. **Executive Dashboard** - Overview metrics utama
2. **Top Artist Dashboard** - Analisis artist mendalam
3. **Top Genre Dashboard** - Analisis genre mendalam
4. **Popularity Analysis** - Analisis popularitas lagu
5. **Danceability Analysis** - Analisis danceability
6. **Energy Analysis** - Analisis energy lagu
7. **Clustering Dashboard** - Visualisasi hasil clustering
8. **KPI Dashboard** - Key Performance Indicators

## Struktur Folder Project

```
C:\Users\ASUS\Documents\PROJECT BI\
├── ClassicHit.csv                    # Dataset utama
├── Data Spotify/                     # Backup dataset
├── README.md                         # Dokumentasi ini
├── docker-compose.yml                # Docker configuration
├── package.json                      # Node.js dependencies
├── src/                              # Source code
│   ├── config/
│   │   └── database.js               # Database configuration
│   ├── dbt/                          # dbt models
│   │   ├── staging/
│   │   │   └── stg_classic_hit.sql
│   │   ├── models/
│   │   │   ├── dim_genre.sql
│   │   │   ├── dim_artist.sql
│   │   │   ├── dim_time.sql
│   │   │   ├── dim_track.sql
│   │   │   ├── dim_audio_features.sql
│   │   │   ├── fact_track.sql
│   │   │   ├── agg_genre_stats.sql
│   │   │   └── agg_artist_stats.sql
│   │   └── tests/
│   │       └── generic/
│   │           ├── uniqueness.sql
│   │           └── not_null.sql
│   ├── etl/                          # ETL scripts
│   │   ├── airflow/
│   │   │   └── dags/
│   │   │       └── etl_pipeline.py
│   │   └── scripts/
│   │       ├── extract.py
│   │       ├── transform.py
│   │       └── load.py
│   ├── api/                          # REST API
│   │   ├── routes/
│   │   │   ├── tracks.js
│   │   │   ├── artists.js
│   │   │   └── analytics.js
│   │   └── server.js
│   └── scripts/                      # Utility scripts
│       ├── 01_analisis_dataset.js
│       ├── 02_preprocess_oltp.js
│       ├── 03_populate_dw.js
│       ├── 06_kmeans_clustering.js
│       └── 08_visualisasi_reporting.js
├── sql/                              # SQL scripts
│   ├── oltp/
│   │   └── 01_create_database.sql
│   ├── dw/
│   │   └── 01_create_datawarehouse.sql
│   ├── dbt/
│   │   └── 01_create_models.sql
│   └── tests/
│       └── 01_create_tests.sql
├── outputs/                          # Hasil analisis
│   ├── 01_analisis_ringkasan.json
│   ├── 01_distribusi_data.png
│   ├── 02_boxplot_outlier.png
│   ├── 03_heatmap_korelasi.png
│   ├── 04_scatter_plots.png
│   ├── oltp_*.csv
│   ├── datawarehouse/
│   │   ├── dw_dim_*.csv
│   │   ├── dw_fact_*.csv
│   │   └── dw_agg_*.csv
│   ├── classic_hit_clustered.csv
│   ├── cluster_centers.csv
│   ├── cluster_insights.csv
│   ├── 06_*.png
│   └── 07-14_*.png
├── docker/                           # Docker configurations
│   ├── airflow/
│   │   └── Dockerfile
│   ├── superset/
│   │   └── Dockerfile
│   └── redis/
│       └── redis.conf
└── docs/                             # Documentation
    ├── architecture.md
    ├── data_dictionary.md
    └── api_documentation.md
```

## Cara Menjalankan Project

### Prerequisites

1. **Node.js 20+** dengan packages:
   ```bash
   npm install
   ```

2. **PostgreSQL 16+**

3. **Docker & Docker Compose**

4. **Apache Airflow** (via Docker)

5. **dbt** (via npm)

6. **Apache Superset** (via Docker)

### Langkah-langkah

1. **Setup Docker Environment**:
   ```bash
   docker-compose up -d
   ```

2. **Initialize Database**:
   ```bash
   psql -U postgres -f sql/oltp/01_create_database.sql
   psql -U postgres -f sql/dw/01_create_datawarehouse.sql
   ```

3. **Run dbt Models**:
   ```bash
   cd src/dbt
   dbt run
   dbt test
   ```

4. **Run ETL Pipeline**:
   ```bash
   # Via Airflow UI or CLI
   airflow dags trigger etl_pipeline
   ```

5. **Start REST API**:
   ```bash
   node src/api/server.js
   ```

6. **Access Apache Superset**:
   - URL: http://localhost:8088
   - Username: admin
   - Password: admin

7. **Run Data Mining**:
   ```bash
   node src/scripts/06_kmeans_clustering.js
   ```

## API Documentation

### Endpoints

#### Tracks
- `GET /api/tracks` - Get all tracks
- `GET /api/tracks/:id` - Get track by ID
- `GET /api/tracks/genre/:genre` - Get tracks by genre

#### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist by ID
- `GET /api/artists/top` - Get top artists

#### Analytics
- `GET /api/analytics/popularity` - Get popularity analytics
- `GET /api/analytics/genre-stats` - Get genre statistics
- `GET /api/analytics/clusters` - Get clustering results

## Teknologi yang Digunakan

### Backend
- **Node.js 20+** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL 16** - Database OLTP & Data Warehouse
- **Redis** - Caching layer

### Data Engineering
- **Apache Airflow** - Workflow orchestration
- **dbt** - Data transformation
- **pg** - PostgreSQL driver for Node.js

### Data Analysis
- **K-Means Clustering** - Machine learning algorithm
- **Node.js ML Libraries** - Data processing

### Reporting & Visualization
- **Apache Superset** - Business intelligence platform
- **Grafana** - Monitoring dashboards

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Kesimpulan

Project Business Intelligence ini berhasil:

1. ✅ Menganalisis dataset Spotify dengan 15,150 records
2. ✅ Merancang database OLTP dengan 5 tabel (3NF) menggunakan PostgreSQL
3. ✅ Membangun Data Warehouse dengan Star Schema menggunakan dbt
4. ✅ Mendesain proses ETL menggunakan Apache Airflow
5. ✅ Mengimplementasikan K-Means Clustering dengan 5 clusters
6. ✅ Membuat 8 dashboard menggunakan Apache Superset
7. ✅ Mengembangkan REST API untuk akses data

**Hasil Utama**:
- Genre Pop mendominasi dengan 24.22% dari total lagu
- Rata-rata popularitas lagu: 43.03
- Rata-rata energy: 0.618
- Rata-rata danceability: 0.575
- Clustering menghasilkan 5 kelompok lagu yang berbeda karakteristik

## Pengembangan Selanjutnya

1. **Real-time ETL**: Implementasi CDC (Change Data Capture) dengan Debezium
2. **Machine Learning**: Tambahkan model prediksi popularitas
3. **Web Dashboard**: Frontend dengan React atau Vue.js
4. **Mobile App**: Aplikasi mobile untuk akses laporan
5. **Data Quality**: Implementasi data quality rules dengan Great Expectations
6. **Performance**: Optimasi query dan indexing
7. **Security**: Implementasi row-level security
8. **Automation**: Schedule otomatis untuk ETL dan reporting
9. **Monitoring**: Implementasi observability dengan Prometheus dan Grafana
10. **CI/CD**: Pipeline otomatis dengan GitHub Actions

---

**Author**: BI Project Team
**Date**: July 2026
**Tools**: Node.js 20+, PostgreSQL 16, Apache Airflow, dbt, Apache Superset, Docker
