'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function normalizeName(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function stripPrefix(norm) {
  for (const p of ['kota ', 'kabupaten ', 'kab. ', 'kab ']) {
    if (norm.startsWith(p)) return norm.slice(p.length);
  }
  return norm;
}

function getRegionNameFromFeature(feature) {
  const p = feature.properties || {};
  const possibleKeys = [
    'NAME_2', 'KABKOT', 'ADM2_NAME', 'WADMKK', 'NAMOBJ', 
    'kabupaten', 'Kabupaten', 'KABUPATEN', 'name', 'Name', 'NAME', 'regency'
  ];
  for (let key of possibleKeys) {
    if (p[key]) return p[key];
  }
  const fallbackName = Object.values(p).find(val => typeof val === 'string' && val.length > 3 && isNaN(Number(val)));
  return fallbackName || '';
}

function findRecord(feature, byKey, byNoPrefix, byNoSpace) {
  const raw = getRegionNameFromFeature(feature);
  const norm = normalizeName(raw);
  const noPrefix = stripPrefix(norm);
  const noSpace = noPrefix.replace(/\s+/g, '');

  let rec = byKey.get(norm) || byNoPrefix.get(noPrefix) || byKey.get(noPrefix) || byNoPrefix.get(norm);
  if (rec) return rec;

  // Lapis pencocokan tambahan: abaikan spasi sepenuhnya.
  // Menangani kasus nama yang ditulis beda (mis. "Gayo Lues" vs "Gayolues").
  if (byNoSpace) {
    rec = byNoSpace.get(noSpace) || byNoSpace.get(norm.replace(/\s+/g, ''));
    if (rec) return rec;
  }

  for (let [key, record] of byKey.entries()) {
    if (norm.includes(key) || key.includes(norm) || noPrefix.includes(key) || key.includes(noPrefix)) {
      return record;
    }
  }
  return null;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const c = a.map((v, i) => v + (b[i] - v) * Math.max(0, Math.min(1, t)));
  return rgbToHex(c);
}

function quantileBreaks(values, buckets = 4, ignoreZero = false) {
  let sorted = [...values].filter((v) => Number.isFinite(v));
  if (ignoreZero) sorted = sorted.filter(v => v > 0);
  sorted.sort((a, b) => a - b);
  if (sorted.length === 0) return Array(buckets - 1).fill(0);
  const breaks = [];
  for (let i = 1; i < buckets; i++) {
    const idx = Math.floor((sorted.length * i) / buckets);
    breaks.push(sorted[Math.min(idx, sorted.length - 1)]);
  }
  return breaks;
}

function getBucketIndex(value, breaks) {
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) return i;
  }
  return breaks.length;
}

// ─── UTIL SPASIAL: dipakai untuk "menempelkan" tiap ruas jalan (LineString)
// ke poligon kabupaten/kota yang memuatnya, karena file R4_*.csv tidak
// punya kolom nama kabupaten sendiri — hanya geometri jalan. ───

