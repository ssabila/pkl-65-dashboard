// ============================================================
// DUMMY DATA — Semua angka akan diganti data riil dari DB
// ============================================================

export const provinsiOptions = ["Aceh", "Sumatera Utara", "Sumatera Barat"];

export const ringkasanByProvinsi = {
  Aceh: {
    totalKejadian: 7265,
    perubahan: "+11.01%",
    mayoritasBencana: "Longsor",
    persentaseMayoritas: "47%",
    puncakBencana: "Desember",
    persentasePuncak: "47%",
    skorRisikoBanjir: "5.6 – Waspada",
    skorRisikoLongsor: "7.5 – Bahaya",
    jenisBencanaTerbanyak: "Longsor – 47%",
  },
  "Sumatera Utara": {
    totalKejadian: 5432,
    perubahan: "+8.5%",
    mayoritasBencana: "Banjir",
    persentaseMayoritas: "52%",
    puncakBencana: "November",
    persentasePuncak: "38%",
    skorRisikoBanjir: "6.2 – Waspada",
    skorRisikoLongsor: "6.1 – Waspada",
    jenisBencanaTerbanyak: "Banjir – 52%",
  },
  "Sumatera Barat": {
    totalKejadian: 4123,
    perubahan: "+5.2%",
    mayoritasBencana: "Longsor",
    persentaseMayoritas: "61%",
    puncakBencana: "Oktober",
    persentasePuncak: "41%",
    skorRisikoBanjir: "4.9 – Sedang",
    skorRisikoLongsor: "8.1 – Bahaya",
    jenisBencanaTerbanyak: "Longsor – 61%",
  },
};

// Tren tahunan — dua series (solid + dashed)
export const trendTahunanData = {
  "2026": [
    { bulan: "Jan", solid: 10000, dashed: 8000 },
    { bulan: "Feb", solid: 10500, dashed: 9500 },
    { bulan: "Mar", solid: 12000, dashed: 11000 },
    { bulan: "Apr", solid: 18000, dashed: 23000 },
    { bulan: "Mei", solid: 22000, dashed: 21000 },
    { bulan: "Jun", solid: 24000, dashed: 25000 },
    { bulan: "Jul", solid: 23000, dashed: 27000 },
  ],
  "2025": [
    { bulan: "Jan", solid: 9000, dashed: 7500 },
    { bulan: "Feb", solid: 9800, dashed: 8800 },
    { bulan: "Mar", solid: 11500, dashed: 10200 },
    { bulan: "Apr", solid: 16000, dashed: 20000 },
    { bulan: "Mei", solid: 20500, dashed: 19500 },
    { bulan: "Jun", solid: 22500, dashed: 23000 },
    { bulan: "Jul", solid: 21000, dashed: 25000 },
    { bulan: "Agu", solid: 19000, dashed: 22000 },
    { bulan: "Sep", solid: 18000, dashed: 21000 },
    { bulan: "Okt", solid: 20000, dashed: 24000 },
    { bulan: "Nov", solid: 25000, dashed: 28000 },
    { bulan: "Des", solid: 28000, dashed: 30000 },
  ],
  "2024": [
    { bulan: "Jan", solid: 8500, dashed: 7000 },
    { bulan: "Feb", solid: 9200, dashed: 8200 },
    { bulan: "Mar", solid: 11000, dashed: 9800 },
    { bulan: "Apr", solid: 15000, dashed: 18500 },
    { bulan: "Mei", solid: 19000, dashed: 18000 },
    { bulan: "Jun", solid: 21000, dashed: 21500 },
    { bulan: "Jul", solid: 20000, dashed: 23000 },
    { bulan: "Agu", solid: 18000, dashed: 21000 },
    { bulan: "Sep", solid: 17000, dashed: 20000 },
    { bulan: "Okt", solid: 19000, dashed: 23000 },
    { bulan: "Nov", solid: 24000, dashed: 27000 },
    { bulan: "Des", solid: 27000, dashed: 29000 },
  ],
};
// Fill remaining years
for (let y = 2016; y <= 2023; y++) {
  trendTahunanData[String(y)] = trendTahunanData["2024"].map(d => ({
    ...d,
    solid: Math.round(d.solid * (0.7 + Math.random() * 0.3)),
    dashed: Math.round(d.dashed * (0.7 + Math.random() * 0.3)),
  }));
}

