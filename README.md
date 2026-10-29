# Dashboard Big Data PKL 65

Dashboard web untuk eksplorasi dan analisis data kebencanaan di wilayah Aceh,
Sumatera Utara, dan Sumatera Barat. Aplikasi ini terdiri dari delapan modul
analisis yang diakses melalui halaman beranda dashboard.

## Teknologi

- Next.js 16 dengan App Router
- React 19
- JavaScript (`.js` dan `.jsx`)
- Tailwind CSS 4 dan CSS modular
- Chart.js, Recharts, Leaflet, MapLibre GL, dan Framer Motion
- Data statis JSON, GeoJSON, Excel, shapefile, dan aset gambar di `public/`

## Persyaratan

- Node.js 18 atau versi LTS yang lebih baru
- npm

Versi dependency yang digunakan dikunci di `package-lock.json`. Untuk hasil
instalasi yang konsisten, gunakan `npm ci`.

## Menjalankan Secara Lokal

Clone repository dan masuk ke folder proyek:

```bash
git clone https://github.com/ssabila/pkl-65-dashboard.git
cd pkl-65-dashboard
```

Instal dependency:

```bash
npm ci
```

Jalankan server development:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Perintah NPM

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Menjalankan server development |
| `npm run lint` | Menjalankan ESLint |
| `npm run build` | Membuat build production |
| `npm start` | Menjalankan build production |
| `npm run data:module2` | Membuat ulang ringkasan data Modul 2 |

## Menjalankan Build Production

```bash
npm ci
npm run lint
npm run build
npm start
```

Server production secara default berjalan di
[http://localhost:3000](http://localhost:3000).

## Struktur Proyek

```text
app/
├── layout.js                 # Root layout, metadata, dan font
├── page.js                   # Beranda dan daftar delapan modul
├── globals.css               # Style global
└── modules/
    ├── module-1/page.jsx
    ├── module-2/page.jsx
    ├── module-3/page.jsx
    ├── module-4/page.jsx
    ├── module-5/page.jsx
    ├── module-6/page.jsx
    ├── module-7/page.jsx
    └── module-8/page.jsx

public/
├── data/                     # Data sumber dan data hasil preprocessing
├── fonts/                    # Font lokal
├── map/                      # Data peta dan batas wilayah
└── module-1 ... module-8/    # Aset visual tiap modul
```

## Modul Dashboard

| Modul | Fokus |
|---|---|
| 1 | Kondisi fisik wilayah |
| 2 | Skor risiko bencana |
| 3 | Sebaran dampak banjir dan tanah longsor |
| 4 | Kerentanan sosial ekonomi |
| 5 | Dampak dan logistik |
| 6 | Prioritas penanganan |
| 7 | Cerita data bencana |
| 8 | Monitoring pemulihan |

Setiap modul memiliki route berbasis App Router:

```text
/modules/module-1
/modules/module-2
/modules/module-3
/modules/module-4
/modules/module-5
/modules/module-6
/modules/module-7
/modules/module-8
```

## Data dan Preprocessing

Data yang digunakan aplikasi disimpan sebagai aset statis di `public/data/`,
`public/map/`, dan folder aset modul. Data tersebut dibaca oleh aplikasi pada
saat halaman dijalankan.

## Konfigurasi

Beberapa file konfigurasi root digunakan oleh tooling proyek:

- `next.config.mjs` untuk konfigurasi Next.js dan React Compiler
- `postcss.config.mjs` untuk pemrosesan Tailwind/PostCSS
- `eslint.config.mjs` untuk linting
- `tsconfig.json` untuk integrasi tooling Next.js dan generated types
- `package.json` dan `package-lock.json` untuk dependency serta script NPM


Saat ini aplikasi tidak memerlukan file environment untuk dapat dijalankan
secara lokal. Jika deployment menambahkan environment variable, simpan
nilainya di `.env.local`.

## Pemeriksaan Sebelum Deploy

Sebelum deployment, jalankan:

```bash
npm ci
npm run lint
npm run build
```

Folder `node_modules/`, `.next/`, `out/`, file environment, dan file hasil
build lokal tidak perlu disimpan atau di-commit ke repository. Aturan tersebut
sudah tercantum di `.gitignore`.