// Ray-casting sederhana: apakah titik [lon, lat] ada di dalam satu ring (array titik)
function pointInRing(point, ring) {
  let inside = false;
  const [x, y] = point;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Polygon GeoJSON = [ringLuar, ringLubang1, ringLubang2, ...]
function pointInPolygonCoords(point, polygonCoords) {
  if (!polygonCoords || polygonCoords.length === 0) return false;
  if (!pointInRing(point, polygonCoords[0])) return false;
  for (let k = 1; k < polygonCoords.length; k++) {
    if (pointInRing(point, polygonCoords[k])) return false; // di dalam lubang -> di luar poligon
  }
  return true;
}

function pointInGeometry(point, geometry) {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return pointInPolygonCoords(point, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.some((poly) => pointInPolygonCoords(point, poly));
  return false;
}

// Bounding box geometry, dipakai sebagai filter cepat sebelum uji titik-dalam-poligon yang lebih berat
function getGeometryBBox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const scanRing = (ring) => {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  };
  if (geometry?.type === 'Polygon') geometry.coordinates.forEach(scanRing);
  else if (geometry?.type === 'MultiPolygon') geometry.coordinates.forEach((poly) => poly.forEach(scanRing));
  return [minX, minY, maxX, maxY];
}

// Ambil satu titik representatif dari ruas jalan (titik tengah) untuk uji spasial
function getRoadSamplePoint(geometry) {
  if (!geometry || !geometry.coordinates) return null;
  let coords = null;
  if (geometry.type === 'LineString') coords = geometry.coordinates;
  else if (geometry.type === 'MultiLineString') coords = geometry.coordinates[0];
  if (!coords || coords.length === 0) return null;
  return coords[Math.floor(coords.length / 2)];
}

// Agregasi panjang jalan (pulih vs masih tergenang/terputus) per kabupaten/kota,
// dengan mencocokkan titik tengah tiap ruas jalan ke poligon batas wilayah.
// Hasilnya disusun dengan struktur key yang sama dengan populateMaps() (kabupaten_key,
// kabupaten_key_noprefix, kabupaten_key_nospace) supaya bisa dipakai lewat findRecord().
function aggregateRoadsByKabupaten(roadsData, boundaryFeatures) {
  const byKey = new Map();
  const byNoPrefix = new Map();
  const byNoSpace = new Map();
  if (!roadsData || roadsData.length === 0 || !boundaryFeatures || boundaryFeatures.length === 0) {
    return { byKey, byNoPrefix, byNoSpace };
  }

  const featInfos = boundaryFeatures.map((feature) => {
    const rawName = getRegionNameFromFeature(feature);
    const norm = normalizeName(rawName);
    const noPrefix = stripPrefix(norm);
    const noSpace = noPrefix.replace(/\s+/g, '');
    return { feature, rawName, norm, noPrefix, noSpace, bbox: getGeometryBBox(feature.geometry) };
  });

  const ensureRecord = (info) => {
    let rec = byKey.get(info.norm);
    if (!rec) {
      rec = {
        kabupaten: info.rawName,
        kabupaten_key: info.norm,
        kabupaten_key_noprefix: info.noPrefix,
        kabupaten_key_nospace: info.noSpace,
        pulihKm: 0,
        terdampakKm: 0,
        pulihCount: 0,
        terdampakCount: 0,
      };
      byKey.set(info.norm, rec);
      byNoPrefix.set(info.noPrefix, rec);
      byNoSpace.set(info.noSpace, rec);
    }
    return rec;
  };

  roadsData.forEach((road) => {
    const point = getRoadSamplePoint(road.geometry);
    if (!point) return;

    let matched = null;
    for (const info of featInfos) {
      const [minX, minY, maxX, maxY] = info.bbox;
      if (point[0] < minX || point[0] > maxX || point[1] < minY || point[1] > maxY) continue;
      if (pointInGeometry(point, info.feature.geometry)) { matched = info; break; }
    }
    if (!matched) return;

    const rec = ensureRecord(matched);
    const km = parseFloat(road.panjang_km) || 0;
    // genangan_terkini: 0 = sudah kering/pulih, 1 = masih tergenang/terputus
    const isPulih = road.genangan_terkini === '0' || road.genangan_terkini === 0;
    if (isPulih) { rec.pulihKm += km; rec.pulihCount += 1; }
    else { rec.terdampakKm += km; rec.terdampakCount += 1; }
  });

  return { byKey, byNoPrefix, byNoSpace };
}

const STATUS_COLORS = { kritis: '#D72E38', parah: '#F47B2F', sedang: '#FFD47D', pulih: '#168573' };

// ── STATUS PEMULIHAN VEGETASI / NDVI RECOVERY (Indikator R-1, mode 10) ──
// Rentang recovery rate 0–100% (nilai sumber sudah di-clamp ke 100% sejak
// tahap pengolahan GEE — lihat catatan keterbatasan metodologi K-4/6.2 tim
// data soal over-recovery yang tersembunyi). Threshold status memakai arah
// yang sama dengan Indikator R-5 (Bangunan, mode 8): makin rendah recovery
// rate, makin kritis.
const NDVI_LOW_COUNT_THRESHOLD = 1000; // di bawah ini, sampel piksel valid dianggap tipis (lihat K-2/K-3)

// ── SKALA WARNA RECOVERY INTENSITAS CAHAYA MALAM (Indikator R-2, mode 9) ──
// Acuan Tim Pengolah Data: rentang 0%-150%, gradasi bahaya -> pemulihan penuh
// Merah (#d32f2f) -> Jingga -> Kuning -> Hijau Muda -> Hijau Tua (#1b5e20).
// Nilai di atas 150% di-clamp ke hijau tua (pertumbuhan intensitas cahaya).
const NTL_MIN = 0;
const NTL_MAX = 150;
const NTL_STOPS = ['#d32f2f', '#f57c00', '#fdd835', '#7cb342', '#1b5e20'];
const NTL_NO_DATA_COLOR = '#64748b';

function getNtlColor(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return NTL_NO_DATA_COLOR;
  const t = Math.max(0, Math.min(1, (value - NTL_MIN) / (NTL_MAX - NTL_MIN)));
  const scaled = t * (NTL_STOPS.length - 1);
  const i = Math.min(Math.floor(scaled), NTL_STOPS.length - 2);
  return lerpColor(NTL_STOPS[i], NTL_STOPS[i + 1], scaled - i);
}

function getNtlStatusLabel(v) {
  if (v === null || v === undefined || !Number.isFinite(v)) return 'Tanpa Data';
  if (v < 75) return 'Redup / Belum Pulih';
  if (v < 100) return 'Mendekati Baseline';
  if (v < 150) return 'Melebihi Baseline';
  return 'Pertumbuhan Tinggi';
}
const STATUS_LABEL = { kritis: 'KRITIS', parah: 'PARAH', sedang: 'SEDANG', pulih: 'PULIH' };

// ── SKALA WARNA PETA GENANGAN (Indikator 3, mode 1-3) ──
// Puncak banjir = merah, Surut = oranye, Residual = biru. Tiap peta pakai 4
// kategori (Rendah/Sedang/Tinggi/Sangat Tinggi) dari breakpoint kuantil data.
const BUCKET_LABELS = ['Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
const PUNCAK_COLORS = ['#fee2e2', '#fca5a5', '#ef4444', '#991b1b'];
const SURUT_COLORS = ['#ffedd5', '#fdba74', '#fb923c', '#c2410c'];
const RESIDUAL_COLORS = ['#e6f0fa', '#99c2ec', '#4d94de', '#1a66b3'];
const NO_DATA_COLOR = '#cbd5e1';

// ── SKALA WARNA KELEMBABAN TANAH (Indikator R-6, mode 11-13) ──
// Disederhanakan jadi 2 kategori sesuai acuan visual Tim Pengolah Data:
// Normal (Z-Score <= 0) vs Kelembaban Tinggi (Z-Score > 0). Zona Kritis
// (mode 13 / Slide 5c) memakai ambang batas terpisah > 1.5 di atas kategori ini.
const KELEMBABAN_NORMAL_COLOR = '#f1f5f9';
const KELEMBABAN_TINGGI_COLOR = '#5b8fbf';
const KELEMBABAN_NO_DATA_COLOR = '#788392';
const KELEMBABAN_KRITIS_THRESHOLD = 1.5;

export default function MapComponent({ 
  currentMode = 0, 
  genanganData = [],
  kelembabanNovDesData = [],
  kelembabanAprData = [],
  roadsData = [],
  bangunanData = [],
  ntlData = [],
  ndviData = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const markerGroupRef = useRef(null);
  const roadGroupRef = useRef(null);

  const genanganByKeyRef = useRef(new Map());
  const genanganByNoPrefixRef = useRef(new Map());
  const genanganByNoSpaceRef = useRef(new Map());
  
  const kelembabanNovDesByKeyRef = useRef(new Map());
  const kelembabanNovDesByNoPrefixRef = useRef(new Map());
  const kelembabanNovDesByNoSpaceRef = useRef(new Map());
  const kelembabanAprByKeyRef = useRef(new Map());
  const kelembabanAprByNoPrefixRef = useRef(new Map());
  const kelembabanAprByNoSpaceRef = useRef(new Map());

  // Hasil agregasi panjang jalan (pulih/terdampak) per kabupaten/kota untuk popup Indikator 4
  const roadStatsByKeyRef = useRef(new Map());
  const roadStatsByNoPrefixRef = useRef(new Map());
  const roadStatsByNoSpaceRef = useRef(new Map());

  // Data Pemulihan Kondisi Bangunan (Indikator R-5), sudah diagregasi bulanan
  // di page.jsx (snapshot bulan terakhir per kab/kota) — dipakai mode 8
  const bangunanByKeyRef = useRef(new Map());
  const bangunanByNoPrefixRef = useRef(new Map());
  const bangunanByNoSpaceRef = useRef(new Map());
  // Data Pemulihan Intensitas Cahaya Malam (Indikator R-2), satu baris per kab/kota — dipakai mode 9
  const ntlByKeyRef = useRef(new Map());
  const ntlByNoPrefixRef = useRef(new Map());
  const ntlByNoSpaceRef = useRef(new Map());
  // Data Pemulihan Vegetasi / NDVI Recovery (Indikator R-1), satu baris per kab/kota — dipakai mode 10
  const ndviByKeyRef = useRef(new Map());
  const ndviByNoPrefixRef = useRef(new Map());
  const ndviByNoSpaceRef = useRef(new Map());

  // Simpan GeoJSON batas wilayah mentah (bukan cuma layer Leaflet) agar bisa dipakai untuk uji spasial
  const boundaryGeoJsonRef = useRef(null);

  const statsRef = useRef({
    puncakBreaks: [0, 0, 0],
    surutBreaks: [0, 0, 0],
    residualBreaks: [0, 0, 0],
  });
  
  const [dataReady, setDataReady] = useState(false);
  const [boundaryLoaded, setBoundaryLoaded] = useState(false);

  // Gaya poligon per kab/kota, disusun berurutan menaik berdasarkan nomor mode
  // (0-3: genangan, 5-10: jalan/bangunan/cahaya malam/vegetasi, 11-13: kelembaban tanah).
  const getStyleByMode = (feature, mode) => {
    const genRecord = findRecord(feature, genanganByKeyRef.current, genanganByNoPrefixRef.current, genanganByNoSpaceRef.current);

    // Mode 0 — Peta Surutnya Genangan (status kritis/parah/sedang/pulih)
    if (mode === 0) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: STATUS_COLORS[genRecord.status] || NO_DATA_COLOR, fillOpacity: 0.7 };
    }

    // Mode 1 — Peta Genangan Puncak Banjir (4 kategori, skala merah)
    if (mode === 1) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      const idx = getBucketIndex(genRecord.luas_puncak_ha, statsRef.current.puncakBreaks);
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: PUNCAK_COLORS[idx], fillOpacity: 0.78 };
    }

    // Mode 2 — Peta Genangan Surut (4 kategori, skala oranye)
    if (mode === 2) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      const idx = getBucketIndex(genRecord.surut_ha, statsRef.current.surutBreaks);
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: SURUT_COLORS[idx], fillOpacity: 0.78 };
    }

    // Mode 3 — Peta Genangan Residual (4 kategori, skala biru; 0 ha masuk kategori
    // "Rendah" seperti Peta Genangan Surut, bukan lagi transparan)
    if (mode === 3) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      const idx = getBucketIndex(genRecord.luas_terkini_ha, statsRef.current.residualBreaks);
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: RESIDUAL_COLORS[idx], fillOpacity: 0.78 };
    }

    // Mode 5-6 — Peta Risiko Longsor (poligon jadi outline netral; titik rawan
    // digambar terpisah lewat markerGroupRef di bawah)
    if (mode === 5 || mode === 6) {
      return { color: 'rgba(255, 255, 255, 0.3)', weight: 1, fillColor: 'transparent', fillOpacity: 0 };
    }

    // Mode 7 — Peta Pemulihan Akses Jalan (peta dasar digelapkan agar garis
    // jalan kontras, tapi tidak menutupi citra satelit sepenuhnya — lihat juga
    // bringToBack() di effect pemuatan GeoJSON supaya layer ini tetap di BAWAH
    // garis jalan/marker)
    if (mode === 7) {
      return { color: 'rgba(255, 255, 255, 0.15)', weight: 1, fillColor: '#0f172a', fillOpacity: 0.35 };
    }

    // Mode 8 — Peta Pemulihan Kondisi Bangunan
    if (mode === 8) {
      const record = findRecord(feature, bangunanByKeyRef.current, bangunanByNoPrefixRef.current, bangunanByNoSpaceRef.current);
      // Poin 3 acuan Tim Data: kab/kota tanpa data valid pada snapshot bulan
      // terakhir (tertutup awan / satelit tidak melintas) TIDAK dibuat transparan
      // atau hilang — tampil abu-abu semi-transparan agar jelas ini "tidak ada
      // data", bukan error sistem.
      if (!record || !record.hasData) {
        return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: '#94a3b8', fillOpacity: 0.35 };
      }
      return { color: 'rgba(255, 255, 255, 0.5)', weight: 1, fillColor: STATUS_COLORS[record.status] || NO_DATA_COLOR, fillOpacity: 0.78 };
    }

    // Mode 9 — Peta Intensitas Cahaya Malam
    if (mode === 9) {
      const record = findRecord(feature, ntlByKeyRef.current, ntlByNoPrefixRef.current, ntlByNoSpaceRef.current);
      // Kab/kota tanpa piksel NTL valid (mis. Padang Panjang, Pariaman) tidak
      // dihilangkan — tampil abu-abu gelap supaya terbaca sebagai "tanpa data",
      // bukan sebagai recovery 0%.
      if (!record || !record.hasData) {
        return { color: 'rgba(255, 255, 255, 0.25)', weight: 1, fillColor: NTL_NO_DATA_COLOR, fillOpacity: 0.4 };
      }
      return { color: 'rgba(255, 255, 255, 0.35)', weight: 1, fillColor: getNtlColor(record.recovery), fillOpacity: 0.82 };
    }

    // Mode 10 — Peta Pemulihan Vegetasi (NDVI Recovery)
    if (mode === 10) {
      const record = findRecord(feature, ndviByKeyRef.current, ndviByNoPrefixRef.current, ndviByNoSpaceRef.current);
      // Kab/kota tanpa piksel vegetasi valid (count = 0, mis. banyak kab/kota di
      // Sumbar & Sumut — lihat K-3/K-4) TIDAK dianggap "recovery 0%" (kritis),
      // melainkan ditandai abu-abu sebagai "tanpa data" agar tidak menyesatkan.
      if (!record || !record.hasData) {
        return { color: 'rgba(255, 255, 255, 0.25)', weight: 1, fillColor: '#94a3b8', fillOpacity: 0.35 };
      }
      return { color: 'rgba(255, 255, 255, 0.5)', weight: 1, fillColor: STATUS_COLORS[record.status] || NO_DATA_COLOR, fillOpacity: 0.78 };
    }

    // Mode 11-12 — Peta Kelembaban Tanah (5a: Nov-Des 2025, 5b: Jan-Mei 2026)
    if (mode === 11 || mode === 12) {
      const record = mode === 11
        ? findRecord(feature, kelembabanNovDesByKeyRef.current, kelembabanNovDesByNoPrefixRef.current, kelembabanNovDesByNoSpaceRef.current)
        : findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current, kelembabanAprByNoSpaceRef.current);

      // Kab/kota tanpa data valid ditandai abu-abu tegas (konsisten dengan
      // indikator lain seperti R1/R5) — SENGAJA dibedakan dari "Normal", supaya
      // tidak salah dibaca sebagai wilayah aman padahal datanya memang tidak ada.
      if (!record) return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: KELEMBABAN_NO_DATA_COLOR, fillOpacity: 0.7 };

      const isTinggi = record.mean > 0;
      return {
        color: 'rgba(255, 255, 255, 0.4)',
        weight: 1,
        fillColor: isTinggi ? KELEMBABAN_TINGGI_COLOR : KELEMBABAN_NORMAL_COLOR,
        fillOpacity: isTinggi ? 0.65 : 0.2,
      };
    }

    // Mode 13 — Peta Zona Kritis Kelembaban (5c: mode 12 difilter Z-Score > 1.5)
    if (mode === 13) {
      // Sengaja pakai data & pencocokan yang SAMA dengan mode 12, bukan sumber terpisah.
      const record = findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current, kelembabanAprByNoSpaceRef.current);

      // Tanpa data: abu-abu tegas (BUKAN transparan) — dibedakan dari wilayah yang
      // memang sudah dikonfirmasi normal/aman (transparan, sengaja disembunyikan
      // supaya peta fokus ke wilayah kritis saja).
      if (!record) return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: KELEMBABAN_NO_DATA_COLOR, fillOpacity: 0.4 };

      if (record.mean <= KELEMBABAN_KRITIS_THRESHOLD) {
        return { color: 'rgba(255, 255, 255, 0.25)', weight: 0.8, fillColor: 'transparent', fillOpacity: 0 };
      }
      return { color: 'rgba(255, 255, 255, 0.6)', weight: 1.2, fillColor: KELEMBABAN_TINGGI_COLOR, fillOpacity: 0.85 };
    }

    // Fallback netral untuk mode yang belum terdefinisi
    return { color: 'rgba(255, 255, 255, 0.3)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.2 };
  };

  const getTitleLabel = (mode) => {
    switch (mode) {
      case 0: return 'Peta Surutnya Genangan (%)';
      case 1: return 'Peta Genangan Puncak Banjir';
      case 2: return 'Peta Genangan Surut';
      case 3: return 'Peta Genangan Residual';
      case 5: return 'Peta Risiko Longsor (Nov–Des 2025)';
      case 6: return 'Peta Risiko Longsor (Jan-Mei 2026)';
      case 7: return 'Peta Pemulihan Akses Jalan';
      case 8: return 'Peta Pemulihan Kondisi Bangunan';
      case 9: return 'Peta Intensitas Cahaya Malam';
      case 10: return 'Peta Pemulihan Vegetasi (NDVI Recovery)';
      case 11: return 'Peta Kelembaban Tanah (Nov–Des 2025)';
      case 12: return 'Peta Kelembaban Tanah (Jan-Mei 2026)';
      case 13: return 'Peta Zona Kritis Kelembaban';
      default: return 'Peta Spasial Sumatera';
    }
  };

  const getTooltipContent = (feature, mode) => {
    const name = getRegionNameFromFeature(feature) || 'Wilayah';

    // Mode 0-3 — Peta Genangan (surut / puncak / surut ha / residual)
    if (mode >= 0 && mode <= 3) {
      const record = findRecord(feature, genanganByKeyRef.current, genanganByNoPrefixRef.current, genanganByNoSpaceRef.current);
      if (!record) return `<strong>${name}</strong><br/>Data genangan tidak tersedia`;

      if (mode === 0) return `<strong>${name}</strong><br/>Surut: <b>${record.surut_persen}%</b><br/>Status: <b>${STATUS_LABEL[record.status]}</b>`;
      if (mode === 1) {
        const kategori = BUCKET_LABELS[getBucketIndex(record.luas_puncak_ha, statsRef.current.puncakBreaks)];
        return `<strong>${name}</strong><br/>Genangan Puncak Banjir: <b>${record.luas_puncak_ha.toLocaleString('id-ID')} ha</b><br/>Kategori: <b>${kategori}</b>`;
      }
      if (mode === 2) {
        const kategori = BUCKET_LABELS[getBucketIndex(record.surut_ha, statsRef.current.surutBreaks)];
        return `<strong>${name}</strong><br/>Area Sudah Surut: <b>${record.surut_ha.toLocaleString('id-ID')} ha</b> (${record.surut_persen}%)<br/>Kategori: <b>${kategori}</b>`;
      }
      if (mode === 3) {
        const kategori = BUCKET_LABELS[getBucketIndex(record.luas_terkini_ha, statsRef.current.residualBreaks)];
        return `<strong>${name}</strong><br/>Genangan Residual: <b>${record.luas_terkini_ha.toLocaleString('id-ID')} ha</b><br/>Kategori: <b>${kategori}</b> (Rasio R-3: ${record.r3_persen}%)`;
      }
    }

    // Mode 5-6 — Peta Risiko Longsor
    if (mode === 5 || mode === 6) {
      const record = mode === 5
        ? findRecord(feature, kelembabanNovDesByKeyRef.current, kelembabanNovDesByNoPrefixRef.current, kelembabanNovDesByNoSpaceRef.current)
        : findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current, kelembabanAprByNoSpaceRef.current);

      if (!record) return `<strong>${name}</strong><br/>Data tidak tersedia`;
      const status = record.mean > 1.5 ? '<span style="color:#D72E38; font-weight:bold;">Sangat Jenuh (Rawan)</span>' : '<span style="color:#168573; font-weight:bold;">Aman</span>';

      return `<strong>${name}</strong><br/>Z-Score Tanah: <b>${record.mean.toFixed(2)}</b><br/>Kondisi Tanah: ${status}`;
    }

    // Mode 8 — Peta Pemulihan Kondisi Bangunan
    if (mode === 8) {
      const record = findRecord(feature, bangunanByKeyRef.current, bangunanByNoPrefixRef.current, bangunanByNoSpaceRef.current);
      // Poin 3 acuan Tim Data: tooltip menjelaskan bahwa kekosongan data adalah
      // keterbatasan citra satelit, bukan error sistem.
      if (!record || !record.hasData) {
        return `<strong>${name}</strong><br/><span style="color:#64748b;">Data Tertutup Awan / Satelit Tidak Melintas</span>`;
      }
      return `<strong>${name}</strong><br/>Pemulihan Bangunan (${record.bulanLabel}): <b>${record.persen}%</b><br/>Status: <b>${STATUS_LABEL[record.status]}</b>`;
    }

    // Mode 9 — Peta Intensitas Cahaya Malam
    if (mode === 9) {
      const record = findRecord(feature, ntlByKeyRef.current, ntlByNoPrefixRef.current, ntlByNoSpaceRef.current);
      if (!record || !record.hasData) {
        return `<strong>${name}</strong><br/><span style="color:#94a3b8;">Nilai NTL tidak tersedia untuk wilayah ini</span>`;
      }
      return `<strong>${name}</strong><br/>Recovery Cahaya Malam: <b>${record.recovery.toFixed(1).replace('.', ',')}%</b><br/>Status: <b>${getNtlStatusLabel(record.recovery)}</b>`;
    }

    // Mode 10 — Peta Pemulihan Vegetasi (NDVI Recovery)
    if (mode === 10) {
      const record = findRecord(feature, ndviByKeyRef.current, ndviByNoPrefixRef.current, ndviByNoSpaceRef.current);
      if (!record || !record.hasData) {
        return `<strong>${name}</strong><br/><span style="color:#94a3b8;">Tidak ada piksel vegetasi valid (tertutup awan / di bawah ambang batas)</span>`;
      }
      return `<strong>${name}</strong><br/>NDVI Recovery: <b>${record.mean.toFixed(1).replace('.', ',')}%</b><br/>Status: <b>${STATUS_LABEL[record.status]}</b>`;
    }

    // Mode 11-13 — Peta Kelembaban Tanah / Zona Kritis (mode 13 pakai data yang
    // sama dengan mode 12, sesuai acuan Tim Pengolah Data)
    if (mode === 11 || mode === 12 || mode === 13) {
      const record = mode === 11
        ? findRecord(feature, kelembabanNovDesByKeyRef.current, kelembabanNovDesByNoPrefixRef.current, kelembabanNovDesByNoSpaceRef.current)
        : findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current, kelembabanAprByNoSpaceRef.current);

      if (!record) return `<strong>${name}</strong><br/>Data tidak tersedia`;

      const statusText = record.mean > 0 ? 'Kelembaban Tinggi' : 'Normal';
      return `<strong>${name}</strong><br/>Z-Score (Anomali): <b>${record.mean.toFixed(2)}</b><br/>Status: <b>${statusText}</b>`;
    }

    return `<strong>${name}</strong><br/>Layer: ${getTitleLabel(mode)}`;
  };

  // Konten popup yang muncul saat kab/kota DIKLIK (beda dari tooltip yang muncul saat hover).
  // Khusus mode 7 (Indikator 4 - Jaringan Jalan) menampilkan rincian panjang jalan
  // pulih / tergenang-terputus / tidak terdampak untuk wilayah yang diklik.
  const getPopupContent = (feature, mode) => {
    const name = getRegionNameFromFeature(feature) || 'Wilayah';

    // ─── Mode 0 (Slide 1 — Peta 3 Provinsi Terdampak Bencana): popup klik
    // menampilkan status genangan (sesuai warna choropleth) DITAMBAH ringkasan
    // seluruh indikator pemulihan yang tersedia untuk wilayah tsb (R-1 s/d R-6),
    // supaya satu klik langsung memberi gambaran lintas-indikator, bukan cuma
    // satu angka. Tiap indikator yang datanya tidak tersedia ditandai eksplisit
    // "Tanpa data" alih-alih disembunyikan atau dianggap 0/kritis.
    if (mode === 0) {
      const gen = findRecord(feature, genanganByKeyRef.current, genanganByNoPrefixRef.current, genanganByNoSpaceRef.current);
      const road = findRecord(feature, roadStatsByKeyRef.current, roadStatsByNoPrefixRef.current, roadStatsByNoSpaceRef.current);
      const bangunan = findRecord(feature, bangunanByKeyRef.current, bangunanByNoPrefixRef.current, bangunanByNoSpaceRef.current);
      const ntl = findRecord(feature, ntlByKeyRef.current, ntlByNoPrefixRef.current, ntlByNoSpaceRef.current);
      const ndvi = findRecord(feature, ndviByKeyRef.current, ndviByNoPrefixRef.current, ndviByNoSpaceRef.current);
      const kelembaban = findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current, kelembabanAprByNoSpaceRef.current);

      // Nama provinsi diambil dari data indikator manapun yang tersedia lebih dulu
      // (tidak semua sumber data punya kolom provinsi yang konsisten).
      const provinsi = (ndvi && ndvi.provinsi) || (bangunan && bangunan.provinsi) || (ntl && ntl.provinsi) || (gen && gen.provinsi) || '';

      const roadTotal = road ? road.pulihKm + road.terdampakKm : 0;
      const roadPersen = road && roadTotal > 0 ? Math.round((road.pulihKm / roadTotal) * 100) : null;

      const row = (color, label, value, tersedia) => `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:3px 0;">
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
            <span style="color:#475569;">${label}</span>
          </div>
          <b style="color:${tersedia ? '#1a2332' : '#94a3b8'};font-weight:${tersedia ? '700' : '500'};">${value}</b>
        </div>`;

      const rows = [
        row('#168573', 'R-1 Vegetasi', ndvi && ndvi.hasData ? `${ndvi.mean.toFixed(1).replace('.', ',')}%` : 'Tanpa data', !!(ndvi && ndvi.hasData)),
        row('#1a2332', 'R-2 Cahaya Malam', ntl && ntl.hasData ? `${ntl.recovery.toFixed(1).replace('.', ',')}%` : 'Tanpa data', !!(ntl && ntl.hasData)),
        row('#5b8fbf', 'R-3 Residual', gen ? `${gen.r3_persen}%` : 'Tanpa data', !!gen),
        row('#f47b2f', 'R-4 Jalan', roadPersen !== null ? `${roadPersen}% pulih` : 'Tanpa data', roadPersen !== null),
        row('#d72e38', 'R-5 Bangunan', bangunan && bangunan.hasData ? `${bangunan.persen}%` : 'Tanpa data', !!(bangunan && bangunan.hasData)),
        row('#168573', 'R-6 Kelembaban', kelembaban ? (kelembaban.mean > 0 ? 'Tinggi' : 'Normal') : 'Tanpa data', !!kelembaban),
      ].join('');

      return `<div style="min-width:235px;font-size:12px;line-height:1.5;">
        <strong style="font-size:14px;color:#1a2332;">${name}</strong>
        ${provinsi ? `<div style="color:#94a3b8;font-size:10.5px;margin-top:1px;">${provinsi}</div>` : ''}
        <hr style="margin:7px 0;border-color:#e2e8f0;"/>
        ${gen
          ? `<div style="margin-bottom:5px;">Status Genangan: <b style="color:${STATUS_COLORS[gen.status] || '#64748b'};">${STATUS_LABEL[gen.status] || '-'}</b> <span style="color:#94a3b8;">(Surut ${gen.surut_persen}%)</span></div>`
          : `<div style="margin-bottom:5px;color:#94a3b8;">Data status genangan tidak tersedia</div>`}
        <hr style="margin:7px 0;border-color:#e2e8f0;"/>
        ${rows}
      </div>`;
    }

    if (mode === 7) {
      const rec = findRecord(feature, roadStatsByKeyRef.current, roadStatsByNoPrefixRef.current, roadStatsByNoSpaceRef.current);

      if (!rec) {
        return `<div style="min-width:200px;font-size:12px;line-height:1.5;">
          <strong style="font-size:13px;">${name}</strong><br/>
          <span style="color:#94a3b8;">Data jaringan jalan tidak tersedia untuk wilayah ini.</span>
        </div>`;
      }

      const pulih = rec.pulihKm;
      const terdampak = rec.terdampakKm;
      const total = pulih + terdampak;
      const persenPulih = total > 0 ? Math.round((pulih / total) * 100) : 0;

      // Catatan: sumber data (R4_*_Terputus.csv) hanya berisi ruas jalan yang PERNAH
      // tergenang saat puncak banjir (genangan_puncak = 1), dan hanya membedakan status
      // saat ini jadi 2 kelas lewat genangan_terkini (0 = pulih, 1 = masih tergenang/terputus).
      // Karena itu kategori "tergenang" dan "putus" digabung, dan "tidak terdampak" belum
      // bisa dihitung karena ruas jalan yang tidak pernah tergenang tidak ada di file ini.
      return `<div style="min-width:215px;font-size:12px;line-height:1.6;">
        <strong style="font-size:13px;">${name}</strong>
        <div style="margin-top:6px;">
          <div><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#168573;margin-right:6px;"></span>Pulih: <b>${pulih.toFixed(1)} km</b></div>
          <div><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#D72E38;margin-right:6px;"></span>Tergenang / Terputus: <b>${terdampak.toFixed(1)} km</b></div>
          <div><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#cbd5e1;margin-right:6px;"></span>Tidak Terdampak: <span style="color:#94a3b8;">data belum tersedia</span></div>
        </div>
        <hr style="margin:6px 0;border-color:#e2e8f0;"/>
        Total jalan terdampak: <b>${total.toFixed(1)} km</b> (${persenPulih}% pulih)
      </div>`;
    }

    // ─── Mode 9 (Indikator R-2): popup klik menampilkan rincian nilai recovery ───
    // Peta diwarnai berdasarkan recovery, dan popup memperlihatkan sebaran nilainya
    // dalam satu kab/kota (rata-rata, median, serta rentang min-max piksel).
    if (mode === 9) {
      const rec = findRecord(feature, ntlByKeyRef.current, ntlByNoPrefixRef.current, ntlByNoSpaceRef.current);

      if (!rec || !rec.hasData) {
        return `<div style="min-width:200px;font-size:12px;line-height:1.5;">
          <strong style="font-size:13px;">${name}</strong><br/>
          <span style="color:#94a3b8;">Tidak ada piksel cahaya malam yang valid pada komposit wilayah ini, sehingga nilai recovery belum bisa dihitung.</span>
        </div>`;
      }

      const fmt = (v) => (v === null || v === undefined ? '—' : `${v.toFixed(1).replace('.', ',')}%`);
      const warna = getNtlColor(rec.recovery);

      return `<div style="min-width:225px;font-size:12px;line-height:1.6;">
        <strong style="font-size:13px;">${name}</strong>
        <div style="margin-top:6px;display:flex;align-items:center;gap:7px;">
          <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${warna};"></span>
          <span>Recovery: <b style="font-size:13px;">${fmt(rec.recovery)}</b></span>
        </div>
        <div style="color:#475569;margin-top:2px;">Status: <b>${getNtlStatusLabel(rec.recovery)}</b></div>
        <hr style="margin:6px 0;border-color:#e2e8f0;"/>
        <div>Median: <b>${fmt(rec.median)}</b></div>
        <div>Rentang piksel: <b>${fmt(rec.min)} – ${fmt(rec.max)}</b></div>
        <div style="color:#94a3b8;font-size:10px;margin-top:5px;">100% = setara kondisi sebelum bencana</div>
      </div>`;
    }

    // ─── Mode 10 (Indikator R-1): popup klik menampilkan rincian NDVI Recovery ───
    // Mengikuti pola popup mode 9 (NTL): tampilkan mean, median, sebaran, DAN
    // jumlah piksel valid (count) supaya wilayah dengan sampel tipis (K-2/K-3)
    // terlihat jelas alih-alih ditampilkan seolah setara dengan data yang solid.
    if (mode === 10) {
      const rec = findRecord(feature, ndviByKeyRef.current, ndviByNoPrefixRef.current, ndviByNoSpaceRef.current);

      if (!rec || !rec.hasData) {
        return `<div style="min-width:210px;font-size:12px;line-height:1.5;">
          <strong style="font-size:13px;">${name}</strong><br/>
          <span style="color:#94a3b8;">Tidak ada piksel vegetasi valid yang lolos cloud masking / ambang batas vegetasi pada wilayah ini, sehingga NDVI Recovery belum bisa dihitung.</span>
        </div>`;
      }

      const fmt = (v) => (v === null || v === undefined ? '—' : `${v.toFixed(1).replace('.', ',')}%`);
      const warna = STATUS_COLORS[rec.status] || NO_DATA_COLOR;
      const sampelTipis = rec.count > 0 && rec.count < NDVI_LOW_COUNT_THRESHOLD;

      return `<div style="min-width:230px;font-size:12px;line-height:1.6;">
        <strong style="font-size:13px;">${name}</strong>
        <div style="margin-top:6px;display:flex;align-items:center;gap:7px;">
          <span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${warna};"></span>
          <span>NDVI Recovery: <b style="font-size:13px;">${fmt(rec.mean)}</b></span>
        </div>
        <div style="color:#475569;margin-top:2px;">Status: <b>${STATUS_LABEL[rec.status]}</b></div>
        <hr style="margin:6px 0;border-color:#e2e8f0;"/>
        <div>Median: <b>${fmt(rec.median)}</b></div>
        <div>Rentang P10–P90: <b>${fmt(rec.p10)} – ${fmt(rec.p90)}</b></div>
        <div>Piksel valid: <b>${rec.count.toLocaleString('id-ID')}</b></div>
        ${sampelTipis ? '<div style="color:#F47B2F;font-size:10px;margin-top:5px;">⚠ Sampel piksel relatif tipis — interpretasi perlu hati-hati.</div>' : ''}
        <div style="color:#94a3b8;font-size:10px;margin-top:5px;">100% = setara kondisi vegetasi sebelum bencana (nilai di-clamp 0–100%)</div>
      </div>`;
    }

    // Mode lain: popup klik menampilkan info yang sama dengan tooltip hover
    return getTooltipContent(feature, mode);
  };

  useEffect(() => {
    const populateMaps = (dataArray, keyRef, noPrefixRef, noSpaceRef) => {
      const byKey = new Map(); const byNoPrefix = new Map(); const byNoSpace = new Map();
      if(dataArray) {
        dataArray.forEach(row => {
          if (row.kabupaten_key) byKey.set(row.kabupaten_key, row);
          if (row.kabupaten_key_noprefix) byNoPrefix.set(row.kabupaten_key_noprefix, row);
          if (row.kabupaten_key_nospace) byNoSpace.set(row.kabupaten_key_nospace, row);
        });
      }
      keyRef.current = byKey; noPrefixRef.current = byNoPrefix; if (noSpaceRef) noSpaceRef.current = byNoSpace;
    };

    if (genanganData || kelembabanNovDesData) {
      populateMaps(genanganData, genanganByKeyRef, genanganByNoPrefixRef, genanganByNoSpaceRef);
      populateMaps(kelembabanNovDesData, kelembabanNovDesByKeyRef, kelembabanNovDesByNoPrefixRef, kelembabanNovDesByNoSpaceRef);
      populateMaps(kelembabanAprData, kelembabanAprByKeyRef, kelembabanAprByNoPrefixRef, kelembabanAprByNoSpaceRef);
      populateMaps(bangunanData, bangunanByKeyRef, bangunanByNoPrefixRef, bangunanByNoSpaceRef);
      populateMaps(ntlData, ntlByKeyRef, ntlByNoPrefixRef, ntlByNoSpaceRef);
      populateMaps(ndviData, ndviByKeyRef, ndviByNoPrefixRef, ndviByNoSpaceRef);
      
      statsRef.current = {
        puncakBreaks: quantileBreaks(genanganData.map((r) => r.luas_puncak_ha), 4, false),
        surutBreaks: quantileBreaks(genanganData.map((r) => r.surut_ha), 4, false),
        residualBreaks: quantileBreaks(genanganData.map((r) => r.luas_terkini_ha), 4, false),
      };
      
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.eachLayer((lyr) => {
          lyr.setStyle(getStyleByMode(lyr.feature, currentMode));
          if (lyr.getTooltip()) lyr.setTooltipContent(getTooltipContent(lyr.feature, currentMode));
          if (lyr.getPopup()) lyr.setPopupContent(getPopupContent(lyr.feature, currentMode));
        });
      }
      setDataReady(true);
    }
  }, [genanganData, kelembabanNovDesData, kelembabanAprData, bangunanData, ntlData, ndviData, currentMode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    const map = L.map(mapContainerRef.current, { center: [2.8, 97.8], zoom: 6.5, zoomControl: false });
    mapInstanceRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri',
    }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    roadGroupRef.current = L.layerGroup().addTo(map);

    fetch('/module-8/batas_wilayah_3_provinsi.geojson')
      .then((res) => res.json())
      .then((data) => {
        boundaryGeoJsonRef.current = data;
        if (isMounted && mapInstanceRef.current && mapInstanceRef.current._panes) {
          geoJsonLayerRef.current = L.geoJSON(data, {
            style: (feature) => getStyleByMode(feature, currentMode),
            onEachFeature: (feature, lyr) => {
              lyr.bindTooltip(getTooltipContent(feature, currentMode), { sticky: true, direction: 'top' });
              // Popup muncul saat wilayah DIKLIK (default Leaflet untuk layer dg bindPopup).
              // Isinya disinkronkan ulang tiap kali currentMode / data jalan berubah.
              lyr.bindPopup(getPopupContent(feature, currentMode), { maxWidth: 260 });
            },
          }).addTo(mapInstanceRef.current);
          // Poligon batas wilayah dimuat belakangan (setelah fetch), jadi secara default
          // Leaflet menaruhnya PALING ATAS — menutupi garis jalan & marker yang sudah
          // digambar lebih dulu di roadGroupRef/markerGroupRef. Paksa ke belakang supaya
          // jalan & marker selalu tampil di atas fill poligon (ini yang bikin peta mode
          // jalan terlihat gelap total dan jalan di Sumut/Sumbar seolah tidak ada).
          geoJsonLayerRef.current.bringToBack();
          setBoundaryLoaded(true);
        }
      })
      .catch((err) => console.error('Gagal memuat GeoJSON:', err));

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataReady]);

  // Hitung ulang agregasi panjang jalan per kabupaten/kota setiap kali roadsData
  // atau batas wilayah (boundary) berubah/siap, lalu segarkan isi popup yg sudah terpasang.
  useEffect(() => {
    if (!boundaryLoaded || !boundaryGeoJsonRef.current) return;
    if (!roadsData || roadsData.length === 0) return;

    const { byKey, byNoPrefix, byNoSpace } = aggregateRoadsByKabupaten(roadsData, boundaryGeoJsonRef.current.features);
    roadStatsByKeyRef.current = byKey;
    roadStatsByNoPrefixRef.current = byNoPrefix;
    roadStatsByNoSpaceRef.current = byNoSpace;

    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.eachLayer((lyr) => {
        if (lyr.getPopup()) lyr.setPopupContent(getPopupContent(lyr.feature, currentMode));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadsData, boundaryLoaded]);

  useEffect(() => {
    if (geoJsonLayerRef.current && mapInstanceRef.current) {
      geoJsonLayerRef.current.eachLayer((lyr) => {
        lyr.setStyle(getStyleByMode(lyr.feature, currentMode));
        if (lyr.getTooltip()) lyr.setTooltipContent(getTooltipContent(lyr.feature, currentMode));
        if (lyr.getPopup()) lyr.setPopupContent(getPopupContent(lyr.feature, currentMode));
      });
    }

    if (markerGroupRef.current && roadGroupRef.current && mapInstanceRef.current) {
      markerGroupRef.current.clearLayers();
      roadGroupRef.current.clearLayers();

      // ─── TITIK RISIKO LONGSOR: centroid tiap kabupaten/kota dgn Z-Score > 1.5 ───
      // Data yang tersedia levelnya per kabupaten/kota (bukan titik presisi hasil
      // masking piksel), jadi titik yang digambar adalah centroid poligon kabupaten/kota
      // yang memenuhi kriteria "sangat jenuh" (Z-Score > 1.5). Sengaja TANPA bindTooltip —
      // detail z-score sudah tersedia lewat tooltip poligonnya.
      if ((currentMode === 5 || currentMode === 6) && geoJsonLayerRef.current) {
        const byKey = currentMode === 5 ? kelembabanNovDesByKeyRef.current : kelembabanAprByKeyRef.current;
        const byNoPrefix = currentMode === 5 ? kelembabanNovDesByNoPrefixRef.current : kelembabanAprByNoPrefixRef.current;
        const byNoSpace = currentMode === 5 ? kelembabanNovDesByNoSpaceRef.current : kelembabanAprByNoSpaceRef.current;

        geoJsonLayerRef.current.eachLayer((lyr) => {
          const record = findRecord(lyr.feature, byKey, byNoPrefix, byNoSpace);
          if (record && record.mean > 1.5) {
            const center = lyr.getBounds().getCenter();
            L.circleMarker(center, {
              radius: 7, fillColor: '#D72E38', color: '#ffffff', weight: 1.5, fillOpacity: 0.85
            }).addTo(markerGroupRef.current);
          }
        });
      }
      
      // ─── RENDER DATA ASLI JALAN TERPUTUS/TERGENANG/PULIH ───
      if (currentMode === 7) {
        if (roadsData && roadsData.length > 0) {
          roadsData.forEach((road) => {
            if (!road.geometry || !road.geometry.coordinates) return;

            // genangan_terkini: 0 berarti sudah kering (Pulih), 1 berarti masih Tergenang/Terputus
            const isPulih = road.genangan_terkini === "0" || road.genangan_terkini === 0;
            const color = isPulih ? '#168573' : '#D72E38'; 
            const statusText = isPulih ? 'Pulih' : 'Terputus / Masih Tergenang';
            const roadName = road.name || '(Tidak Ada Nama)';
            
            // Format GeoJSON membalikan array [lon, lat], sedangkan Leaflet butuh [lat, lon]
            if (road.geometry.type === 'LineString') {
              const latlngs = road.geometry.coordinates.map(c => [c[1], c[0]]);
              L.polyline(latlngs, { color, weight: 3.5, opacity: 0.9 })
               .bindTooltip(`<strong>${roadName}</strong><br/>Tipe: ${road.fclass}<br/>Panjang: ${parseFloat(road.panjang_km).toFixed(2)} km<br/>Status: <b>${statusText}</b>`)
               .addTo(roadGroupRef.current);
            } else if (road.geometry.type === 'MultiLineString') {
              const latlngs = road.geometry.coordinates.map(segment => segment.map(c => [c[1], c[0]]));
              L.polyline(latlngs, { color, weight: 3.5, opacity: 0.9 })
               .bindTooltip(`<strong>${roadName}</strong><br/>Tipe: ${road.fclass}<br/>Panjang: ${parseFloat(road.panjang_km).toFixed(2)} km<br/>Status: <b>${statusText}</b>`)
               .addTo(roadGroupRef.current);
            }
          });
        }
      }

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, dataReady, genanganData, kelembabanNovDesData, kelembabanAprData, roadsData]);

  return (
    <div className="w-full h-full relative text-slate-800">
      {/* Mode 9 (Intensitas Cahaya Malam) memakai basemap versi gelap agar sesuai
          tema NTL. Peredupan diterapkan sebagai filter CSS pada TILE PANE saja,
          bukan overlay di atas peta, supaya warna poligon recovery tetap utuh. */}
      <style>{`
        .mod8-night-map .leaflet-tile-pane {
          filter: brightness(0.32) saturate(0.55) contrast(1.05);
        }
      `}</style>
      <div ref={mapContainerRef} className={`w-full h-full z-0 ${currentMode === 9 ? 'mod8-night-map' : ''}`} />

      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-700">{getTitleLabel(currentMode)}</span>
      </div>

      {/* Legenda, disusun berurutan menaik berdasarkan nomor mode (lihat getStyleByMode) */}
      {currentMode === 0 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[150px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" /><span>Kritis (&gt;75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F47B2F] block" /><span>Parah (50-75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD47D] block" /><span>Sedang (25-50%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Pulih (&lt;25%)</span></div>
          <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200">Klik kab/kota untuk rincian semua indikator</div>
        </div>
      ) : currentMode === 1 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Luas Genangan Puncak (ha)</span>
          {PUNCAK_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c }} /><span>{BUCKET_LABELS[i]}</span>
            </div>
          ))}
        </div>
      ) : currentMode === 2 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Luas Genangan Surut (ha)</span>
          {SURUT_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c }} /><span>{BUCKET_LABELS[i]}</span>
            </div>
          ))}
        </div>
      ) : currentMode === 3 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Luas Residual (ha)</span>
          {RESIDUAL_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c }} /><span>{BUCKET_LABELS[i]}</span>
            </div>
          ))}
        </div>
      ) : currentMode === 5 || currentMode === 6 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[150px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] border border-white block" />
            <span>Risiko Longsor Tinggi</span>
          </div>
        </div>
      ) : currentMode === 7 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[150px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#168573] block rounded-full" /><span>Pulih</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#D72E38] block rounded-full" /><span>Masih Terputus / Tergenang</span></div>
          <div className="text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200">Klik kab/kota untuk rincian panjang jalan</div>
        </div>
      ) : currentMode === 8 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[150px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">% Pemulihan Bangunan</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Pulih (&ge;75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD47D] block" /><span>Sedang (50-75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F47B2F] block" /><span>Parah (25-50%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" /><span>Kritis (&lt;25%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: '#94a3b8', opacity: 0.6 }} /><span>Tertutup Awan / Tanpa Data</span>
          </div>
        </div>
      ) : currentMode === 9 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[190px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">% Pemulihan Cahaya Malam</span>
          <div className="w-full h-2.5 rounded-full" style={{ background: `linear-gradient(90deg, ${NTL_STOPS.join(', ')})` }} />
          <div className="flex justify-between text-[10px] font-medium text-slate-500">
            <span>0%</span><span>75%</span><span>&ge;150%</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: NTL_NO_DATA_COLOR, opacity: 0.6 }} /><span>Tanpa Data NTL</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Klik kab/kota untuk nilai recovery</div>
        </div>
      ) : currentMode === 10 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[160px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Status NDVI Recovery</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" /><span>Kritis (&lt;25%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F47B2F] block" /><span>Parah (25-50%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD47D] block" /><span>Sedang (50-75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Pulih (&ge;75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: '#94a3b8', opacity: 0.6 }} /><span>Tanpa Data Valid</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Klik kab/kota untuk rincian & jumlah sampel</div>
        </div>
      ) : currentMode === 11 || currentMode === 12 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[150px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Kelembaban Tanah</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full block bg-[#f1f5f9] border border-slate-300" /><span>Normal</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full block bg-[#5b8fbf]" /><span>Kelembaban Tinggi</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: '#94a3b8', opacity: 0.6 }} /><span>Tanpa Data</span>
          </div>
        </div>
      ) : currentMode === 13 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[150px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Zona Kritis Kelembaban</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full block bg-[#5b8fbf]" /><span>Kelembaban Tinggi (Z-Score &gt; 1.5)</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-300 block" /><span>Normal / Tidak Ditampilkan</span>
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: '#94a3b8', opacity: 0.6 }} /><span>Tanpa Data</span>
          </div>
        </div>
      ) : null}

      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 w-10 h-10 rounded-full shadow-md flex flex-col items-center justify-center font-bold text-slate-800">
        <span className="text-[10px] leading-none mb-[-2px] text-[#F47B2F] font-mono">^</span>
        <span className="text-xs leading-none">U</span>
      </div>
    </div>
  );
}