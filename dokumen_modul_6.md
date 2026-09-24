DOKUMENTASI EKSPLORASI MODUL 6

- IDENTIFIKASI MODUL DAN TUJUAN UTAMA
- Nama Indikator Utama

Composite Risk Score (CRS)

- Tujuan

Memetakan wilayah berdasarkan prioritas penanganan wilayah dengan mengintegrasikan informasi hazard banjir dan longsor, tingkat paparan, serta kerentanan sosial-ekonomi. Menjelaskan faktor risiko utama suatu wilayah untuk membantu menentukan kebijakan penanganan yang tepat.

- SPESIFIKASI DAN ARSITEKTUR DATA

Sumber Data dan Karakteristik Input

| No  | Nama Dataset / Citra         | Sumber Data / Platform      | Resolusi Spasial            | Frekuensi / Latensi Pembaruan | Tipe Data       |
| --- | ---------------------------- | --------------------------- | --------------------------- | ----------------------------- | --------------- |
| 1   | Batas administrasi           | Badan Informasi Geospasial  | Level Kab/Kota              | Statis                        | Vektor          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 2   | Curah hujan                  | CHIRPS                      | Rata-rata di level Kab/Kota | Statis                        | Vektor          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 3   | DEMNAS                       | Badan Informasi Geospasial  | Median di level Kab/Kota    | Statis                        | Vektor          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 4   | Sentinel 2                   | Badan Antariksa Eropa (ESA) | Rata-rata di level Kab/Kota | Statis                        | Vektor          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 5   | Jenis Tanah                  | FAO Soil Map                | 250 m - 1 km                | Statis                        | Raster          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 6   | Kegunaan bangunan            | Open Street Map             | Rata-rata di level Kab/Kota | Statis                        | Vektor          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 7   | Karakteristik sosial ekonomi | BPS (Provinsi Dalam Angka)  | Level Kab/Kota              | Statis                        | Tabular (.xlsx) |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 8   | Soil Moisture                | NASA SMAP                   | 9 km                        | Harian                        | Raster          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 9   | LULC                         | ESA WorldCover              | 10 m                        | Tahunan                       | Raster          |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |
| 10  | Data Historis Bencana        | BNPB / DIBI                 | Kabupaten/Kota              | Tahunan                       | Tabular         |
| --- | ---                          | ---                         | ---                         | ---                           | ---             |

- TAHAPAN PREPROCESSING & METODE ANALISIS

Data dikumpulkan dari berbagai sumber yang mencakup empat komponen utama penilaian risiko bencana, yaitu data bahaya (_hazard_), keterpaparan (_exposure_), kerentanan (_vulnerability_), dan indeks risiko gabungan (_Climate Risk Score_/CRS). Keempat dataset tersebut masing-masing mencakup 75 satuan wilayah administrasi kabupaten/kota di Indonesia.

Seluruh data kemudian digabungkan (_join_) berdasarkan _primary key_ berupa kode wilayah kabupaten/kota (KDPKAB) yang bersumber dari shapefile batas administrasi. Penggunaan kode unik ini memastikan keselarasan data spasial antar seluruh komponen analisis tanpa terjadi kesalahan pasangan antar wilayah.

Sebelum dilakukan perhitungan indeks, setiap variabel penyusun dinormalisasi terlebih dahulu ke dalam rentang nilai yang terstandar. Proses normalisasi ini bertujuan untuk menghilangkan perbedaan satuan dan skala antar variabel, sehingga setiap indikator memiliki kontribusi yang proporsional dalam perhitungan indeks. Pada indeks bahaya, normalisasi dilakukan terhadap variabel seperti curah hujan, kemiringan lereng, elevasi, NDBI, NDVI, NDWI, serta jenis dan risiko tanah. Pada indeks keterpaparan, normalisasi diterapkan pada variabel penggunaan lahan, jumlah penduduk, dan NDBI. Sementara pada indeks kerentanan, normalisasi mencakup komponen keterpaparan sosial, sensitivitas, dan kapasitas adaptasi.

Hasil perhitungan masing-masing indeks selanjutnya diklasifikasikan menggunakan pendekatan statistik berbasis rata-rata (_mean_) dan standar deviasi (_standard deviation_). Metode ini menghasilkan kelas risiko yang mencerminkan distribusi data aktual, sehingga penetapan kelas tinggi atau rendah bersifat relatif terhadap kondisi keseluruhan wilayah kajian. Klasifikasi ini menghasilkan kategori status seperti _Sangat Tinggi_, _Tinggi_, _Sedang_, dan seterusnya untuk masing-masing indeks hazard, exposure, dan vulnerability.

Sebelum dilakukan perhitungan _Climate Risk Score_ (CRS), ketiga indeks (hazard, exposure, dan vulnerability) dinormalisasi kembali. Normalisasi ulang ini diperlukan untuk memastikan skala ketiga komponen setara sebelum digabungkan dalam formula CRS, sehingga tidak ada satu komponen yang mendominasi secara artifisial akibat perbedaan rentang nilai. Nilai CRS yang dihasilkan kemudian juga diklasifikasikan menggunakan metode _mean_ dan standar deviasi yang sama, menghasilkan kolom status_crs yang mencerminkan tingkat risiko iklim secara holistik per wilayah.