// Faktor Pemicu — ditampilkan sebagai dashes (relative intensity)
export const faktorPemicuByProvinsi = {
  Aceh: [
    { faktor: "Curah Hujan",       level: 3 },
    { faktor: "Drainase",          level: 2 },
    { faktor: "Alih Fungsi Lahan", level: 1 },
    { faktor: "Luapan Sungai",     level: 4 },
    { faktor: "Topografi",         level: 2 },
    { faktor: "Others",            level: 1 },
  ],
  "Sumatera Utara": [
    { faktor: "Curah Hujan",       level: 4 },
    { faktor: "Drainase",          level: 3 },
    { faktor: "Alih Fungsi Lahan", level: 2 },
    { faktor: "Luapan Sungai",     level: 3 },
    { faktor: "Topografi",         level: 2 },
    { faktor: "Others",            level: 1 },
  ],
  "Sumatera Barat": [
    { faktor: "Curah Hujan",       level: 3 },
    { faktor: "Drainase",          level: 2 },
    { faktor: "Alih Fungsi Lahan", level: 3 },
    { faktor: "Luapan Sungai",     level: 2 },
    { faktor: "Topografi",         level: 4 },
    { faktor: "Others",            level: 1 },
  ],
};

// Donut — mayoritas bencana per kabupaten
export const donutBanjirByProvinsi = {
  Aceh: [
    { name: "Aceh Tamiang", value: 52.1 },
    { name: "Gayo Lues",    value: 22.8 },
    { name: "Bener Meriah", value: 13.9 },
    { name: "Other",        value: 11.2 },
  ],
  "Sumatera Utara": [
    { name: "Langkat",          value: 38.5 },
    { name: "Deli Serdang",     value: 28.3 },
    { name: "Serdang Bedagai",  value: 19.2 },
    { name: "Other",            value: 14.0 },
  ],
  "Sumatera Barat": [
    { name: "Pesisir Selatan",  value: 42.1 },
    { name: "Padang Pariaman",  value: 25.6 },
    { name: "Agam",             value: 18.3 },
    { name: "Other",            value: 14.0 },
  ],
};

export const donutLongsorByProvinsi = {
  Aceh: [
    { name: "Aceh Tengah",  value: 48.2 },
    { name: "Bener Meriah", value: 26.5 },
    { name: "Pidie",        value: 14.1 },
    { name: "Other",        value: 11.2 },
  ],
  "Sumatera Utara": [
    { name: "Tapanuli Utara",       value: 44.3 },
    { name: "Humbang Hasundutan",   value: 29.8 },
    { name: "Samosir",              value: 15.0 },
    { name: "Other",                value: 10.9 },
  ],
  "Sumatera Barat": [
    { name: "Tanah Datar",    value: 39.7 },
    { name: "Sijunjung",      value: 31.2 },
    { name: "Lima Puluh Kota",value: 18.6 },
    { name: "Other",          value: 10.5 },
  ],
};

// Bar chart frekuensi per jenis bencana
export const frekuensiBencana = {
  Aceh: [
    { jenis: "Kekeringan",        frekuensi: 14500 },
    { jenis: "Banjir",            frekuensi: 29000 },
    { jenis: "Kebakaran Longsor", frekuensi: 20000 },
    { jenis: "Putting Beliung",   frekuensi: 30000, highlight: true },
    { jenis: "Gempa",             frekuensi: 8000  },
    { jenis: "Lainnya",           frekuensi: 24000 },
  ],
};

// Curah hujan bulanan & harian
export const curahHujanBulanan = {
  "2026": [
    { label: "Jan", solid: 10000, dashed: 8000  },
    { label: "Feb", label2: "Feb", solid: 10500, dashed: 9500  },
    { label: "Mar", solid: 12000, dashed: 11000 },
    { label: "Apr", solid: 18000, dashed: 23000 },
    { label: "Mei", solid: 22000, dashed: 21000 },
    { label: "Jun", solid: 24000, dashed: 25000 },
    { label: "Jul", solid: 23000, dashed: 27000 },
  ],
};

export const getCurahHujanHarian = (bulan) => {
  const seed = bulan.charCodeAt(0);
  return Array.from({ length: 30 }, (_, i) => ({
    label: String(i + 1),
    solid:  Math.round(200 + Math.sin((i + seed) * 0.5) * 150 + Math.random() * 80),
    dashed: Math.round(180 + Math.cos((i + seed) * 0.4) * 130 + Math.random() * 80),
  }));
};

export const longsorBulanan = {
  "2026": [
    { label: "Jan", solid: 8000,  dashed: 6500  },
    { label: "Feb", solid: 9000,  dashed: 8000  },
    { label: "Mar", solid: 11000, dashed: 10000 },
    { label: "Apr", solid: 17000, dashed: 22000 },
    { label: "Mei", solid: 21000, dashed: 20000 },
    { label: "Jun", solid: 23000, dashed: 24000 },
    { label: "Jul", solid: 22000, dashed: 26000 },
  ],
};

