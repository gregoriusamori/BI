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
2. **Database Design**: Merancang database OLTP yang ternormalisasi
3. **Data Warehouse**: Membangun Data Warehouse dengan Star Schema
4. **ETL Process**: Mengimplementasikan proses ETL menggunakan SSIS
5. **OLAP Cube**: Merancang cube untuk analisis multidimensi
6. **Data Mining**: Menggunakan K-Means Clustering untuk pengelompokan lagu
7. **Reporting**: Membuat dashboard menggunakan SSRS

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
│  SSRS (Reporting) │ SSAS (OLAP) │ Power BI │ Excel             │
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
│                    ETL LAYER (SSIS)                              │
│  Extraction │ Staging │ Transformation │ Loading                 │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    DATA SOURCE LAYER                             │
│  ClassicHit.csv │ SpotifyClassicHit_DB (OLTP)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Perancangan Database

### Database OLTP: SpotifyClassicHit_DB

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

### Data Warehouse: SpotifyClassicHit_DW

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

## ETL (SSIS)

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

## Analysis Services (SSAS)

### OLAP Cube: SpotifyClassicHit_Cube

**Dimensions**:
1. DimGenre - Genre musik
2. DimArtist - Artis/Penyanyi
3. DimTime - Waktu (Tahun, Dekade, Quarter)
4. DimTrack - Informasi lagu
5. DimAudioFeatures - Level Energy dan Danceability

**Measures**:
- Track Count (COUNT)
- Average Popularity (AVG)
- Average Energy (AVG)
- Average Danceability (AVG)
- Average Loudness (AVG)
- Average Tempo (AVG)

**KPIs**:
1. Track Popularity KPI - Target: 50
2. Energy Level KPI - Target: 0.60
3. Danceability KPI - Target: 0.55
4. Track Count Growth KPI - Target: 100

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

## Reporting Services (SSRS)

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
C:\Users\ASUS\Documents\BI\
├── ClassicHit.csv                    # Dataset utama
├── Data Spotify/                     # Backup dataset
├── README.md                         # Dokumentasi ini
├── scripts/                          # Script Python
│   ├── 01_analisis_dataset.py        # Phase 1: Analisis dataset
│   ├── 02_preprocess_oltp.py         # Phase 2: Preprocessing OLTP
│   ├── 03_dw_dictionary_mapping.py   # Phase 3: DW dictionary & mapping
│   ├── 03_populate_dw.py             # Phase 3: Populate Data Warehouse
│   ├── 04_ssis_etl_design.py         # Phase 4: SSIS ETL design
│   ├── 05_ssis_olap_design.py        # Phase 5: SSAS OLAP design
│   ├── 06_kmeans_clustering.py       # Phase 6: K-Means clustering
│   ├── 07_ssrs_dashboard.py          # Phase 7: SSRS dashboard design
│   └── 08_visualisasi_reporting.py   # Phase 8: Visualisasi reporting
├── sql/                              # Script SQL
│   ├── oltp/
│   │   └── 01_create_database.sql    # Create OLTP database
│   ├── dw/
│   │   └── 01_create_datawarehouse.sql # Create Data Warehouse
│   ├── ssis/                         # SSIS scripts
│   ├── ssas/                         # SSAS scripts
│   ├── ssrs/                         # SSRS queries
│   └── datamining/                   # Data mining scripts
└── outputs/                          # Hasil analisis
    ├── 01_analisis_ringkasan.json    # Ringkasan analisis
    ├── 01_distribusi_data.png        # Visualisasi distribusi
    ├── 02_boxplot_outlier.png        # Boxplot outlier
    ├── 03_heatmap_korelasi.png       # Heatmap korelasi
    ├── 04_scatter_plots.png          # Scatter plots
    ├── oltp_*.csv                    # Data OLTP
    ├── datawarehouse/                # Data Warehouse
    │   ├── dw_dim_*.csv              # Dimension tables
    │   ├── dw_fact_*.csv             # Fact tables
    │   └── dw_agg_*.csv              # Aggregate tables
    ├── classic_hit_clustered.csv     # Data dengan cluster
    ├── cluster_centers.csv           # Pusat cluster
    ├── cluster_insights.csv          # Insight clustering
    ├── 06_*.png                      # Visualisasi clustering
    └── 07-14_*.png                   # Visualisasi dashboard
```

## Cara Menjalankan Project

### Prerequisites

1. **Python 3.12+** dengan libraries:
   ```
   pip install pandas numpy matplotlib plotly scikit-learn
   ```

2. **SQL Server 2022** dengan:
   - SSIS (Integration Services)
   - SSAS (Analysis Services)
   - SSRS (Reporting Services)

### Langkah-langkah

1. **Phase 1 - Analisis Dataset**:
   ```bash
   python scripts/01_analisis_dataset.py
   ```

2. **Phase 2 - Preprocessing OLTP**:
   ```bash
   python scripts/02_preprocess_oltp.py
   ```

3. **Phase 3 - Populasi Data Warehouse**:
   ```bash
   python scripts/03_populate_dw.py
   ```

4. **Phase 4-7 - SSIS/SSAS/SSRS**:
   - Buka SQL Server Data Tools (SSDT)
   - Import script SQL dari folder `sql/`
   - Jalankan ETL package

5. **Phase 6 - Data Mining**:
   ```bash
   python scripts/06_kmeans_clustering.py
   ```

6. **Phase 8 - Visualisasi**:
   ```bash
   python scripts/08_visualisasi_reporting.py
   ```

## Kesimpulan

Project Business Intelligence ini berhasil:

1. ✅ Menganalisis dataset Spotify dengan 15,150 records
2. ✅ Merancang database OLTP dengan 5 tabel (3NF)
3. ✅ Membangun Data Warehouse dengan Star Schema
4. ✅ Mendesain proses ETL menggunakan SSIS
5. ✅ Merancang OLAP Cube dengan 5 dimensions dan 2 measure groups
6. ✅ Mengimplementasikan K-Means Clustering dengan 5 clusters
7. ✅ Membuat 8 dashboard menggunakan SSRS

**Hasil Utama**:
- Genre Pop mendominasi dengan 24.22% dari total lagu
- Rata-rata popularitas lagu: 43.03
- Rata-rata energy: 0.618
- Rata-rata danceability: 0.575
- Clustering menghasilkan 5 kelompok lagu yang berbeda karakteristik

## Pengembangan Selanjutnya

1. **Real-time ETL**: Implementasi CDC (Change Data Capture)
2. **Machine Learning**: Tambahkan model prediksi popularitas
3. **Web Dashboard**: Integrasi dengan Power BI Service
4. **Mobile App**: Aplikasi mobile untuk akses laporan
5. **Data Quality**: Implementasi data quality rules
6. **Performance**: Optimasi query dan indexing
7. **Security**: Implementasi row-level security
8. **Automation**: Schedule otomatis untuk ETL dan reporting

---

**Author**: BI Project Team
**Date**: July 2026
**Tools**: Python 3.12, SQL Server 2022, SSIS, SSAS, SSRS