Sebagai tahap akhir, dilakukan visualisasi peta dan grafik untuk menampilkan prioritas penanganan wilayah berdasarkan nilai CRS, sekaligus menampilkan komponen pembentuk indeks (hazard, exposure, dan vulnerability) secara terpisah. Visualisasi ini memungkinkan pengambil kebijakan untuk mengidentifikasi tidak hanya wilayah dengan risiko tertinggi, tetapi juga memahami faktor dominan yang mendorong tingginya risiko di masing-masing kabupaten/kota, sehingga intervensi dapat dirancang secara lebih terarah dan efisien.

- Hazard  
   1\. Ambil data dari modul 2  
   2\. Filter untuk data tahun 2025 (alternatif data November-Desember 2025)  
   3\. Preprocessing imputasi, normalisasi, dan invers data  
   4\. Perhitungan Rumus Indeks Hazard

- Skor Banjir = 0.624 Hujan_norm + 0.127 Slope_inv + 0.107 Elevasi_inv + 0.080 NDWI_norm + 0.045 NDBI_norm + 0.017 SoilRisk_norm
- Skor Longsor = (0.341 Hujan_norm + 0.323 Slope_norm + 0.183 SoilDiv_norm + 0.153 NDVI_inv)
- Hazard = (Skor Banjir + Skor Longsor) / 2

- Vulnerability
- Ambil data dari modul 4
- Preprocessing imputasi dan normalisasi
- Perhitungan average