// Wilayah Aceh — koordinat real (lat/lng)
export const wilayahAceh = [
  {
    nama: "Bener Meriah", lat: 4.72, lng: 96.82, risikoB: "Tinggi",  risikoL: "Kritis",
    curahHujan: "5.6 – Waspada", luasGenangan: "5.6 – Genangan Berat", skorRisiko: "5.6 – Risiko Tinggi",
    jenisTanah: "Allovial, Andosol", kemiringan: "5.6 – Curam", tutupanLahan: "5.6 – Risiko Tinggi",
    soilMoisture: "5.6 – Risiko Tinggi", skorRisikoLongsor: "5.6 – Risiko Tinggi",
  },
  {
    nama: "Aceh Tengah",  lat: 4.50, lng: 96.50, risikoB: "Kritis",  risikoL: "Kritis",
    curahHujan: "6.1 – Bahaya",  luasGenangan: "7.2 – Genangan Berat", skorRisiko: "7.2 – Risiko Kritis",
    jenisTanah: "Latosol, Andosol", kemiringan: "6.1 – Curam", tutupanLahan: "6.1 – Risiko Tinggi",
    soilMoisture: "6.1 – Risiko Tinggi", skorRisikoLongsor: "6.1 – Risiko Kritis",
  },
  {
    nama: "Aceh Tamiang", lat: 4.18, lng: 97.82, risikoB: "Kritis",  risikoL: "Sedang",
    curahHujan: "7.2 – Bahaya",  luasGenangan: "9.5 – Genangan Berat", skorRisiko: "8.5 – Risiko Kritis",
    jenisTanah: "Aluvial, Gleisol", kemiringan: "3.2 – Landai", tutupanLahan: "3.2 – Risiko Sedang",
    soilMoisture: "3.2 – Risiko Sedang", skorRisikoLongsor: "3.2 – Risiko Sedang",
  },
  {
    nama: "Gayo Lues",   lat: 3.80, lng: 97.10, risikoB: "Tinggi",  risikoL: "Tinggi",
    curahHujan: "4.9 – Waspada", luasGenangan: "3.5 – Genangan Sedang", skorRisiko: "7.1 – Risiko Tinggi",
    jenisTanah: "Kambisol, Andosol", kemiringan: "4.9 – Curam", tutupanLahan: "4.9 – Risiko Tinggi",
    soilMoisture: "4.9 – Risiko Tinggi", skorRisikoLongsor: "4.9 – Risiko Tinggi",
  },
  {
    nama: "Pidie",       lat: 4.95, lng: 96.00, risikoB: "Sedang",  risikoL: "Tinggi",
    curahHujan: "4.3 – Waspada", luasGenangan: "2.8 – Genangan Sedang", skorRisiko: "6.4 – Risiko Tinggi",
    jenisTanah: "Regosol, Mediteran", kemiringan: "4.3 – Curam", tutupanLahan: "4.3 – Risiko Sedang",
    soilMoisture: "4.3 – Risiko Sedang", skorRisikoLongsor: "4.3 – Risiko Tinggi",
  },
  {
    nama: "Aceh Besar",  lat: 5.40, lng: 95.45, risikoB: "Tinggi",  risikoL: "Sedang",
    curahHujan: "5.8 – Waspada", luasGenangan: "6.2 – Genangan Berat", skorRisiko: "7.2 – Risiko Tinggi",
    jenisTanah: "Aluvial, Latosol", kemiringan: "3.5 – Landai", tutupanLahan: "3.5 – Risiko Sedang",
    soilMoisture: "3.5 – Risiko Sedang", skorRisikoLongsor: "3.5 – Risiko Sedang",
  },
  {
    nama: "Banda Aceh",  lat: 5.55, lng: 95.32, risikoB: "Kritis",  risikoL: "Rendah",
    curahHujan: "8.1 – Bahaya",  luasGenangan: "9.5 – Genangan Berat", skorRisiko: "8.8 – Risiko Kritis",
    jenisTanah: "Aluvial", kemiringan: "1.2 – Datar", tutupanLahan: "1.2 – Risiko Rendah",
    soilMoisture: "1.2 – Risiko Rendah", skorRisikoLongsor: "1.2 – Risiko Rendah",
  },
  {
    nama: "Sabang",      lat: 5.88, lng: 95.32, risikoB: "Rendah",  risikoL: "Sedang",
    curahHujan: "3.1 – Aman",  luasGenangan: "1.2 – Genangan Ringan", skorRisiko: "3.5 – Risiko Rendah",
    jenisTanah: "Regosol", kemiringan: "3.8 – Landai", tutupanLahan: "3.8 – Risiko Sedang",
    soilMoisture: "3.8 – Risiko Sedang", skorRisikoLongsor: "3.8 – Risiko Sedang",
  },
];

export const bulanOptions = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
export const tahunOptions  = Array.from({ length: 11 }, (_, i) => String(2016 + i));

export const alertFeedData = [
  { id: 1, message: "Curah Hujan 3 Hari 218mm – Melampaui Batas", severity: "critical", time: "2 mnt lalu" },
  { id: 2, message: "Potensi Banjir Tinggi di Aceh Tamiang", severity: "high", time: "15 mnt lalu" },
  { id: 3, message: "Longsor Terdeteksi di Bener Meriah", severity: "high", time: "1 jam lalu" },
];
