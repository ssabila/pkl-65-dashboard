'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
      Memuat Peta Spasial...
    </div>
  ),
});

const normalizeName = (str) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ') : '';
const stripPrefix = (n) => {
  for (const p of ['kota ', 'kabupaten ', 'kab. ', 'kab ']) {
    if (n.startsWith(p)) return n.slice(p.length);
  }
  return n;
};

// "ACEH BARAT DAYA" -> "Aceh Barat Daya" (nmkab pada file R2 ditulis kapital semua)
const toTitleCase = (str) => (str || '')
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean)
  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ');

// ── SKALA WARNA RECOVERY INTENSITAS CAHAYA MALAM (Indikator R-2) ──
// Acuan Tim Pengolah Data: rentang 0%-150%, gradasi bahaya -> pemulihan penuh
// Merah (#d32f2f) -> Jingga -> Kuning -> Hijau Muda -> Hijau Tua (#1b5e20).
// Konstanta yang sama juga dipakai di MapComponent.jsx supaya peta, legenda,
// dan bar chart Slide 12 memakai satu skala warna yang identik.
const NTL_MIN = 0;
const NTL_MAX = 150;
const NTL_STOPS = ['#d32f2f', '#f57c00', '#fdd835', '#7cb342', '#1b5e20'];

const hexToRgbArr = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const getNtlColor = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '#94a3b8';
  const t = Math.max(0, Math.min(1, (value - NTL_MIN) / (NTL_MAX - NTL_MIN)));
  const scaled = t * (NTL_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), NTL_STOPS.length - 2);
  const f = scaled - i;
  const a = hexToRgbArr(NTL_STOPS[i]);
  const b = hexToRgbArr(NTL_STOPS[i + 1]);
  const c = a.map((v, k) => Math.round(v + (b[k] - v) * f));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
};

// Label kondisi berdasarkan nilai recovery (dipakai tooltip/popup peta & Slide 12)
const getNtlStatusLabel = (v) => {
  if (v === null || v === undefined || isNaN(v)) return 'Tanpa Data';
  if (v < 75) return 'Redup / Belum Pulih';
  if (v < 100) return 'Mendekati Baseline';
  if (v < 150) return 'Melebihi Baseline';
  return 'Pertumbuhan Tinggi';
};

// ── STATUS PEMULIHAN VEGETASI / NDVI RECOVERY (Indikator R-1) ──
// Threshold sama dengan yang dipakai MapComponent.jsx (mode 10) supaya peta
// (Slide 13) dan ringkasan/narasi (Slide 14) selalu konsisten.
const NDVI_LOW_COUNT_THRESHOLD = 1000; // sampel piksel di bawah ini dianggap tipis, lihat K-2/K-3
const getNdviStatus = (mean) => {
  if (mean === null || mean === undefined || isNaN(mean)) return null;
  if (mean < 25) return 'kritis';
  if (mean < 50) return 'parah';
  if (mean < 75) return 'sedang';
  return 'pulih';
};
const NDVI_STATUS_COLOR = { kritis: '#D72E38', parah: '#F47B2F', sedang: '#FFD47D', pulih: '#168573' };

const parseCSVContent = (text) => {
  const parseCSVLine = (line) => {
    let ret = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      if (inQuote) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; } 
          else { inQuote = false; }
        } else { cur += char; }
      } else {
        if (char === '"') { inQuote = true; } 
        else if (char === ',') { ret.push(cur); cur = ''; } 
        else { cur += char; }
      }
    }
    ret.push(cur);
    return ret;
  };

  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] !== undefined ? values[i].trim() : '';
    });
    return obj;
  });
};