- Keterpaparan = average (norm_banjir, norm_longsor)
- Sensitivitas = average (norm_miskin, norm_kepadatan, norm_rentan, norm_no_air)
- Kapasitas = average (norm_faskes, norm_listrik, norm_internet

- Perhitungan Rumus Indeks Vulnerability

V = Indeks Keterpaparan + Indeks Sensitivitas - Indeks Kapasitas Adaptasi

- Exposure
- Ambil data NDBI dan jumlah bangunan dari GEE
- Ambil data tipe bangunan dari OSM
- Lakukan perhitungan use_of_building

- Preprocessing imputasi dan normalisasi
- Perhitungan Rumus Indeks Exposure

- E = (0.4329 norm_use) + (0.1994 norm_jumlah) + (0.3677 norm_ndbi)

- CRS
- Normalisasi indeks hazard, vulnerability, dan exposure
- Perhitungan Rumus Composite Risk Score (CRS)

- CRS = H (V + E)

- INTEGRASI DATA DAN SKEMA OUTPUT
- Format File dan Sistem Koordinat

Misaaal

- Data Spasial Vektor: Dieksport dalam format GeoJSON atau Shapefile (.shp) terkompresi untuk rendering peta interaktif batas wilayah.
- Data Tabular/Statistik: Disimpan dalam format JSON biner atau CSV terkompresi agregat per unit administrasi kabupaten/kota.
- Sistem Referensi Koordinat (Spatial CRS): Seluruh data spasial wajib menggunakan proyeksi EPSG:4326 - WGS 84 (Sistem Koordinat Geografis).

| Nama Kolom (Field)    | Tipe Data | Keterangan / Aturan Validasi Nilai                            | Peran Teknis di UI / Dashboard                       |
| --------------------- | --------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| KDPKAB                | String    | Harus unik untuk setiap kabupaten                             | Primary Key untuk seluruh data                       |
| ---                   | ---       | ---                                                           | ---                                                  |
| WADMKK                | String    | Nama provinsi cakupan wilayah analisis (kapitalisasi standar) | Komponen dropdown filter utama web                   |
| ---                   | ---       | ---                                                           | ---                                                  |
| WADMPP                | String    | Nama kabupaten/kota sesuai database master batas administrasi | Komponen induk setiap data dan indeks yang terbentuk |
| ---                   | ---       | ---                                                           | ---                                                  |
| hujan_norm            | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| slope_norm            | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| elevasi_norm          | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| ndbi_norm             | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| ndvi_norm             | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| ndwi_norm             | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| soil_div_norm         | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| soil_risk_norm        | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| elevasi_invers        | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| slope_invers_banjir   | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| ndvi_invers           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| Skor_banjir           | Float     | \-                                                            | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| Skor_Longsor          | Float     | \-                                                            | Penyusun indeks hazard                               |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_hazard_raw     | Float     | \-                                                            | Indeks yang terbentuk                                |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_hazard         | Float     | Ditampilkan di peta                                           | Indeks yang ditampilkan                              |
| ---                   | ---       | ---                                                           | ---                                                  |
| status_hazard         | String    | Kategori Ordinal                                              | Komponen klasifikasi wilayah                         |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_use              | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks exposure                             |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_jumlah           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks exposure                             |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_ndbi             | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks exposure                             |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_exposure_raw   | Float     | \-                                                            | Indeks yang terbentuk                                |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_exposure       | Float     | Ditampilkan di peta                                           | Indeks yang ditampilkan                              |
| ---                   | ---       | ---                                                           | ---                                                  |
| status_exposure       | String    | Kategori Ordinal                                              | Komponen klasifikasi wilayah                         |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_banjir           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_longsor          | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_keterpaparan   | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_miskin           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_kepadatan        | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_rentan           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_no_air           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_sensitivitas   | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_faskes           | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_listrik          | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_internet         | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_adaptasi       | Float     | Ditampilkan dalam bentuk persen                               | Penyusun indeks vulnerability                        |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_kerentanan_raw | Float     | \-                                                            | Indeks yang terbentuk                                |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_kerentanan     | Float     | Ditampilkan di peta                                           | Indeks yang ditampilkan                              |
| ---                   | ---       | ---                                                           | ---                                                  |
| status_vulnerability  | String    | Kategori Ordinal                                              | Komponen klasifikasi wilayah                         |
| ---                   | ---       | ---                                                           | ---                                                  |
| indeks_crs            | Float     | \-                                                            | Indeks yang terbentuk                                |
| ---                   | ---       | ---                                                           | ---                                                  |
| norm_crs              | Float     | Indeks utama                                                  | Indeks prioritas wilayah                             |
| ---                   | ---       | ---                                                           | ---                                                  |
| status_crs            | String    | Kategori Ordinal                                              | Komponen klasifikasi prioritas wilayah               |
| ---                   | ---       | ---                                                           | ---                                                  |

- Rancangan kasar VISUALISASI DASHBOARD & INTERAKSI

Dashboard dibuat untuk menunjukkan wilayah mana saja yang perlu diprioritaskan dalam penanganan pascabencana berdasarkan kombinasi informasi bahaya banjir dan longsor, tingkat paparan, serta kerentanan sosial-ekonomi. Selain itu, tujuannya membantu pengambil kebijakan memahami faktor risiko dominan di suatu wilayah agar penanganan yang dilakukan lebih tepat sasaran. Dashboard ini mencakup seluruh kabupaten/kota di tiga provinsi Aceh, Sumatera Utara, dan Sumatera Barat dengan data yang digunakan merujuk pada tahun 2025.

Dashboard terbagi menjadi tiga tab navigasi. Tab **Wilayah** menjadi halaman utama yang langsung memperlihatkan gambaran besar situasi risiko secara spasial. Visualisasi utamanya adalah _Choropleth Map_ interaktif yang dibangun menggunakan Mapbox GL JS atau Leaflet.js, dengan data spasial berformat GeoJSON yang ditampilkan di atas basemap satelit atau basemap tematik. Setiap poligon kabupaten/kota diwarnai secara dinamis sesuai kelas risiko hasil klasifikasi nilai CRS mulai dari Rendah, Sedang, Tinggi, hingga Sangat Tinggi sehingga pengguna bisa langsung menangkap distribusi risiko secara visual hanya dari tampilan peta. Peta juga dilengkapi mekanisme _hover interaction_. Ketika pengguna mengarahkan kursor ke suatu wilayah, akan muncul popup yang menampilkan nama kabupaten/kota, nilai CRS, kategori risiko, serta indeks penyusun wilayah tersebut. Di sisi kanan peta, tersedia grafik batang interaktif yang dibangun dengan Chart.js atau Recharts untuk merangking kabupaten/kota berdasarkan nilai CRS tertinggi. Grafik ini bersifat responsif dan diperbarui secara dinamis mengikuti filter provinsi yang dipilih pengguna. Selain grafik, tersedia pula kartu ringkasan statistik yang menghitung jumlah kabupaten yang masuk ke dalam masing-masing kelas risiko Sangat Tinggi, Tinggi, Sedang, dan Rendah.

Pada Tab **Komponen** setelah memilih provinsi dan kabupaten tertentu, pengguna bisa melihat nilai indeks CRS, Hazard, Vulnerability, dan Exposure sekaligus dalam satu tampilan kartu ringkasan. Tiga diagram lingkaran di bawahnya kemudian memperlihatkan seberapa besar kontribusi masing-masing variabel penyusun. Nilai variabel ditampilkan dalam nilai yang sudah ternormalisasi. Dengan kombinasi kartu ringkasan dan diagram lingkaran ini, pengguna bisa langsung tahu tidak hanya seberapa tinggi risiko suatu wilayah, tetapi juga variabel spesifik mana yang paling mendorong tingginya angka tersebut, sehingga rekomendasi kebijakan bisa jauh lebih terarah.

Terakhir, Tab **Metadata** berperan sebagai "buku panduan" dari dashboard ini. Di dalamnya tersedia penjelasan tujuan dan ruang lingkup analisis, tabel lengkap yang merinci setiap indikator mulai dari definisi, rumus, hingga cara interpretasinya, serta informasi teknis seperti cakupan wilayah, rentang waktu data, dan level data yang digunakan. Ada pula keterangan mengenai sumber data, metodologi, dan catatan keterbatasan analisis. Tab ini memastikan siapapun yang menggunakan dashboard bisa memahami dari mana angka-angka tersebut berasal dan bagaimana cara membacanya dengan benar, sekaligus menjadi referensi teknis bagi pengembang maupun pengguna lanjutan yang ingin memahami landasan metodologis di balik seluruh visualisasi yang ditampilkan.