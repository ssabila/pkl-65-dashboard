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

function findRecord(feature, byKey, byNoPrefix) {
  const raw = getRegionNameFromFeature(feature);
  const norm = normalizeName(raw);
  const noPrefix = stripPrefix(norm);

  let rec = byKey.get(norm) || byNoPrefix.get(noPrefix) || byKey.get(noPrefix) || byNoPrefix.get(norm);
  if (rec) return rec;

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

const STATUS_COLORS = { kritis: '#D72E38', parah: '#F47B2F', sedang: '#FFD47D', pulih: '#168573' };
const STATUS_LABEL = { kritis: 'KRITIS', parah: 'PARAH', sedang: 'SEDANG', pulih: 'PULIH' };

const PUNCAK_COLORS = ['#e6f0fa', '#99c2ec', '#4d94de', '#1a66b3'];
const RESIDUAL_COLORS = ['#fed7aa', '#fb923c', '#ea580c', '#9a3412'];
const NO_DATA_COLOR = '#cbd5e1';

export default function MapComponent({ 
  currentMode = 0, 
  genanganData = [],
  kelembabanNovDesData = [],
  kelembabanAprData = [],
  kelembabanKritisData = [],
  titikLongsorNovDes = [],
  titikLongsorApr = []
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const markerGroupRef = useRef(null);
  const roadGroupRef = useRef(null);

  const genanganByKeyRef = useRef(new Map());
  const genanganByNoPrefixRef = useRef(new Map());
  
  const kelembabanNovDesByKeyRef = useRef(new Map());
  const kelembabanNovDesByNoPrefixRef = useRef(new Map());
  const kelembabanAprByKeyRef = useRef(new Map());
  const kelembabanAprByNoPrefixRef = useRef(new Map());
  const kelembabanKritisByKeyRef = useRef(new Map());
  const kelembabanKritisByNoPrefixRef = useRef(new Map());

  const statsRef = useRef({ 
    puncakBreaks: [0, 0, 0], 
    residualBreaks: [0, 0, 0]
  });
  
  const [dataReady, setDataReady] = useState(false);

  const getStyleByMode = (feature, mode) => {
    const name = feature.properties.NAME_2 || feature.properties.KABKOT || '';
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const genRecord = findRecord(feature, genanganByKeyRef.current, genanganByNoPrefixRef.current);

    if (mode === 0) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: STATUS_COLORS[genRecord.status] || NO_DATA_COLOR, fillOpacity: 0.7 };
    }

    if (mode === 1) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      const idx = getBucketIndex(genRecord.luas_puncak_ha, statsRef.current.puncakBreaks);
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: PUNCAK_COLORS[idx], fillOpacity: 0.78 };
    }

    if (mode === 2) {
      if (!genRecord) return { color: 'rgba(255,255,255,0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      const t = Math.max(0, Math.min(1, genRecord.surut_persen / 100));
      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: lerpColor('#e0f2ee', '#168573', t), fillOpacity: 0.15 + t * 0.65 };
    }

    if (mode === 3) {
      if (!genRecord || genRecord.luas_terkini_ha <= 0) {
        return { color: 'rgba(255, 255, 255, 0.25)', weight: 0.8, fillColor: 'transparent', fillOpacity: 0 };
      }
      const idx = getBucketIndex(genRecord.luas_terkini_ha, statsRef.current.residualBreaks);
      return { color: 'rgba(255, 255, 255, 0.6)', weight: 1.2, fillColor: RESIDUAL_COLORS[idx], fillOpacity: 0.85 };
    }

    if (mode === 11 || mode === 12) {
      const record = mode === 11 
        ? findRecord(feature, kelembabanNovDesByKeyRef.current, kelembabanNovDesByNoPrefixRef.current)
        : findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current);

      if (!record) return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: NO_DATA_COLOR, fillOpacity: 0.25 };
      
      let color = '#f1f5f9'; 
      if (record.mean > 1.5) color = '#D72E38'; 
      else if (record.mean > 0.75) color = '#1a66b3'; 
      else if (record.mean > 0) color = '#99c2ec'; 

      return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: color, fillOpacity: 0.75 };
    }

    if (mode === 13) {
      const record = findRecord(feature, kelembabanKritisByKeyRef.current, kelembabanKritisByNoPrefixRef.current);
      if (!record || record.mean <= 1.5) {
        return { color: 'rgba(255, 255, 255, 0.25)', weight: 0.8, fillColor: 'transparent', fillOpacity: 0 };
      }
      return { color: 'rgba(255, 255, 255, 0.6)', weight: 1.2, fillColor: '#D72E38', fillOpacity: 0.85 };
    }

    // SLIDE 6: Peta Risiko Longsor (Poligon dasar transparan, fokus pada titik merah GEE)
    if (mode === 5 || mode === 6) {
      return { color: 'rgba(255, 255, 255, 0.25)', weight: 1, fillColor: '#168573', fillOpacity: 0.08 };
    }

    if (mode === 9) {
      return { color: 'rgba(255, 255, 255, 0.15)', weight: 1, fillColor: '#0f172a', fillOpacity: 0.85 };
    }

    if (mode === 10) {
      const ndviIdx = hash % 4;
      const colorsNdvi = ['#D72E38', '#F47B2F', '#FFD47D', '#168573'];
      return { color: 'rgba(255, 255, 255, 0.5)', weight: 1, fillColor: colorsNdvi[ndviIdx], fillOpacity: 0.65 };
    }

    const statusIdx = hash % 4;
    const colorsChoropleth = ['#D72E38', '#F47B2F', '#FFD47D', '#168573'];
    return { color: 'rgba(255, 255, 255, 0.4)', weight: 1, fillColor: colorsChoropleth[statusIdx], fillOpacity: 0.65 };
  };

  const getTitleLabel = (mode) => {
    switch (mode) {
      case 0: return 'Peta Surutnya Genangan (%)';
      case 1: return 'Peta Genangan Puncak Banjir';
      case 2: return 'Peta Genangan Surut';
      case 3: return 'Peta Genangan Residual';
      case 11: return 'Peta Kelembaban Tanah (Nov–Des 2025)';
      case 12: return 'Peta Kelembaban Tanah (April 2026)';
      case 13: return 'Peta Zona Kritis Kelembaban';
      case 5: return 'Peta Risiko Longsor (Nov–Des 2025)';
      case 6: return 'Peta Risiko Longsor (April 2026)';
      case 7: return 'Peta Pemulihan Akses Jalan';
      case 8: return 'Peta Pemulihan Kondisi Bangunan';
      case 9: return 'Peta Intensitas Cahaya Malam';
      case 10: return 'NDVI RECOVERY';
      default: return 'Peta Spasial Sumatera';
    }
  };

  const getTooltipContent = (feature, mode) => {
    const name = getRegionNameFromFeature(feature) || 'Wilayah';
    
    if (mode >= 0 && mode <= 3) {
      const record = findRecord(feature, genanganByKeyRef.current, genanganByNoPrefixRef.current);
      if (!record) return `<strong>${name}</strong><br/>Data genangan tidak tersedia`;
      
      if (mode === 0) return `<strong>${name}</strong><br/>Surut: <b>${record.surut_persen}%</b><br/>Status: <b>${STATUS_LABEL[record.status]}</b>`;
      if (mode === 1) return `<strong>${name}</strong><br/>Genangan Puncak Banjir: <b>${record.luas_puncak_ha.toLocaleString('id-ID')} ha</b>`;
      if (mode === 2) return `<strong>${name}</strong><br/>Area Sudah Surut: <b>${record.surut_ha.toLocaleString('id-ID')} ha</b> (${record.surut_persen}%)`;
      if (mode === 3) {
        if (record.luas_terkini_ha > 0) return `<strong>${name}</strong><br/>Genangan Residual: <b>${record.luas_terkini_ha.toLocaleString('id-ID')} ha</b><br/>Rasio R-3: <b>${record.r3_persen}%</b>`;
        return `<strong>${name}</strong><br/>Genangan Residual: <b>0 ha (Bebas Genangan)</b>`;
      }
    }

    if (mode === 11 || mode === 12 || mode === 13) {
      let record;
      if (mode === 11) record = findRecord(feature, kelembabanNovDesByKeyRef.current, kelembabanNovDesByNoPrefixRef.current);
      else if (mode === 12) record = findRecord(feature, kelembabanAprByKeyRef.current, kelembabanAprByNoPrefixRef.current);
      else if (mode === 13) record = findRecord(feature, kelembabanKritisByKeyRef.current, kelembabanKritisByNoPrefixRef.current);

      if (!record) return `<strong>${name}</strong><br/>Data tidak tersedia`;
      
      let statusText = 'Normal';
      if (record.mean > 1.5) statusText = 'Kritis (Sangat Jenuh)';
      else if (record.mean > 0.75) statusText = 'Jenuh';
      else if (record.mean > 0) statusText = 'Jenuh Ringan';

      return `<strong>${name}</strong><br/>Z-Score (Anomali): <b>${record.mean.toFixed(2)}</b><br/>Status: <b>${statusText}</b>`;
    }

    if (mode === 5 || mode === 6) {
      return `<strong>${name}</strong><br/>Analisis Risiko Longsor Berbasis Lereng & Kejenuhan Tanah`;
    }

    return `<strong>${name}</strong><br/>Layer: ${getTitleLabel(mode)}`;
  };

  useEffect(() => {
    const populateMaps = (dataArray, keyRef, noPrefixRef) => {
      const byKey = new Map(); const byNoPrefix = new Map();
      if(dataArray) {
        dataArray.forEach(row => {
          if (row.kabupaten_key) byKey.set(row.kabupaten_key, row);
          if (row.kabupaten_key_noprefix) byNoPrefix.set(row.kabupaten_key_noprefix, row);
        });
      }
      keyRef.current = byKey; noPrefixRef.current = byNoPrefix;
    };

    if (genanganData || kelembabanNovDesData) {
      populateMaps(genanganData, genanganByKeyRef, genanganByNoPrefixRef);
      populateMaps(kelembabanNovDesData, kelembabanNovDesByKeyRef, kelembabanNovDesByNoPrefixRef);
      populateMaps(kelembabanAprData, kelembabanAprByKeyRef, kelembabanAprByNoPrefixRef);
      populateMaps(kelembabanKritisData, kelembabanKritisByKeyRef, kelembabanKritisByNoPrefixRef);
      
      statsRef.current = { 
        puncakBreaks: quantileBreaks(genanganData.map((r) => r.luas_puncak_ha), 4, false),
        residualBreaks: quantileBreaks(genanganData.map((r) => r.luas_terkini_ha), 4, true)
      };
      
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.eachLayer((lyr) => {
          lyr.setStyle(getStyleByMode(lyr.feature, currentMode));
          if (lyr.getTooltip()) lyr.setTooltipContent(getTooltipContent(lyr.feature, currentMode));
        });
      }
      setDataReady(true);
    }
  }, [genanganData, kelembabanNovDesData, kelembabanAprData, kelembabanKritisData, currentMode]);

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
        if (isMounted && mapInstanceRef.current && mapInstanceRef.current._panes) {
          geoJsonLayerRef.current = L.geoJSON(data, {
            style: (feature) => getStyleByMode(feature, currentMode),
            onEachFeature: (feature, lyr) => {
              lyr.bindTooltip(getTooltipContent(feature, currentMode), { sticky: true, direction: 'top' });
            },
          }).addTo(mapInstanceRef.current);
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

  useEffect(() => {
    if (geoJsonLayerRef.current && mapInstanceRef.current) {
      geoJsonLayerRef.current.eachLayer((lyr) => {
        lyr.setStyle(getStyleByMode(lyr.feature, currentMode));
        if (lyr.getTooltip()) lyr.setTooltipContent(getTooltipContent(lyr.feature, currentMode));
      });
    }

    if (markerGroupRef.current && roadGroupRef.current && mapInstanceRef.current) {
      markerGroupRef.current.clearLayers();
      roadGroupRef.current.clearLayers();

      // RENDER TITIK LONGSOR ASLI JIKA FILE CSV SUDAH ADA DI FOLDER PUBLIC
      if (currentMode === 5 && titikLongsorNovDes.length > 0) {
        titikLongsorNovDes.forEach((pt) => {
          L.circleMarker([pt.lat, pt.lon], { radius: 2.5, fillColor: '#D72E38', color: '#ffffff', weight: 0.5, fillOpacity: 0.85 }).addTo(markerGroupRef.current);
        });
      }
      if (currentMode === 6 && titikLongsorApr.length > 0) {
        titikLongsorApr.forEach((pt) => {
          L.circleMarker([pt.lat, pt.lon], { radius: 2.5, fillColor: '#D72E38', color: '#ffffff', weight: 0.5, fillOpacity: 0.85 }).addTo(markerGroupRef.current);
        });
      }
      
      if (currentMode === 7) {
        const roadSegments = [
          { coords: [[5.5, 95.3], [4.5, 96.2], [3.5, 97.2]], color: '#168573' },
          { coords: [[3.5, 97.2], [3.0, 97.7]], color: '#D72E38' },
          { coords: [[3.0, 97.7], [2.5, 98.2], [1.5, 99.0]], color: '#168573' },
          { coords: [[1.5, 99.0], [1.0, 99.4]], color: '#F47B2F' },
          { coords: [[1.0, 99.4], [-0.5, 100.4], [-1.5, 101.0]], color: '#168573' },
        ];
        roadSegments.forEach((seg) => L.polyline(seg.coords, { color: seg.color, weight: 3.5, opacity: 0.95 }).addTo(roadGroupRef.current));
      }

      if (currentMode === 9) {
        const nightPoints = [
          { coords: [5.55, 95.32], color: '#168573', r: 8, label: 'Banda Aceh (118%)' },
          { coords: [5.89, 95.32], color: '#168573', r: 7, label: 'Sabang (126%)' },
          { coords: [5.18, 97.14], color: '#ffd47d', r: 6, label: 'Lhokseumawe (86%)' },
          { coords: [5.03, 97.32], color: '#d72e38', r: 5, label: 'Aceh Utara (68%)' },
          { coords: [4.28, 98.05], color: '#f47b2f', r: 5, label: 'Aceh Tamiang (72%)' },
          { coords: [3.59, 98.67], color: '#168573', r: 9, label: 'Medan (116%)' },
          { coords: [2.96, 99.06], color: '#168573', r: 6, label: 'Pematangsiantar (102%)' },
          { coords: [-0.95, 100.35], color: '#168573', r: 8, label: 'Padang (114%)' },
          { coords: [-0.30, 100.37], color: '#168573', r: 7, label: 'Bukittinggi (107%)' },
          { coords: [-0.22, 100.63], color: '#168573', r: 6, label: 'Payakumbuh (101%)' },
          { coords: [-0.25, 99.98], color: '#d72e38', r: 5, label: 'Agam (65%)' },
        ];
        nightPoints.forEach((pt) => {
          L.circleMarker(pt.coords, {
            radius: pt.r, fillColor: pt.color, color: '#ffffff', weight: 1.2, fillOpacity: 0.95
          }).bindTooltip(`<strong>${pt.label}</strong>`, { sticky: true }).addTo(markerGroupRef.current);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, dataReady, genanganData, kelembabanNovDesData, kelembabanAprData, kelembabanKritisData, titikLongsorNovDes, titikLongsorApr]);

  return (
    <div className="w-full h-full relative text-slate-800">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-700">{getTitleLabel(currentMode)}</span>
      </div>

      {currentMode === 10 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" /><span>Kritis</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F47B2F] block" /><span>Buruk</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD47D] block" /><span>Sedang</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Baik</span></div>
        </div>
      ) : currentMode === 9 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#d72e38] block" /><span>Redup</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#f47b2f] block" /><span>Mulai pulih</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#ffd47d] block" /><span>Mendekati normal</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Melebihi baseline</span></div>
        </div>
      ) : currentMode === 7 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#168573] block rounded-full" /><span>Pulih</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#F47B2F] block rounded-full" /><span>Tergenang</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#D72E38] block rounded-full" /><span>Terputus</span></div>
        </div>
      ) : currentMode === 5 || currentMode === 6 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[140px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Risiko Longsor</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" />
            <span>Titik Rawan (LERENG &gt; 15°)</span>
          </div>
        </div>
      ) : currentMode === 11 || currentMode === 12 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Z-Score Kelembaban</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full block bg-[#f1f5f9] border border-slate-300" /><span>Normal (≤ 0)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full block bg-[#99c2ec]" /><span>Jenuh Ringan</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full block bg-[#1a66b3]" /><span>Jenuh (≤ 1.5)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full block bg-[#D72E38]" /><span>Kritis (&gt; 1.5)</span></div>
        </div>
      ) : currentMode === 13 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Zona Kritis Longsor</span>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full block bg-[#D72E38]" /><span>Sangat Jenuh (&gt; 1.5)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200"><span className="w-2.5 h-2.5 rounded-full border border-slate-300 block" /><span>Normal / Aman</span></div>
        </div>
      ) : currentMode === 1 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Luas Genangan Puncak (ha)</span>
          {PUNCAK_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c }} /><span>{['Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'][i]}</span>
            </div>
          ))}
        </div>
      ) : currentMode === 2 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">% Area Sudah Surut</span>
          <div className="w-full h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #e0f2ee, #168573)' }} />
          <div className="flex justify-between text-[10px] font-medium text-slate-500"><span>Sedikit</span><span>Banyak</span></div>
        </div>
      ) : currentMode === 3 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[130px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Luas Residual (ha)</span>
          {RESIDUAL_COLORS.map((c, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full block" style={{ backgroundColor: c }} /><span>{['Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'][i]}</span>
            </div>
          ))}
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full border border-slate-300 block" /><span>0 ha (Bebas)</span>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" /><span>Kritis (&gt;75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F47B2F] block" /><span>Parah (50-75%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD47D] block" /><span>Sedang (25-50%)</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Pulih (&lt;25%)</span></div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 w-10 h-10 rounded-full shadow-md flex flex-col items-center justify-center font-bold text-slate-800">
        <span className="text-[10px] leading-none mb-[-2px] text-[#F47B2F] font-mono">^</span>
        <span className="text-xs leading-none">U</span>
      </div>
    </div>
  );
}