export default function Module8Page() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [mapMode, setMapMode] = useState(3); 
  const [landslideMode, setLandslideMode] = useState(5);
  const [kelembabanMode, setKelembabanMode] = useState(11);

  const [selectedNightLightProv, setSelectedNightLightProv] = useState('Aceh');
  const [selectedVegetationProv, setSelectedVegetationProv] = useState('Sumut');
  const containerRef = useRef(null);

  const [genanganData, setGenanganData] = useState([]);
  const [kelembabanNovDesData, setKelembabanNovDesData] = useState([]);
  const [kelembabanAprData, setKelembabanAprData] = useState([]);

  // STATE BARU UNTUK DATA JARINGAN JALAN
  const [roadsData, setRoadsData] = useState([]);

  // STATE BARU UNTUK DATA PEMULIHAN KONDISI BANGUNAN (Indikator R-5) — Slide 9 & 10
  // bangunanData: snapshot bulan terakhir per kab/kota, dipakai peta choropleth (Slide 9)
  // bangunanTrend: agregasi bulanan per provinsi + rata-rata gabungan, dipakai grafik tren (Slide 10)
  const [bangunanData, setBangunanData] = useState([]);
  const [bangunanTrend, setBangunanTrend] = useState({ bulan: [], bulanLabel: [], provinsi: {}, rataRata: [] });

  // STATE DATA PEMULIHAN INTENSITAS CAHAYA MALAM (Indikator R-2) - Slide 11 & 12
  // Satu baris per kabupaten/kota, berisi nilai recovery NTL (%) hasil zonal statistics.
  const [ntlData, setNtlData] = useState([]);

  // STATE DATA PEMULIHAN VEGETASI / NDVI RECOVERY (Indikator R-1) - Slide 13 & 14
  // Satu baris per kabupaten/kota, berisi mean/median/percentile & jumlah piksel valid
  // (count) hasil zonal statistics NDVI dari GEE.
  const [ndviData, setNdviData] = useState([]);

  const mapLayers = [
    { id: 0, label: 'Peta Surutnya Genangan (%)' },
    { id: 1, label: 'Peta Genangan Puncak Banjir' },
    { id: 2, label: 'Peta Genangan Surut' },
    { id: 3, label: 'Peta Genangan Residual' }
  ];

  const kelembabanLayers = [
    { id: 11, label: 'Peta Kelembaban Tanah (Nov–Des 2025)' },
    { id: 12, label: 'Peta Kelembaban Tanah (Jan-Mei 2026)' },
    { id: 13, label: 'Peta Zona Kritis Kelembaban Tanah' }
  ];

  // Narasi panel teks Slide 5 mengikuti peta yang sedang ditampilkan (5a/5b/5c),
  // sama seperti peta itu sendiri bisa digeser lewat tombol titik di bawah peta.
  const kelembabanContent = {
    11: {
      headingA: 'Tanah Jenuh Air',
      headingB: 'Saat Puncak Bencana.',
      desc: 'Indikator 3 membaca air yang terlihat di permukaan. Sedangkan Indikator 6 membaca air yang tertahan di dalam tanah — kondisi Nov–Des 2025 ini adalah potret tanah tak lama setelah bencana hidrometeorologi melanda.',
      provinsi: [
        ['Aceh', 'Zona kelembaban tinggi meluas, terutama di bagian Timur dan Utara.'],
        ['Sumatera Utara', 'Kelembaban tanah relatif lebih stabil dibanding dua provinsi lain.'],
        ['Sumatera Barat', 'Sebagian besar wilayah bagian selatan tercatat sebagai zona kelembaban tinggi.'],
      ],
    },
    12: {
      headingA: 'Zona Tanah Jenuh',
      headingB: 'Menyusut Signifikan.',
      desc: 'Memasuki Jan–Mei 2026, begini kondisi kelembaban tanah terkini dibandingkan dengan saat puncak bencana.',
      provinsi: [
        ['Aceh', 'Zona jenuh sangat menyusut di Aceh bagian Timur. Namun, masih tersisa area kritis di bagian Tengah dan Utara.'],
        ['Sumatera Utara', 'Zona jenuh hampir hilang sepenuhnya.'],
        ['Sumatera Barat', 'Zona jenuh hampir hilang sepenuhnya.'],
      ],
    },
    13: {
      headingA: 'Fokus Pada',
      headingB: 'Wilayah Masih Kritis.',
      desc: 'Peta ini adalah kondisi terkini (peta sebelumnya) yang difilter agar hanya menonjolkan kabupaten/kota dengan Z-Score kelembaban tanah masih di atas ambang kritis (> 1,5) — bukan sumber data baru.',
      provinsi: [
        ['Aceh', 'Sisa area kritis paling terlihat di bagian Tengah dan Utara.'],
        ['Sumatera Utara', 'Praktis tidak ada lagi kabupaten/kota berstatus kritis.'],
        ['Sumatera Barat', 'Praktis tidak ada lagi kabupaten/kota berstatus kritis.'],
      ],
    },
  };

  const landslideLayers = [
    { id: 5, label: 'Peta Risiko Longsor (Nov–Des 2025)' },
    { id: 6, label: 'Peta Risiko Longsor (Jan-Mei 2026)' }
  ];

  useEffect(() => {
    // 1. Data Genangan
    fetch('/module-8/data/Modul8_R3.csv')
      .then(res => res.ok ? res.text() : Promise.reject())
      .then(text => {
        const parsed = parseCSVContent(text);

        const normalizedData = parsed.map(row => {
          const namaKabupaten = row.kabupaten || row.NAME_2 || '';
          const puncak = parseFloat(row.luas_puncak_ha) || 0;
          const residual = parseFloat(row.luas_terkini_ha) || 0;
          const r3_persen_asli = parseFloat(row.r3_persen);

          const surut = Math.max(0, puncak - residual);
          const persenSurut = puncak > 0 ? (surut / puncak) * 100 : 0;
          const persenResidual = !isNaN(r3_persen_asli) ? r3_persen_asli : (puncak > 0 ? (residual / puncak) * 100 : 0);

          let status = 'pulih';
          if (persenResidual > 75) status = 'kritis';
          else if (persenResidual > 50) status = 'parah';
          else if (persenResidual > 25) status = 'sedang';

          const norm = normalizeName(namaKabupaten);
          const noPrefixGenangan = stripPrefix(norm);
          return {
            ...row,
            kabupaten_key: norm,
            kabupaten_key_noprefix: noPrefixGenangan,
            kabupaten_key_nospace: noPrefixGenangan.replace(/\s+/g, ''),
            luas_puncak_ha: puncak,
            luas_terkini_ha: residual,
            surut_ha: surut,
            surut_persen: persenSurut.toFixed(2),
            r3_persen: persenResidual.toFixed(2),
            status: status
          };
        });

        // Slide 3 (peta) dan Slide 4 (statistik) sama-sama memakai state
        // genanganData ini — genanganStats (di bawah) hanya turunan (useMemo)
        // dari data ini, bukan hasil fetch/angka terpisah.
        setGenanganData(normalizedData);
      })
      .catch(() => {});

    // 2. Data Z-Score Kelembaban
    const fetchKelembaban = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const text = await res.text();
        const parsed = parseCSVContent(text);
        const mapped = parsed.map(row => {
          const norm = normalizeName(row.ADM2_NAME || '');
          const noPrefix = stripPrefix(norm);
          return {
            ...row,
            kabupaten_key: norm,
            kabupaten_key_noprefix: noPrefix,
            kabupaten_key_nospace: noPrefix.replace(/\s+/g, ''),
            mean: parseFloat(row.mean) || 0
          };
        });
        setter(mapped);
      } catch(e) {}
    };

    fetchKelembaban('/module-8/data/Modul8_R6_NovDes25.csv', setKelembabanNovDesData);
    fetchKelembaban('/module-8/data/Modul8_R6_JanMay26.csv', setKelembabanAprData);
    // Catatan: dulu ada fetch ketiga ke Modul8_R6.csv untuk "Peta Zona Kritis"
    // (Slide 5c) sebagai sumber data terpisah. File itu (dan file titik longsor
    // CSV) sudah tidak ada di data terbaru — Slide 5c sekarang memfilter
    // kelembabanAprData (data Slide 5b) langsung di MapComponent, bukan fetch baru.

    // 3. DATA JARINGAN JALAN DARI CSV
    const fetchRoads = async () => {
      const provinces = ['Aceh', 'Sumatera_Utara', 'Sumatera_Barat'];
      const PROV_LABEL = { Aceh: 'Aceh', Sumatera_Utara: 'Sumatera Utara', Sumatera_Barat: 'Sumatera Barat' };
      let allRoads = [];
      const gagal = [];

      for (let prov of provinces) {
        try {
          // Hanya fetch file Terputus karena genangan_terkini (status pulih/belum) sudah ada di sini
          const url = `/module-8/data/R4_${prov}_Terputus.csv`;
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            const parsed = parseCSVContent(text);
            
            const mapped = parsed.map(row => {
              let geometry = null;
              if (row['.geo']) {
                try {
                  // Mem-parsing string GeoJSON agar kembali menjadi object
                  geometry = JSON.parse(row['.geo']);
                } catch(e) {}
              }
              return {
                ...row,
                // Ditandai dari file sumbernya sendiri (bukan hasil pencocokan geometri),
                // supaya bisa langsung diagregasi per provinsi (dipakai Slide 15).
                provinsi: PROV_LABEL[prov],
                geometry
              };
            }).filter(r => r.geometry); // Hanya simpan jika ada koordinat

            allRoads = [...allRoads, ...mapped];
          } else {
            gagal.push(prov);
          }
        } catch(e) { gagal.push(prov); }
      }
      // Cek di console browser (F12) kalau ada provinsi yang gagal dimuat —
      // biasanya berarti nama file/path di public/module-8/data/ belum cocok persis.
      if (gagal.length > 0) console.warn(`[R4] Gagal memuat data jalan untuk: ${gagal.join(', ')}. Cek nama file di public/module-8/data/.`);
      setRoadsData(allRoads);
    };

    fetchRoads();

    // 4. DATA PEMULIHAN KONDISI BANGUNAN (Indikator R-5)
    // ─────────────────────────────────────────────────────────────────
    // Catatan arsitektur (mengikuti rekomendasi Tim Pengolah Data):
    // Dashboard ini tidak punya lapisan backend terpisah (semua parsing CSV
    // terjadi di browser), jadi logika "backend" yang diminta — agregasi
    // jendela waktu bulanan & penanganan nilai kosong — diterapkan di sini,
    // SEBELUM data dilempar ke MapComponent (peta) atau grafik tren (Slide 10).
    // Data mentah CSV per-hari TIDAK PERNAH langsung dipetakan ke chart.
    const fetchBangunan = async () => {
      const provinsiFiles = [
        { nama: 'Aceh', url: '/module-8/data/R5_Recovery_Stats_ACEH.csv' },
        { nama: 'Sumatera Barat', url: '/module-8/data/R5_Recovery_Stats_SUMATERA_BARAT.csv' },
        { nama: 'Sumatera Utara', url: '/module-8/data/R5_Recovery_Stats_SUMATERA_UTARA.csv' },
      ];

      // monthlyByProvKab[provinsi][ "YYYY-MM" ][ nmkab ] = [nilai_mean, ...]
      const monthlyByProvKab = {};
      const gagal = [];

      for (const p of provinsiFiles) {
        try {
          const res = await fetch(p.url);
          if (!res.ok) { gagal.push(p.nama); continue; }
          const text = await res.text();
          const parsed = parseCSVContent(text);
          const monthly = {};

          parsed.forEach(row => {
            const val = parseFloat(row.mean);
            // Baris dengan mean kosong = "satelit tidak melintas / tertutup awan"
            // pada tanggal itu. Baris ini SENGAJA dilewati di tahap agregasi bulanan
            // (bukan dianggap 0%), sesuai poin 1 & 3 rekomendasi tim data.
            if (isNaN(val) || !row.date || !row.nmkab) return;
            const bulan = row.date.slice(0, 7); // "YYYY-MM"
            if (!monthly[bulan]) monthly[bulan] = {};
            if (!monthly[bulan][row.nmkab]) monthly[bulan][row.nmkab] = [];
            monthly[bulan][row.nmkab].push(val);
          });

          monthlyByProvKab[p.nama] = monthly;
        } catch (e) {
          gagal.push(p.nama);
        }
      }
      if (gagal.length > 0) console.warn(`[R5] Gagal memuat data bangunan untuk: ${gagal.join(', ')}.`);

      const bulanLabelMap = { '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu', '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des' };
      const formatBulan = (ym) => `${bulanLabelMap[ym.slice(5, 7)] || ym.slice(5, 7)} ${ym.slice(0, 4)}`;

      // Rata-rata sederhana atas seluruh titik tanggal valid dalam satu bulan
      // (Nilai Agregat sesuai poin 1: bisa Median/Mean — di sini dipakai Mean).
      const monthlyMean = (vals) => vals.reduce((a, b) => a + b, 0) / vals.length;

      const classifyStatus = (persen) => {
        if (persen < 25) return 'kritis';
        if (persen < 50) return 'parah';
        if (persen < 75) return 'sedang';
        return 'pulih';
      };

      const allMonths = Array.from(
        new Set(Object.values(monthlyByProvKab).flatMap(m => Object.keys(m)))
      ).sort();

      if (allMonths.length === 0) { return; }
      const latestMonth = allMonths[allMonths.length - 1];

      // ── Data untuk PETA (Slide 9): snapshot bulan terakhir per kab/kota ──
      const mapRows = [];
      Object.entries(monthlyByProvKab).forEach(([prov, monthly]) => {
        const kabsBulanIni = monthly[latestMonth] || {};
        Object.entries(kabsBulanIni).forEach(([kab, vals]) => {
          const persen = monthlyMean(vals) * 100;
          const norm = normalizeName(kab);
          const noPrefix = stripPrefix(norm);
          mapRows.push({
            kabupaten: kab,
            provinsi: prov,
            kabupaten_key: norm,
            kabupaten_key_noprefix: noPrefix,
            kabupaten_key_nospace: noPrefix.replace(/\s+/g, ''),
            persen: Number(persen.toFixed(1)),
            status: classifyStatus(persen),
            hasData: true,
            bulanLabel: formatBulan(latestMonth),
          });
        });
      });
      // Poin 3: kab/kota yang tidak (atau belum) muncul di atas berarti tidak
      // punya data valid pada bulan terakhir ("tertutup awan / satelit tidak
      // melintas"). MapComponent akan menampilkannya abu-abu semi-transparan
      // berdasarkan hasData=false secara default saat record tidak ditemukan.
      setBangunanData(mapRows);

      // ── Data untuk GRAFIK TREN BULANAN (Slide 10) ──
      const trendByProv = {};
      Object.entries(monthlyByProvKab).forEach(([prov, monthly]) => {
        trendByProv[prov] = allMonths.map(bulan => {
          const kabs = monthly[bulan] || {};
          const kabMeans = Object.values(kabs).map(monthlyMean);
          return kabMeans.length > 0 ? monthlyMean(kabMeans) * 100 : null;
        });
      });

      const rataRata = allMonths.map((_, i) => {
        const nilaiBulanIni = Object.values(trendByProv).map(arr => arr[i]).filter(v => v !== null);
        return nilaiBulanIni.length > 0 ? monthlyMean(nilaiBulanIni) : null;
      });

      setBangunanTrend({
        bulan: allMonths,
        bulanLabel: allMonths.map(formatBulan),
        provinsi: trendByProv,
        rataRata,
      });
    };

    fetchBangunan();

    // 5. DATA PEMULIHAN INTENSITAS CAHAYA MALAM (Indikator R-2) - Slide 11 & 12
    // ─────────────────────────────────────────────────────────────────
    // Kolom `mean` pada file R2 adalah rata-rata zonal statistics dari raster
    // Recovery NTL per kabupaten/kota (nilai sudah di-clamp 0-200% sejak di GEE,
    // terlihat dari kolom `max` yang konsisten bernilai 200). Jadi angka ini
    // dipakai LANGSUNG sebagai persentase recovery — tidak dihitung ulang di sini.
    const fetchNightLight = async () => {
      const provinsiFiles = [
        { key: 'Aceh', nama: 'Aceh', url: '/module-8/data/R2_Aceh.csv' },
        { key: 'Sumut', nama: 'Sumatera Utara', url: '/module-8/data/R2_Sumut.csv' },
        { key: 'Sumbar', nama: 'Sumatera Barat', url: '/module-8/data/R2_Sumbar.csv' },
      ];

      const allRows = [];
      const gagal = [];

      for (const p of provinsiFiles) {
        try {
          const res = await fetch(p.url);
          if (!res.ok) { gagal.push(p.nama); continue; }
          const parsed = parseCSVContent(await res.text());

          parsed.forEach((row) => {
            // kdkab "00" bukan kabupaten/kota administratif (mis. baris "DANAU TOBA"
            // = badan air pada shapefile sumber) — dibuang agar tidak ikut ranking.
            if (!row.nmkab || row.kdkab === '00') return;

            // Pada kode wilayah BPS, kdkab >= 71 menandakan KOTA (bukan kabupaten).
            // Prefix ini wajib supaya pasangan nama kembar tetap bisa dibedakan,
            // mis. "SOLOK" kabupaten (kodekab 1303) vs "SOLOK" kota (kodekab 1372).
            const isKota = parseInt(row.kdkab, 10) >= 71;
            const singkat = toTitleCase(row.nmkab);
            const namaLengkap = `${isKota ? 'Kota' : 'Kabupaten'} ${singkat}`;

            const recovery = parseFloat(row.mean);

            allRows.push({
              kabupaten: namaLengkap,
              kabupatenSingkat: singkat,
              provinsi: p.nama,
              provinsiKey: p.key,
              kodekab: row.kodekab,
              isKota,
              // Baris dengan mean kosong = kab/kota tanpa piksel NTL valid pada
              // komposit (mis. Padang Panjang & Pariaman). Ditandai hasData=false,
              // BUKAN dianggap 0% — sama seperti penanganan awan pada Indikator R-5.
              recovery: isNaN(recovery) ? null : Number(recovery.toFixed(1)),
              median: isNaN(parseFloat(row.median)) ? null : Number(parseFloat(row.median).toFixed(1)),
              min: isNaN(parseFloat(row.min)) ? null : Number(parseFloat(row.min).toFixed(1)),
              max: isNaN(parseFloat(row.max)) ? null : Number(parseFloat(row.max).toFixed(1)),
              hasData: !isNaN(recovery),
            });
          });
        } catch (e) {
          gagal.push(p.nama);
        }
      }
      if (gagal.length > 0) console.warn(`[R2] Gagal memuat data cahaya malam untuk: ${gagal.join(', ')}. Cek nama file di public/module-8/data/.`);

      // Nama singkat yang muncul lebih dari sekali (mis. "Solok") TIDAK diberi
      // kunci tanpa-prefix, supaya pencocokan ke poligon GeoJSON hanya terjadi
      // lewat nama lengkap dan tidak tertukar antara kabupaten dengan kota.
      const hitungSingkat = {};
      allRows.forEach((r) => { hitungSingkat[r.kabupatenSingkat] = (hitungSingkat[r.kabupatenSingkat] || 0) + 1; });

      const withKeys = allRows.map((r) => {
        const norm = normalizeName(r.kabupaten);
        const noPrefix = stripPrefix(norm);
        const ambigu = hitungSingkat[r.kabupatenSingkat] > 1;
        return {
          ...r,
          ambiguNama: ambigu,
          kabupaten_key: norm,
          kabupaten_key_noprefix: ambigu ? '' : noPrefix,
          kabupaten_key_nospace: ambigu ? '' : noPrefix.replace(/\s+/g, ''),
        };
      });

      setNtlData(withKeys);
    };

    fetchNightLight();

    // 6. DATA PEMULIHAN VEGETASI / NDVI RECOVERY (Indikator R-1) - Slide 13 & 14
    // ─────────────────────────────────────────────────────────────────
    // File sumber (recovery_stats_*.csv) sudah berupa zonal statistics per
    // kab/kota (satu baris per NAME_2, kolom mean/median/p10/p25/p75/p90/count),
    // jadi tidak perlu agregasi bulanan seperti Indikator R-5.
    //
    // Kendala K-3/K-4 dari tim data: banyak kab/kota (terutama Sumbar & Sumut)
    // punya count = 0 / mean kosong (tidak ada piksel vegetasi valid lolos
    // cloud masking & ambang batas vegetasi). Baris ini DITANDAI hasData=false,
    // BUKAN dianggap recovery 0% — kalau tidak, wilayah tanpa data akan
    // tampil seolah-olah "paling kritis" di peta, padahal itu keterbatasan data.
    const fetchVegetasi = async () => {
      const provinsiFiles = [
        { nama: 'Aceh', url: '/module-8/data/recovery_stats_Aceh.csv' },
        { nama: 'Sumatera Barat', url: '/module-8/data/recovery_stats_Sumatera_Barat.csv' },
        { nama: 'Sumatera Utara', url: '/module-8/data/recovery_stats_Sumatera_Utara.csv' },
      ];

      let allRows = [];
      const gagal = [];

      for (const p of provinsiFiles) {
        try {
          const res = await fetch(p.url);
          if (!res.ok) { gagal.push(p.nama); continue; }
          const parsed = parseCSVContent(await res.text());

          const mapped = parsed
            .filter((row) => row.NAME_2) // buang baris badan air/tanpa nama kab-kota (mis. "Lake Toba")
            .map((row) => {
              const mean = parseFloat(row.mean);
              const count = parseInt(row.count, 10) || 0;
              const hasData = !isNaN(mean) && count > 0;
              const status = hasData ? getNdviStatus(mean) : null;

              const norm = normalizeName(row.NAME_2);
              const noPrefix = stripPrefix(norm);

              return {
                kabupaten: row.NAME_2,
                provinsi: p.nama,
                mean: hasData ? Number(mean.toFixed(1)) : null,
                median: !isNaN(parseFloat(row.median)) ? Number(parseFloat(row.median).toFixed(1)) : null,
                p10: !isNaN(parseFloat(row.p10)) ? Number(parseFloat(row.p10).toFixed(1)) : null,
                p90: !isNaN(parseFloat(row.p90)) ? Number(parseFloat(row.p90).toFixed(1)) : null,
                count,
                hasData,
                status,
                sampelTipis: hasData && count < NDVI_LOW_COUNT_THRESHOLD,
                kabupaten_key: norm,
                kabupaten_key_noprefix: noPrefix,
                kabupaten_key_nospace: noPrefix.replace(/\s+/g, ''),
              };
            });

          allRows = [...allRows, ...mapped];
        } catch (e) {
          gagal.push(p.nama);
        }
      }

      if (gagal.length > 0) console.warn(`[R1] Gagal memuat data vegetasi untuk: ${gagal.join(', ')}. Cek nama file di public/module-8/data/.`);
      setNdviData(allRows);
    };

    fetchVegetasi();

  }, []);

  // ── Turunan data Slide 4: statistik genangan ──
  // Dihitung langsung dari state genanganData — sumber data yang SAMA persis
  // dengan yang dipakai peta genangan Slide 3 (MapComponent), bukan angka statis.
  const genanganStats = useMemo(() => {
    if (!genanganData || genanganData.length === 0) {
      return { luasPuncak: '0', luasResidual: '0', persenResidual: '0', persenTerdampak: '0', provinsi: [] };
    }

    let totalPuncak = 0;
    let totalResidual = 0;
    const provData = {};

    genanganData.forEach((row) => {
      let namaProvinsi = row.provinsi || row.NAME_1 || 'Sumatera';
      if (namaProvinsi.toLowerCase().includes('aceh')) namaProvinsi = 'Aceh';

      totalPuncak += row.luas_puncak_ha;
      totalResidual += row.luas_terkini_ha;

      if (!provData[namaProvinsi]) provData[namaProvinsi] = { puncak: 0, residual: 0 };
      provData[namaProvinsi].puncak += row.luas_puncak_ha;
      provData[namaProvinsi].residual += row.luas_terkini_ha;
    });

    // Persentase kabupaten/kota "terdampak": kabupaten/kota yang memiliki
    // catatan genangan saat puncak banjir (luas_puncak_ha > 0), dibagi total
    // kabupaten/kota pada dataset.
    const totalKabupaten = genanganData.length;
    const kabupatenTerdampak = genanganData.filter((d) => d.luas_puncak_ha > 0).length;
    const persenTerdampak = totalKabupaten > 0 ? Math.round((kabupatenTerdampak / totalKabupaten) * 100) : 0;

    const provinsi = Object.keys(provData)
      .map((prov) => {
        const p = provData[prov];
        const persen = p.puncak > 0 ? (p.residual / p.puncak) * 100 : 0;
        let status = 'Pulih', color = '#168573';
        if (persen > 75) { status = 'Kritis'; color = '#D72E38'; }
        else if (persen > 50) { status = 'Parah'; color = '#F47B2F'; }
        else if (persen > 25) { status = 'Sedang'; color = '#FFD47D'; }
        return { nama: prov, persen: Math.round(persen), status, color };
      })
      .sort((a, b) => b.persen - a.persen);

    return {
      luasPuncak: Math.round(totalPuncak).toLocaleString('id-ID'),
      luasResidual: Math.round(totalResidual).toLocaleString('id-ID'),
      persenResidual: totalPuncak > 0 ? ((totalResidual / totalPuncak) * 100).toFixed(2).replace('.', ',') : '0',
      persenTerdampak,
      provinsi,
    };
  }, [genanganData]);

  // ── Turunan data Slide 12: 3 tertinggi & 3 terendah per provinsi ──
  // Seluruh angka di bawah dihitung dari state ntlData (file R2), bukan lagi
  // dari daftar contoh yang sebelumnya ditulis manual di komponen ini.
  const NTL_PROV_LABEL = { Aceh: 'Aceh', Sumut: 'Sumatera Utara', Sumbar: 'Sumatera Barat' };

  const nightLightData = useMemo(() => {
    const out = {};
    Object.keys(NTL_PROV_LABEL).forEach((key) => {
      const rows = ntlData
        .filter((r) => r.provinsiKey === key && r.hasData)
        .sort((a, b) => b.recovery - a.recovery);

      const toItem = (r) => ({
        name: r.ambiguNama ? r.kabupaten : r.kabupatenSingkat,
        val: r.recovery,
        color: getNtlColor(r.recovery),
      });

      out[key] = {
        label: NTL_PROV_LABEL[key],
        highest: rows.slice(0, 3).map(toItem),
        // slice(-3) mengambil 3 nilai terkecil (urutan menaik setelah reverse)
        lowest: rows.slice(-3).reverse().map(toItem),
        tanpaData: ntlData.filter((r) => r.provinsiKey === key && !r.hasData).length,
      };
    });
    return out;
  }, [ntlData]);

  // Ringkasan lintas provinsi untuk judul & narasi Slide 12
  const ntlRingkasan = useMemo(() => {
    const valid = ntlData.filter((r) => r.hasData);
    if (valid.length === 0) return null;
    const urut = [...valid].sort((a, b) => a.recovery - b.recovery);
    return {
      terendah: urut[0],
      tertinggi: urut[urut.length - 1],
      jumlahValid: valid.length,
      diAtasBaseline: valid.filter((r) => r.recovery >= 100).length,
      tanpaData: ntlData.length - valid.length,
    };
  }, [ntlData]);

  const fmtNtl = (v) => (v === null || v === undefined || isNaN(v) ? '—' : `${v.toFixed(1).replace('.', ',')}%`);

  // ── Turunan data Slide 13 & 14: peringkat & ringkasan NDVI Recovery per provinsi ──
  // Dihitung dari state ndviData (file recovery_stats_*.csv), menggantikan
  // daftar contoh yang sebelumnya ditulis manual di komponen ini.
  const VEGETASI_PROV_LABEL = { Aceh: 'Aceh', Sumut: 'Sumatera Utara', Sumbar: 'Sumatera Barat' };
  const fmtNdvi = (v) => (v === null || v === undefined || isNaN(v) ? '—' : `${v.toFixed(1).replace('.', ',')}%`);

  const vegetationData = useMemo(() => {
    const out = {};
    Object.keys(VEGETASI_PROV_LABEL).forEach((key) => {
      const rows = ndviData
        .filter((r) => r.provinsi === VEGETASI_PROV_LABEL[key] && r.hasData)
        .sort((a, b) => b.mean - a.mean);

      const toItem = (r) => ({
        name: r.kabupaten,
        val: fmtNdvi(r.mean),
        width: Math.max(0, Math.min(100, r.mean)),
        color: NDVI_STATUS_COLOR[r.status] || '#94a3b8',
      });

      out[key] = {
        label: VEGETASI_PROV_LABEL[key],
        highest: rows.slice(0, 3).map(toItem),
        // slice(-3) mengambil 3 nilai terkecil (urutan menaik setelah reverse)
        lowest: rows.slice(-3).reverse().map(toItem),
        tanpaData: ndviData.filter((r) => r.provinsi === VEGETASI_PROV_LABEL[key] && !r.hasData).length,
      };
    });
    return out;
  }, [ndviData]);

  // Ringkasan lintas provinsi untuk judul & narasi Slide 14 (rata-rata, provinsi
  // tertinggi/terendah, dan wilayah dengan recovery paling rendah lintas provinsi)
  const ndviRingkasan = useMemo(() => {
    const valid = ndviData.filter((r) => r.hasData);
    if (valid.length === 0) return null;

    const overallAvg = valid.reduce((a, r) => a + r.mean, 0) / valid.length;

    const provAvg = Object.values(VEGETASI_PROV_LABEL)
      .map((label) => {
        const rows = valid.filter((r) => r.provinsi === label);
        return rows.length > 0 ? { label, avg: rows.reduce((a, r) => a + r.mean, 0) / rows.length } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.avg - a.avg);

    const terendah = [...valid].sort((a, b) => a.mean - b.mean).slice(0, 3);

    const [top, ...rest] = provAvg;
    const restText = rest.map((p) => `${p.label} ${fmtNdvi(p.avg)}`).join(' dan ');
    const ringkasanKalimat = top
      ? `${top.label} mencatat rata-rata pemulihan tertinggi sebesar ${fmtNdvi(top.avg)}${restText ? `, diikuti ${restText}` : ''}.`
      : '';
    const terendahKalimat = terendah.length > 0
      ? `Titik perhatian utama berada pada wilayah dengan recovery paling rendah, terutama ${terendah.map((r) => r.kabupaten).join(', ')}.`
      : '';

    return {
      overallAvg,
      provAvg,
      terendah,
      ringkasanKalimat,
      terendahKalimat,
      tanpaData: ndviData.length - valid.length,
    };
  }, [ndviData]);

  // ── Turunan data Slide 15: Scorecard Sintesis Pemulihan (3 provinsi × 6 indikator) ──
  // Semua sel dihitung dari state data yang sama dengan slide-slide sebelumnya
  // (genanganData, ndviData, ntlData, roadsData, bangunanTrend, kelembabanAprData),
  // bukan nilai contoh yang ditulis manual.
  const PROV_LIST = ['Aceh', 'Sumatera Utara', 'Sumatera Barat'];
  const INDIKATOR_NAMES = ['Pemulihan Vegetasi', 'Cahaya Malam', 'Genangan Residual', 'Pemulihan Jalan', 'Kondisi Bangunan', 'Kelembaban Tanah'];

  // Rata-rata recovery cahaya malam (NTL) per provinsi, dari ntlData (kab/kota berdata saja)
  const ntlProvStats = useMemo(() => {
    const out = {};
    Object.values(NTL_PROV_LABEL).forEach((label) => {
      const rows = ntlData.filter((r) => r.provinsi === label && r.hasData);
      out[label] = rows.length > 0 ? rows.reduce((a, r) => a + r.recovery, 0) / rows.length : null;
    });
    return out;
  }, [ntlData]);

  // Persentase panjang jalan pulih per provinsi, dari roadsData (ditandai per provinsi saat fetch)
  const roadsStats = useMemo(() => {
    const byProv = {};
    roadsData.forEach((r) => {
      const prov = r.provinsi;
      if (!prov) return;
      if (!byProv[prov]) byProv[prov] = { pulihKm: 0, totalKm: 0 };
      const km = parseFloat(r.panjang_km) || 0;
      const isPulih = r.genangan_terkini === '0' || r.genangan_terkini === 0;
      byProv[prov].totalKm += km;
      if (isPulih) byProv[prov].pulihKm += km;
    });
    const out = {};
    Object.entries(byProv).forEach(([prov, v]) => { out[prov] = v.totalKm > 0 ? (v.pulihKm / v.totalKm) * 100 : null; });
    return out;
  }, [roadsData]);

  // Rata-rata Z-Score kelembaban tanah (Jan–Mei 2026) per provinsi. kelembabanAprData
  // (file R6) tidak punya kolom provinsi sendiri, jadi kab/kota-nya dipetakan ke provinsi
  // lewat kabupaten_key yang sama dengan genanganData (file R3, yang sudah punya provinsi).
  const kelembabanProvStats = useMemo(() => {
    if (!genanganData.length || !kelembabanAprData.length) return {};
    const provByKab = {};
    genanganData.forEach((r) => {
      let prov = r.provinsi || r.NAME_1 || '';
      if (prov.toLowerCase().includes('aceh')) prov = 'Aceh';
      else if (prov.toLowerCase().includes('sumatera utara') || prov.toLowerCase().includes('sumut')) prov = 'Sumatera Utara';
      else if (prov.toLowerCase().includes('sumatera barat') || prov.toLowerCase().includes('sumbar')) prov = 'Sumatera Barat';
      if (prov) provByKab[r.kabupaten_key] = prov;
    });
    const byProv = {};
    kelembabanAprData.forEach((row) => {
      const prov = provByKab[row.kabupaten_key];
      if (!prov || isNaN(row.mean)) return;
      if (!byProv[prov]) byProv[prov] = { sum: 0, count: 0 };
      byProv[prov].sum += row.mean;
      byProv[prov].count += 1;
    });
    const out = {};
    Object.entries(byProv).forEach(([prov, v]) => { out[prov] = v.count > 0 ? v.sum / v.count : null; });
    return out;
  }, [genanganData, kelembabanAprData]);

  // Klasifikasi 4-status untuk Z-Score kelembaban (>1.5 = ambang kritis yang sama
  // dengan Peta Zona Kritis / mode 13; dua ambang di antaranya melengkapi jadi 4 tingkat).
  const classifyKelembaban = (z) => {
    if (z === null || z === undefined || isNaN(z)) return null;
    if (z > 1.5) return 'kritis';
    if (z > 0.5) return 'parah';
    if (z > 0) return 'sedang';
    return 'pulih';
  };

  const STATUS_META = {
    pulih: { label: 'Pulih', bg: '#168573', text: 'text-white' },
    sedang: { label: 'Sedang', bg: '#ffd47d', text: 'text-slate-800' },
    parah: { label: 'Parah', bg: '#f47b2f', text: 'text-white' },
    kritis: { label: 'Kritis', bg: '#d72e38', text: 'text-white' },
  };

  const scorecardData = useMemo(() => {
    const genanganByProv = {};
    (genanganStats.provinsi || []).forEach((p) => { genanganByProv[p.nama] = p.status.toLowerCase(); });

    const bangunanLatestByProv = {};
    Object.entries(bangunanTrend.provinsi || {}).forEach(([prov, arr]) => {
      const last = [...arr].reverse().find((v) => v !== null && v !== undefined);
      bangunanLatestByProv[prov] = last !== undefined ? last : null;
    });

    return PROV_LIST.map((prov) => {
      const ndviAvg = ndviRingkasan ? (ndviRingkasan.provAvg.find((p) => p.label === prov)?.avg ?? null) : null;
      const ntlAvg = ntlProvStats[prov] ?? null;
      const roadsPct = roadsStats[prov] ?? null;
      const bangunanPct = bangunanLatestByProv[prov] ?? null;
      const kelembabanZ = kelembabanProvStats[prov] ?? null;

      return {
        provinsi: prov,
        indikator: [
          getNdviStatus(ndviAvg),        // Ind 1 — Vegetasi
          getNdviStatus(ntlAvg),         // Ind 2 — Cahaya Malam
          genanganByProv[prov] || null,  // Ind 3 — Genangan Residual
          getNdviStatus(roadsPct),       // Ind 4 — Jalan
          getNdviStatus(bangunanPct),    // Ind 5 — Bangunan
          classifyKelembaban(kelembabanZ), // Ind 6 — Kelembaban
        ],
      };
    });
  }, [genanganStats, ndviRingkasan, ntlProvStats, roadsStats, bangunanTrend, kelembabanProvStats]);

  // Kalimat ringkasan per provinsi: indikator mana saja yang berstatus parah/kritis
  const scorecardRingkasan = useMemo(() => {
    return scorecardData.map((row) => {
      const bermasalah = row.indikator
        .map((key, i) => ({ nama: INDIKATOR_NAMES[i], key }))
        .filter((ind) => ind.key === 'kritis' || ind.key === 'parah');
      const kalimat = bermasalah.length === 0
        ? 'Seluruh indikator yang tersedia menunjukkan kondisi sedang hingga pulih.'
        : `Perlu perhatian lebih pada ${bermasalah.map((b) => b.nama).join(', ')}.`;
      return { provinsi: row.provinsi, kalimat };
    });
  }, [scorecardData]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      const slideIndex = Math.round(scrollTop / clientHeight) + 1;
      setActiveSlide(slideIndex);
    };
    const container = containerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);
    return () => { if (container) container.removeEventListener('scroll', handleScroll); };
  }, []);

  useEffect(() => {
    let autoSlideTimer;
    if (activeSlide === 3) {
      autoSlideTimer = setInterval(() => { setMapMode((prev) => (prev + 1) % mapLayers.length); }, 5000); 
    }
    return () => { if (autoSlideTimer) clearInterval(autoSlideTimer); };
  }, [activeSlide]);

  useEffect(() => {
    let kelembabanTimer;
    if (activeSlide === 5) {
      kelembabanTimer = setInterval(() => {
        setKelembabanMode((prev) => {
          if (prev === 11) return 12;
          if (prev === 12) return 13;
          return 11;
        });
      }, 5000);
    }
    return () => { if (kelembabanTimer) clearInterval(kelembabanTimer); };
  }, [activeSlide]);

  useEffect(() => {
    let landslideTimer;
    if (activeSlide === 6) {
      landslideTimer = setInterval(() => {
        setLandslideMode((prev) => (prev === 5 ? 6 : 5));
      }, 5000);
    }
    return () => { if (landslideTimer) clearInterval(landslideTimer); };
  }, [activeSlide]);

  const scrollToSlide = (slideIndex) => {
    if (!containerRef.current) return;
    const clientHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({ top: (slideIndex - 1) * clientHeight, behavior: 'smooth' });
  };

  return (
    <div 
      className="h-screen w-screen text-[#1a2332] relative overflow-hidden font-sans select-none"
      style={{
        backgroundColor: '#edf3f9',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, #b5d1ed 0%, transparent 45%), 
          radial-gradient(circle at 90% 10%, #ffe0a3 0%, transparent 45%), 
          radial-gradient(circle at 50% 50%, #f4f8fc 0%, #edf3f9 100%)
        `
      }}
    >
      <header className="fixed top-0 left-0 right-0 w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300 shadow-sm pointer-events-auto">
          <span className="w-2 h-2 bg-[#168573] rounded-full animate-pulse" />
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-700 font-mod8-body">
            Modul 8 | Monitoring Pemulihan
          </span>
        </div>
        
        <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300 shadow-sm text-xs font-mod8-body pointer-events-auto text-slate-700">
          <button onClick={() => scrollToSlide(activeSlide - 1)} disabled={activeSlide === 1} className={`transition font-bold ${activeSlide === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#f47b2f]'}`}>&larr;</button>
          <span className="font-semibold tracking-widest">{activeSlide} / 17</span>
          <button onClick={() => scrollToSlide(activeSlide + 1)} disabled={activeSlide === 17} className={`transition font-bold ${activeSlide === 17 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#f47b2f]'}`}>&rarr;</button>
        </div>
      </header>

      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        
        {/* SLIDE 1 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center items-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Kondisi Sumatera Terkini</span>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">5 Bulan</span> Setelah Bencana Hidrologi: Seberapa Pulih Sumatera Kini?
              </h1>
              <p className="text-slate-600 text-base leading-relaxed italic pr-4 font-mod8-sub border-l-2 border-[#168573] pl-4">
                "Dari akses jalan yang pernah terputus, genangan yang masih tertinggal, hingga hijaunya vegetasi yang pelan-pelan kembali."
              </p>
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-base font-bold text-[#f47b2f]">5 Bulan</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Fase pemulihan dari Januari hingga Mei 2026.</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-base font-bold text-slate-700">75 Kab/Kota</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Di Provinsi Aceh, Sumatera Utara, dan Sumatera Barat.</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-base font-bold text-[#168573]">90% Pulih</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Beberapa wilayah masih memerlukan perhatian.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden shadow-md">
              <MapComponent currentMode={0} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} bangunanData={bangunanData} ntlData={ntlData} ndviData={ndviData} />
            </div>
          </div>
        </section>

        {/* SLIDE 2 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-24 pb-12 px-8 relative">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Konteks Bencana</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading">Pemulihan Tidak Sesederhana Angka.</h2>
              <p className="text-slate-600 text-sm max-w-5xl leading-relaxed font-mod8-sub italic">
                Pemulihan terlihat dari air yang pergi, tanah yang mengering, jalan yang terbuka, rumah yang kembali dihuni, lampu yang menyala, dan alam yang kembali hijau.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              {[
                { t: "Nov 2025", p: "Serangkaian bencana hidrometeorologi berupa banjir bandang menerjang wilayah utara Sumatera." },
                { t: "Des 2025", p: "Pemerintah menetapkan Status Tanggap Darurat setelah banjir memutus akses jalan dan listrik." },
                { t: "Jan 2026", p: "Ratusan ribu korban masih bertahan di tenda darurat. Korban meninggal mencapai 1.199 jiwa." },
                { t: "Feb 2026", p: "Wilayah mulai berangsur pulih seiring percepatan rehabilitasi infrastruktur dan fasilitas umum." },
                { t: "Saat Ini", p: "Fokus pemulihan kini diarahkan pada pembangunan permanen dan pemulihan ekonomi masyarakat.", highlight: true }
              ].map((item, i) => (
                <div key={i} className={`bg-gradient-to-br from-white to-slate-50 border ${item.highlight ? 'border-2 border-[#168573]' : 'border-slate-300'} p-5 rounded-2xl flex flex-col gap-2 font-mod8-body shadow-sm`}>
                  <span className={`text-xs font-bold ${item.highlight ? 'text-[#168573]' : 'text-[#f47b2f]'} tracking-wider`}>{item.t}</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-light">{item.p}</p>
                </div>
              ))}
            </div>

            <p className="text-xs font-medium text-slate-700 font-mod8-body pt-2 border-t border-slate-300">
              Indikator Monitoring Pemulihan yang digunakan:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mod8-body">
              {[
                { n: 1, t: "Pemulihan Vegetasi", c: "#168573", d: "Stabilnya tanah & berkurangnya longsor." },
                { n: 2, t: "Cahaya Malam", c: "#1a2332", d: "Tanda pulihnya listrik & aktivitas." },
                { n: 3, t: "Genangan Residual", c: "#5b8fbf", d: "Cakupan luapan air yang sudah surut." },
                { n: 4, t: "Pemulihan Jalan", c: "#f47b2f", d: "Akses konektivitas transportasi warga." },
                { n: 5, t: "Kondisi Bangunan", c: "#d72e38", d: "Rekonstruksi fisik fasilitas publik." },
                { n: 6, t: "Kelembaban Tanah", c: "#168573", d: "Tingkat kepadatan tanah pascabanjir." }
              ].map((ind, i) => (
                <div key={i} className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white uppercase px-2.5 py-0.5 rounded-full w-fit" style={{ backgroundColor: ind.c }}>Indikator {ind.n}</span>
                  <strong className="text-xs text-slate-800 font-bold tracking-tight">{ind.t}</strong>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-light">{ind.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 3 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Indikator 3</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                Air Surut <br />Tetapi Genangan Residual Masih Tertinggal.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body pr-4 text-justify">
                Citra Sentinel-1 menunjukkan wilayah yang masih menyimpan genangan hingga Mei 2026. Semakin besar area berwarna mencolok, semakin lambat pemulihan infrastruktur wilayah berlangsung.
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={mapMode} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {mapLayers.map((layer) => (
                  <button key={layer.id} onClick={() => setMapMode(layer.id)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${mapMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Statistik Genangan (Data Real CSV GEE)</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-tight">
                <span className="text-[#f47b2f]">{genanganStats.persenResidual}%</span> <br />Rata-rata Genangan Residual.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body">
                Dari total {genanganStats.luasPuncak} hektare genangan saat puncak banjir, sekitar {genanganStats.luasResidual} hektare masih terdeteksi sebagai genangan residual di area analisis berdasarkan Citra Sentinel-1.
              </p>
            </div>
            <div className="lg:col-span-7 w-full bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 space-y-6 flex flex-col shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                {[[`${genanganStats.luasPuncak} ha`, "Luas Puncak"], [`${genanganStats.luasResidual} ha`, "Luas Residual"], [`${genanganStats.persenTerdampak}%`, "Terdampak"]].map(([v, l], i) => (
                  <div key={i} className="bg-white border border-slate-300 p-4 rounded-2xl text-center shadow-xs">
                    <span className="text-xl font-bold text-slate-800 block">{v}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 font-mod8-body text-xs">
                {genanganStats.provinsi.slice(0, 3).map((prov, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700"><span>{prov.nama}</span><span style={{ color: prov.color }}>{prov.persen}% — {prov.status}</span></div>
                    <div className="w-full h-3 bg-slate-200 border border-slate-300 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${prov.persen}%`, backgroundColor: prov.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#fdfcf7] border border-orange-200 p-4 rounded-2xl font-mod8-body">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f47b2f] block mb-1">Metodologi Radar Sentinel-1</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-light text-justify">Analisis menggunakan threshold -15 dB pada Google Earth Engine untuk identifikasi genangan yang stabil dan diekstrak langsung dari file Modul8_R3.csv.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 5 — Kelembaban Tanah: peta bisa digeser antara 5a/5b/5c (sama seperti toggle Slide 3) */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Kelembaban Tanah - Indikator 6</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                {kelembabanContent[kelembabanMode].headingA} <br /><span className="text-[#f47b2f]">{kelembabanContent[kelembabanMode].headingB}</span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body pr-4 text-justify">
                {kelembabanContent[kelembabanMode].desc}
              </p>
              <div className="space-y-3 pt-2">
                {kelembabanContent[kelembabanMode].provinsi.map(([prov, desc], i) => (
                  <div key={i} className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl shadow-sm font-mod8-body">
                    <span className="text-xs font-bold text-[#5b8fbf] block mb-0.5">{prov}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-light">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={kelembabanMode} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {kelembabanLayers.map((layer) => (
                  <button key={layer.id} onClick={() => setKelembabanMode(layer.id)} title={layer.label} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${kelembabanMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 6 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Analisis Risiko Longsor
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                Risiko Longsor <br /><span className="text-[#f47b2f]">Menurun Signifikan.</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#5b8fbf] pl-4">
                Peta risiko longsor dari analisis silang kelembaban tanah (tanah sangat jenuh) dan kemiringan lereng di atas 15 derajat.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Saat puncak bencana, lereng di Aceh berpotensi longsor tinggi. Memasuki fase pemulihan, zona rawan longsor menyusut tajam.
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={landslideMode} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {landslideLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setLandslideMode(layer.id)}
                    title={layer.label}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${landslideMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 7 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Pemulihan Akses Jalan - Indikator 4</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">2.058 km</span> <br />Akses jalan pernah terputus.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Pemulihan tidak terasa nyata sampai jalan kembali bisa dilewati dan aktivitas manusia kembali berjalan diatasnya.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xl font-bold text-[#168573]">1.900 km</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pulih</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xl font-bold text-[#d72e38]">100 km</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Terputus</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xl font-bold text-[#f47b2f]">58 km</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Tergenang</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={7} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 8 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Pemulihan Akses Jalan - Indikator 4</span>
              <h2 className="text-4xl lg:text-6xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.1]">
                <span className="text-[#f47b2f]">84%</span> <br />Akses Jalan Telah Pulih, Aceh Pulih Paling Cepat.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Pemulihan akses jalan tidak terjadi merata di tiga provinsi terdampak. Aceh menunjukkan pemulihan paling cepat, sementara Sumatera Barat dan Sumatera Utara masih perlu perhatian.
              </p>
              <div className="bg-gradient-to-br from-[#f8fafc] to-white border-l-4 border-[#168573] p-4 rounded-r-2xl font-mod8-body italic text-slate-500 text-xs leading-relaxed">
                Aceh mencatat pemulihan akses jalan sebesar 84,0%, diikuti oleh Sumatera Utara 65,1%, dan Sumatera Barat pada 54,1%.
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-5 font-mod8-heading">Pemulihan akses jalan per Provinsi</h3>
                <div className="space-y-4 font-mod8-body">
                  {[
                    { label: "Aceh", val: 84.0, color: "#168573" },
                    { label: "Sumatera Utara", val: 65.1, color: "#f47b2f" },
                    { label: "Sumatera Barat", val: 54.1, color: "#ffd47d" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 border border-slate-300 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 font-mod8-heading">Komposisi kategori jalan terdampak per Provinsi</h3>
                <div className="space-y-4 font-mod8-body">
                  {[
                    { label: "Aceh", stack: [{w: 15, c: '#168573'}, {w: 45, c: '#f47b2f'}, {w: 25, c: '#5b8fbf'}, {w: 15, c: '#d72e38'}] },
                    { label: "Sumatera Utara", stack: [{w: 40, c: '#168573'}, {w: 35, c: '#f47b2f'}, {w: 15, c: '#5b8fbf'}, {w: 10, c: '#d72e38'}] },
                    { label: "Sumatera Barat", stack: [{w: 25, c: '#168573'}, {w: 35, c: '#f47b2f'}, {w: 25, c: '#5b8fbf'}, {w: 15, c: '#d72e38'}] }
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-xs font-bold text-slate-700">{row.label}</span>
                      <div className="w-full h-3.5 flex border border-slate-300 rounded-full overflow-hidden bg-slate-100">
                        {row.stack.map((s, sIdx) => (
                          <div key={sIdx} style={{ width: `${s.w}%`, backgroundColor: s.c }} className="h-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-2 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#168573]" /><span>Residential</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f47b2f]" /><span>Primary</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#5b8fbf]" /><span>Secondary</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d72e38]" /><span>Tertiary</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 9 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Kondisi Bangunan - Indikator 5
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Tempat Tinggal</span> <br />Ada Rumah untuk Pulang?
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body pr-4 text-justify">
                Jalan bisa terbuka lebih dulu. Tapi pemulihan baru benar-benar terasa ketika rumah, sekolah, kios, dan fasilitas layanan publik bisa kembali digunakan.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed font-mod8-body text-justify pr-4 italic border-l-2 border-[#168573] pl-3">
                Indikator R-5 membaca pemulihan fisik bangunan dari citra Sentinel-2 dan Google Open Buildings. Bangunan dianggap pulih ketika area terbangun mulai kembali mendekati kondisi normal sebelum bencana.
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={8} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} bangunanData={bangunanData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 10 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Kondisi Bangunan - Indikator 5
              </span>
              {(() => {
                const n = bangunanTrend.rataRata.length;
                const rataAwal = n > 0 ? bangunanTrend.rataRata[0] : null;
                const rataAkhir = n > 0 ? bangunanTrend.rataRata[n - 1] : null;
                const bulanAkhirLabel = n > 0 ? bangunanTrend.bulanLabel[n - 1].split(' ')[0] : 'Mei';
                const fmt = (v) => v === null || v === undefined ? '—' : v.toFixed(1).replace('.', ',') + '%';

                const rankingAkhir = n > 0
                  ? Object.entries(bangunanTrend.provinsi)
                      .map(([nama, arr]) => ({ nama, val: arr[n - 1] }))
                      .filter((p) => p.val !== null && p.val !== undefined)
                      .sort((a, b) => b.val - a.val)
                  : [];

                return (
                  <>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                      <span className="text-[#f47b2f]">{fmt(rataAkhir)}</span> <br />Rata-rata Pemulihan Bangunan, Menguat Hingga {bulanAkhirLabel}.
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                      Tren pemulihan kondisi bangunan bergerak naik secara serentak pada akhir periode pemantauan.
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                      Dari agregasi bulanan tiga provinsi, rata-rata gabungan pemulihan bangunan {rataAkhir !== null && rataAwal !== null && rataAkhir >= rataAwal ? 'meningkat' : 'bergerak'} dari {fmt(rataAwal)} pada {n > 0 ? bangunanTrend.bulanLabel[0] : 'Januari'} menjadi {fmt(rataAkhir)} pada {n > 0 ? bangunanTrend.bulanLabel[n - 1] : 'Mei 2026'}.
                      {rankingAkhir.length > 0 && (
                        <> Pada bulan terakhir, {rankingAkhir[0].nama} mencatat pemulihan tertinggi ({fmt(rankingAkhir[0].val)}){rankingAkhir.length > 1 ? `, disusul ${rankingAkhir.slice(1).map((p) => `${p.nama} (${fmt(p.val)})`).join(' dan ')}` : ''}.</>
                      )}
                    </p>
                  </>
                );
              })()}
            </div>

            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-800 mb-4 font-mod8-heading">
                Tren bulanan pemulihan bangunan
              </h3>
              <div className="w-full h-[280px] relative font-mod8-body">
                {bangunanTrend.bulan.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    Memuat data tren pemulihan bangunan...
                  </div>
                ) : (
                  <svg viewBox="0 0 540 240" className="w-full h-full overflow-visible">
                    {[
                      { val: '90%', y: 20 },
                      { val: '85%', y: 42.5 },
                      { val: '80%', y: 65 },
                      { val: '75%', y: 87.5 },
                      { val: '70%', y: 110 },
                      { val: '65%', y: 132.5 },
                      { val: '60%', y: 155 },
                      { val: '55%', y: 177.5 },
                      { val: '50%', y: 200 },
                    ].map((grid, idx) => (
                      <g key={idx}>
                        <line x1="50" y1={grid.y} x2="520" y2={grid.y} stroke="#e2e8f0" strokeWidth="1" />
                        <text x="40" y={grid.y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="bold">
                          {grid.val}
                        </text>
                      </g>
                    ))}
                    {(() => {
                      // ── Bangun titik & garis tren dari data agregasi bulanan asli (state bangunanTrend) ──
                      // Grafik ini SENGAJA tidak pernah menembak data harian mentah dari CSV — nilai yang
                      // dipetakan di sini sudah lewat Agregasi Jendela Waktu Bulanan (lihat useEffect di atas),
                      // sesuai acuan Tim Pengolah Data (poin 1).
                      const n = bangunanTrend.bulan.length;
                      const xFor = (i) => n > 1 ? 75 + i * ((495 - 75) / (n - 1)) : 285;
                      // Skala grid tetap 50%-90% (sesuai desain asli); nilai di-clamp agar tetap
                      // tergambar rapi meski ada bulan dengan capaian di luar rentang itu.
                      const yFor = (val) => 20 + ((90 - Math.max(50, Math.min(90, val))) / 5) * 22.5;

                      const buildSmoothPath = (points) => {
                        if (points.length === 0) return '';
                        if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
                        let d = `M ${points[0].x} ${points[0].y}`;
                        for (let i = 0; i < points.length - 1; i++) {
                          const p0 = points[i], p1 = points[i + 1];
                          const midX = (p0.x + p1.x) / 2;
                          d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
                        }
                        return d;
                      };

                      const seriesColors = { 'Aceh': '#168573', 'Sumatera Barat': '#f47b2f', 'Sumatera Utara': '#5b8fbf' };

                      const provPaths = Object.entries(bangunanTrend.provinsi).map(([nama, arr]) => {
                        const points = arr.map((v, i) => (v === null ? null : { x: xFor(i), y: yFor(v) })).filter(Boolean);
                        return { nama, color: seriesColors[nama] || '#94a3b8', points };
                      });

                      const rataPoints = bangunanTrend.rataRata.map((v, i) => (v === null ? null : { x: xFor(i), y: yFor(v) })).filter(Boolean);

                      return (
                        <>
                          {bangunanTrend.bulanLabel.map((label, idx) => (
                            <text key={idx} x={xFor(idx)} y="222" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                              {label.split(' ')[0]}
                            </text>
                          ))}
                          {provPaths.map((s) => (
                            <g key={s.nama}>
                              <path d={buildSmoothPath(s.points)} fill="none" stroke={s.color} strokeWidth="2.2" />
                              {s.points.map((pt, i) => (
                                <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill={s.color} stroke="#ffffff" strokeWidth="1" />
                              ))}
                            </g>
                          ))}
                          <path d={buildSmoothPath(rataPoints)} fill="none" stroke="#1a2332" strokeWidth="2.5" />
                          {rataPoints.map((pt, i) => (
                            <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#1a2332" stroke="#ffffff" strokeWidth="1.2" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-200/80 font-mod8-body text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1a2332]" /><span>Rata-rata</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#168573]" /><span>Aceh</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f47b2f]" /><span>Sumatera Barat</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#5b8fbf]" /><span>Sumatera Utara</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 11 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Intensitas Cahaya Malam - Indikator 2
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Lampu Menyala</span> <br />Tanda Aktivitas Mulai Kembali.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Intensitas cahaya malam menjadi sinyal tidak langsung untuk membaca pulihnya listrik, mobilitas, dan aktivitas ekonomi setelah bencana. Semakin terang wilayah, semakin kuat indikasi aktivitas malam telah pulih.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xs font-bold text-[#168573] uppercase tracking-wider">Baseline</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Intensitas cahaya malam Maret–Mei 2025</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xs font-bold text-[#168573] uppercase tracking-wider">Current</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Intensitas cahaya malam April 2026</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xs font-bold text-[#168573] uppercase tracking-wider">Recovery</span>
                  <div className="text-[10px] text-slate-500 leading-normal mt-1 flex items-center gap-1.5">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-slate-700">Baseline</span>
                      <div className="w-full border-t border-slate-400 my-0.5" />
                      <span className="font-semibold text-slate-700">Current</span>
                    </div>
                    <span className="text-[10px] text-slate-500">× 100</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={9} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} ntlData={ntlData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 12 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Intensitas Cahaya Malam - Indikator 2
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">{ntlRingkasan ? fmtNtl(ntlRingkasan.terendah.recovery) : '—'}</span> <br />Recovery Intensitas Cahaya Malam Terendah
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                {ntlRingkasan
                  ? `${ntlRingkasan.diAtasBaseline} dari ${ntlRingkasan.jumlahValid} kab/kota sudah melampaui baseline (recovery ≥ 100%), tetapi wilayah dengan cahaya malam terendah justru menjadi sinyal prioritas pemulihan.`
                  : 'Beberapa Kab/Kota sudah melampaui baseline atau nilai recovery lebih dari 100%, tetapi wilayah dengan cahaya malam terendah justru menjadi sinyal prioritas pemulihan.'}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Nilai recovery di bawah 100% menandakan wilayah belum pulih sepenuhnya. Nilai 100% menunjukkan kondisi telah kembali seperti sebelum bencana, sedangkan di atas 100% berarti kondisinya sudah lebih baik dari sebelum bencana.
                {ntlRingkasan && (
                  <> Nilai terendah tercatat di {ntlRingkasan.terendah.kabupaten} ({fmtNtl(ntlRingkasan.terendah.recovery)}) dan tertinggi di {ntlRingkasan.tertinggi.kabupaten} ({fmtNtl(ntlRingkasan.tertinggi.recovery)}).</>
                )}
                {ntlRingkasan && ntlRingkasan.tanpaData > 0 && (
                  <> {ntlRingkasan.tanpaData} kab/kota belum memiliki nilai NTL valid sehingga tidak diikutkan dalam peringkat.</>
                )}
              </p>
            </div>

            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-mod8-heading">Pemulihan Intensitas Cahaya Malam</h3>
                <span className="text-xs font-bold text-[#f47b2f] font-mod8-body block mt-0.5">
                  &gt; {selectedNightLightProv === 'Aceh' ? 'Aceh' : selectedNightLightProv === 'Sumut' ? 'Sumatera Utara' : 'Sumatera Barat'}
                </span>
              </div>
              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#168573] px-2.5 py-0.5 rounded-full w-fit block">3 Tertinggi</span>
                <div className="space-y-2">
                  {nightLightData[selectedNightLightProv].highest.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium">Memuat data cahaya malam...</p>
                  ) : nightLightData[selectedNightLightProv].highest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-medium text-slate-700 truncate" title={item.name}>{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((item.val / 150) * 100, 100)}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="w-14 text-right font-bold text-[#168573] text-xs">{fmtNtl(item.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#d72e38] px-2.5 py-0.5 rounded-full w-fit block">3 Terendah</span>
                <div className="space-y-2">
                  {nightLightData[selectedNightLightProv].lowest.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium">Memuat data cahaya malam...</p>
                  ) : nightLightData[selectedNightLightProv].lowest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-medium text-slate-700 truncate" title={item.name}>{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((item.val / 150) * 100, 100)}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="w-14 text-right font-bold text-[#d72e38] text-xs">{fmtNtl(item.val)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full bg-slate-100/90 border border-slate-200 py-1.5 px-3 rounded-xl flex items-center justify-between text-[10px] font-semibold text-slate-500 font-mod8-body">
                <span>— 100% atau Setara Baseline</span>
                {nightLightData[selectedNightLightProv].tanpaData > 0 && (
                  <span className="text-slate-400 font-medium">{nightLightData[selectedNightLightProv].tanpaData} kab/kota tanpa data</span>
                )}
              </div>
              <div className="flex justify-center items-center gap-2 pt-1 font-mod8-body">
                {['Aceh', 'Sumut', 'Sumbar'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setSelectedNightLightProv(prov)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      selectedNightLightProv === prov
                        ? 'bg-[#1a2332] text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 13 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Vegetasi - Indikator 1
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Kembali Hijau</span> <br />Tapi Tidak Secara Serentak
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Vegetasi pulih lebih lambat dibanding jalan, bangunan, atau intensitas cahaya malam. NDVI membantu membaca apakah tutupan lahan dan ekosistem mulai kembali stabil setelah bencana.
              </p>
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-5 rounded-2xl flex flex-col items-center justify-center font-mod8-body shadow-sm max-w-sm">
                <span className="text-xs font-bold text-[#168573] uppercase tracking-wider mb-2">Formula</span>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="font-medium">NDVI Recovery =</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-semibold text-slate-600 px-1">Baseline − Impact</span>
                    <div className="w-full border-t border-slate-400 my-0.5" />
                    <span className="text-[11px] font-semibold text-slate-600 px-1">Current − Impact</span>
                  </div>
                  <span className="font-semibold text-slate-700">× 100</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={10} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} roadsData={roadsData} ndviData={ndviData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 14 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Vegetasi - Indikator 1
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">{ndviRingkasan ? fmtNdvi(ndviRingkasan.overallAvg) : '—'}</span> <br />Rata-rata Pemulihan Vegetasi
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                Secara agregat, tingkat pemulihan vegetasi berbeda-beda antar provinsi, dan di tingkat kabupaten/kota kontrasnya masih tajam.
                {ndviRingkasan && ndviRingkasan.tanpaData > 0 && (
                  <> {ndviRingkasan.tanpaData} kab/kota belum memiliki piksel vegetasi valid sehingga tidak diikutkan dalam rata-rata.</>
                )}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                {ndviRingkasan
                  ? `${ndviRingkasan.ringkasanKalimat} ${ndviRingkasan.terendahKalimat}`
                  : 'Memuat data pemulihan vegetasi...'}
              </p>
            </div>

            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-mod8-heading">
                  Pemulihan Vegetasi (NDVI Recovery)
                </h3>
                <span className="text-xs font-bold text-[#f47b2f] font-mod8-body block mt-0.5">
                  &gt; {vegetationData[selectedVegetationProv].label}
                </span>
              </div>

              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#168573] px-2.5 py-0.5 rounded-full w-fit block">
                  3 Tertinggi
                </span>
                <div className="space-y-2">
                  {vegetationData[selectedVegetationProv].highest.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium">Memuat data vegetasi...</p>
                  ) : vegetationData[selectedVegetationProv].highest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-medium text-slate-700 truncate">{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-300 z-10" />
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.width}%`, backgroundColor: item.color }} 
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-[#5b8fbf] text-xs">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#d72e38] px-2.5 py-0.5 rounded-full w-fit block">
                  3 Terendah
                </span>
                <div className="space-y-2">
                  {vegetationData[selectedVegetationProv].lowest.length === 0 ? (
                    <p className="text-[11px] text-slate-400 font-medium">Memuat data vegetasi...</p>
                  ) : vegetationData[selectedVegetationProv].lowest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-medium text-slate-700 truncate">{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-300 z-10" />
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.width}%`, backgroundColor: item.color }} 
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-[#d72e38] text-xs">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full bg-slate-100/90 border border-slate-200 py-1.5 px-3 rounded-xl flex items-center justify-between text-[10px] font-semibold text-slate-500 font-mod8-body">
                <span>— &lt; 25% = prioritas intervensi</span>
                {vegetationData[selectedVegetationProv].tanpaData > 0 && (
                  <span className="text-slate-400 font-medium">{vegetationData[selectedVegetationProv].tanpaData} kab/kota tanpa data</span>
                )}
              </div>

              <div className="flex justify-center items-center gap-2 pt-1 font-mod8-body">
                {['Aceh', 'Sumut', 'Sumbar'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setSelectedVegetationProv(prov)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      selectedVegetationProv === prov
                        ? 'bg-[#1a2332] text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 15 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="space-y-2">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Sintesis Pemulihan
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1a2332] font-mod8-heading tracking-tight">
                Bukan Hanya Satu Tanda, Pemulihan Dibaca dari Gabungan Beberapa Sinyal.
              </h2>
              <p className="text-slate-500 text-xs max-w-5xl leading-relaxed font-mod8-sub italic">
                Setiap indikator membaca sisi pemulihan yang berbeda: air yang surut, tanah yang stabil, jalan yang terbuka, bangunan yang kembali, aktivitas malam, dan vegetasi yang pulih.
              </p>
              <p className="text-slate-600 text-xs max-w-5xl leading-relaxed font-mod8-body">
                Scorecard 3×6 berikut merangkum kondisi Aceh, Sumatera Utara, dan Sumatera Barat pada enam indikator pemulihan. Tujuannya bukan hanya melihat siapa yang paling pulih, tetapi menemukan wilayah yang masalahnya saling menumpuk dan membutuhkan perhatian lintas sektor.
              </p>
            </div>

            <div className="grid grid-cols-7 gap-3 font-mod8-body text-xs pt-4">
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Provinsi</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Ind 1<br />(Vegetasi)</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Ind 2<br />(Cahaya)</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Ind 3<br />(Genangan)</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Ind 4<br />(Jalan)</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Ind 5<br />(Bangunan)</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Ind 6<br />(Kelembaban)</div>

              {scorecardData.map((row) => (
                <React.Fragment key={row.provinsi}>
                  <div className="bg-slate-200/80 text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center">{row.provinsi}</div>
                  {row.indikator.map((key, i) => {
                    const meta = STATUS_META[key];
                    return (
                      <div
                        key={i}
                        className={`font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs ${meta ? meta.text : 'text-slate-400'}`}
                        style={{ backgroundColor: meta ? meta.bg : '#e2e8f0' }}
                      >
                        {meta ? meta.label : 'Tanpa Data'}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 font-mod8-body">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Legenda Status</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_META.pulih.bg }} />
                    <span><strong style={{ color: STATUS_META.pulih.bg }}>Hijau (Pulih):</strong> <span className="text-slate-600">Kondisi kembali normal / melebihi baseline</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_META.sedang.bg }} />
                    <span><strong style={{ color: '#b8860b' }}>Kuning (Sedang):</strong> <span className="text-slate-600">Mulai membaik, perlu pemantauan</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_META.parah.bg }} />
                    <span><strong style={{ color: STATUS_META.parah.bg }}>Oranye (Parah):</strong> <span className="text-slate-600">Butuh intervensi tambahan</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_META.kritis.bg }} />
                    <span><strong style={{ color: STATUS_META.kritis.bg }}>Merah (Kritis):</strong> <span className="text-slate-600">Perlu intervensi segera & prioritas tinggi</span></span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">Ringkasan Provinsi</h3>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {scorecardRingkasan.map((r) => (
                    <p key={r.provinsi}><strong className="text-slate-800">{r.provinsi}:</strong> {r.kalimat}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 16 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Prioritas Intervensi
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">Prioritas</span> <br />Muncul Saat Beberapa Risiko Bertemu.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                Wilayah prioritas bukan hanya yang memiliki satu indikator buruk, tetapi wilayah yang menunjukkan tekanan berlapis pada lebih dari satu dimensi pemulihan.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Perhatian utama diarahkan pada wilayah dengan beberapa sinyal pemulihan yang masih lemah. Semakin banyak sinyal lemah yang muncul bersamaan, semakin tinggi kebutuhan intervensinya.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white/95 border border-slate-300 rounded-3xl p-7 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#168573] font-mod8-heading mb-4">
                Daftar Wilayah Prioritas
              </h3>

              <div className="space-y-3 font-mod8-body">
                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">1</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Sumatera Barat</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Genangan residual tinggi, akses jalan sangat kritis, dan pemulihan vegetasi belum merata
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">2</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Padang Lawas Utara</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Pemulihan vegetasi hanya 16,4%</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">3</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Aceh Tamiang</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Pemulihan vegetasi tertinggal dan indikasi dampak banjir masih kuat
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">4</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Dharmasraya</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Genangan residual dan akses jalan perlu dipantau silang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 17 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center items-center pt-20 px-8 relative">
          <div className="w-full max-w-4xl bg-white/95 border border-slate-300 rounded-[32px] p-8 md:p-14 shadow-sm space-y-6 relative">
            <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
              Penutup
            </span>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a2332] font-mod8-heading tracking-tight leading-[1.15]">
              Pemulihan Bukan Garis Lurus.
            </h2>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-mod8-sub italic">
              Di sebagian tempat, air telah surut, jalan kembali terbuka, bangunan mulai pulih, cahaya malam menyala, dan vegetasi tumbuh kembali. Di tempat lain, tanda-tanda itu belum hadir bersamaan.
            </p>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-mod8-body">
              Karena itu, pemulihan perlu dibaca sebagai kumpulan sinyal. Bukan untuk mencari wilayah yang paling tertinggal semata, tetapi untuk memastikan bantuan, rehabilitasi, dan rekonstruksi diarahkan ke tempat yang paling membutuhkan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mod8-body">
              <button
                onClick={() => scrollToSlide(1)}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                Ulangi cerita
              </button>
              <button
                onClick={() => scrollToSlide(1)}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                Buka dashboard lengkap
              </button>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-2 font-mod8-body">
              Dashboard ini hanya desain awal, creator menerima segala kritik dan saran yang membangun ~budi.
            </p>
          </div>

          <span className="absolute bottom-6 right-10 text-xs text-slate-400 font-mod8-body">
            Terima Kasih
          </span>
        </section>

      </div>
    </div>
  );
}