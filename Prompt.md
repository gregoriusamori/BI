Saya punya project dashboard Business Intelligence. Di root folder ada file README.md yang berisi rencana BI lengkap - baca dan pahami dulu file itu sepenuhnya sebelum mulai coding. Ada juga file bernama ClassicHit.csv yang akan jadi sumber data dashboard ini.

Bangun dashboard BI dengan stack:
- Backend: Node.js (Express atau NestJS, pilih yang paling cocok untuk struktur modular)
- Frontend: React (dengan Vite), desain modern minimalis - clean layout, whitespace cukup, palet warna netral, tipografi jelas, gunakan library chart seperti Recharts atau ECharts
- Database: PostgreSQL

Fitur yang wajib ada:
1. BI Analysis Services - analisis data sesuai README.md
2. Integration Services - service untuk import/parsing dataset dari folder sources ke PostgreSQL, termasuk data cleaning/transformasi
3. Data Mining - ekstraksi pola/insight dari data (bisa pakai library seperti ml.js, danfojs, atau simple-statistics)
4. Reporting Services - generate laporan (bisa export PDF/Excel atau tampilan report di dashboard)
5. Clustering Support - pengelompokan data (misal cluster sesuai file README.md), gunakan algoritma seperti k-means dari library JS yang sesuai
6. buatkan sebuah input file dataset apapun, dataset yang ada di folder yang kamu baca sebagai referensi saja, buatkan database nya fleksibel dengan database apapun kedepannya dengan tabel yang berbeda beda
7. sebelum masuk dashboard buatkan landing page dan landing page nya ada bar nantinya disisi kanan atas ada opsi untuk login admin dan user

Requirement teknis penting:
- Ikuti detail dan struktur yang sudah dijelaskan di planning.md sebagai acuan utama
- Pisahkan kode ke banyak file/module sesuai tanggung jawabnya (controllers, services, routes, models, utils, components, hooks, dll) - JANGAN taruh semua logic dalam satu file besar beribu-ribu baris
- Backend dan frontend dipisah folder yang jelas
- Setiap service (BI analysis, integration, data mining, reporting, clustering) punya file/module sendiri-sendiri dengan tanggung jawab yang jelas
- Gunakan environment variable untuk koneksi database (.env)
- Buat struktur folder yang rapi dan scalable
- Setelah dataset di-import ke PostgreSQL, buat skema tabel yang fleksibel
- buatkan .gitignore untuk sembunyikan data sensitif
Sebelum mulai coding, tampilkan dulu rencana struktur folder dan arsitekturnya ke saya untuk saya review, baru lanjut implementasi.
