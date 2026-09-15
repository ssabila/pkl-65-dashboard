"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Normalisasi nama untuk pencocokan toleran
function normName(s) {
  return (s || "")
    .toUpperCase()
    .replace(/^KOTA\s+/, "")
    .replace(/^KABUPATEN\s+/, "")
    .replace(/[\s\-_]/g, "");
}

// --- Skema Pewarnaan Tiap Layer ---
function getErosiColor(nilai) {
  if (nilai > 130) return { fill: "#ef4444", label: "> 130 Sangat Tinggi" }; // Merah
  if (nilai > 65)  return { fill: "#f97316", label: "65–130 Tinggi" };        // Oranye
  if (nilai > 30)  return { fill: "#eab308", label: "30–65 Sedang" };         // Kuning
  if (nilai > 0)   return { fill: "#10b981", label: "< 30 Rendah" };          // Hijau
  return           { fill: "#64748b", label: "Tidak Ada Data" };
}

function getNdviColor(nilai) {
  if (nilai > 0.75) return { fill: "#15803d", label: "> 0.75 Lebat" };
  if (nilai > 0.60) return { fill: "#22c55e", label: "0.60–0.75 Sedang" };
  if (nilai > 0.40) return { fill: "#84cc16", label: "0.40–0.60 Jarang" };
  if (nilai > 0)    return { fill: "#facc15", label: "< 0.40 Sangat Jarang" };
  return             { fill: "#64748b", label: "Tidak Ada Data" };
}

function getSlopeColor(nilai) {
  if (nilai > 30) return { fill: "#b91c1c", label: "> 30° Sangat Curam" };
  if (nilai > 20) return { fill: "#ea580c", label: "20–30° Curam" };
  if (nilai > 10) return { fill: "#d97706", label: "10–20° Agak Curam" };
  if (nilai > 0)  return { fill: "#fde047", label: "< 10° Landai" };
  return           { fill: "#64748b", label: "Tidak Ada Data" };
}

function getElevasiColor(nilai) {
  if (nilai > 2500) return { fill: "#7e22ce", label: "> 2500 mdpl" };
  if (nilai > 1500) return { fill: "#dc2626", label: "1500–2500 mdpl" };
  if (nilai > 800)  return { fill: "#f97316", label: "800–1500 mdpl" };
  if (nilai > 200)  return { fill: "#eab308", label: "200–800 mdpl" };
  if (nilai > 0)    return { fill: "#10b981", label: "0–200 mdpl" };
  return             { fill: "#64748b", label: "Tidak Ada Data" };
}

function getColorByMode(mode, data) {
  if (!data) return { fill: "#475569", label: "Tidak Ada Data" };
  switch (mode) {
    case "erosi":   return getErosiColor(data.avgErosi);
    case "ndvi":    return getNdviColor(data.avgNdvi);
    case "slope":   return getSlopeColor(data.avgSlope);
    case "elevasi": return getElevasiColor(data.maxElev);
    default:        return getErosiColor(data.avgErosi);
  }
}

const MAP_MODES = [
  { id: "erosi",   label: "Laju Erosi",   icon: "🌊" },
  { id: "ndvi",    label: "Vegetasi NDVI",icon: "🌿" },
  { id: "slope",   label: "Kemiringan",   icon: "⛰️" },
  { id: "elevasi", label: "Elevasi",      icon: "📐" },
];

const LEGEND_ITEMS = {
  erosi: [
    { color: "#ef4444", label: "> 130 (Sangat Tinggi)" },
    { color: "#f97316", label: "65–130 (Tinggi)" },
    { color: "#eab308", label: "30–65 (Sedang)" },
    { color: "#10b981", label: "< 30 (Rendah)" },
    { color: "#475569", label: "Tidak Ada Data" },
  ],
  ndvi: [
    { color: "#15803d", label: "> 0.75 (Lebat)" },
    { color: "#22c55e", label: "0.60–0.75 (Sedang)" },
    { color: "#84cc16", label: "0.40–0.60 (Jarang)" },
    { color: "#facc15", label: "< 0.40 (Sangat Jarang)" },
    { color: "#475569", label: "Tidak Ada Data" },
  ],
  slope: [
    { color: "#b91c1c", label: "> 30° (Sangat Curam)" },
    { color: "#ea580c", label: "20–30° (Curam)" },
    { color: "#d97706", label: "10–20° (Agak Curam)" },
    { color: "#fde047", label: "< 10° (Landai)" },
    { color: "#475569", label: "Tidak Ada Data" },
  ],
  elevasi: [
    { color: "#7e22ce", label: "> 2500 mdpl" },
    { color: "#dc2626", label: "1500–2500 mdpl" },
    { color: "#f97316", label: "800–1500 mdpl" },
    { color: "#eab308", label: "200–800 mdpl" },
    { color: "#10b981", label: "0–200 mdpl" },
    { color: "#475569", label: "Tidak Ada Data" },
  ],
};

const BASEMAP_CONFIGS = {
  dark: {
    label: "🌑 Dark",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 18,
  },
  satellite: {
    label: "🛰️ Satelit",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 18,
  },
  osm: {
    label: "🗺️ Street",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    maxZoom: 19,
  },
};

export default function MapComponent({ rawData = [], selectedProvinsi = "Semua", selectedKabupaten = "Semua", onKabupatenClick, onReset }) {
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const tileLayerRef = useRef(null);
  const geoLayer = useRef(null);
  const geojsonData = useRef(null);

  const [activeMode, setActiveMode] = useState("erosi");
  const [activeBasemap, setActiveBasemap] = useState("dark");
  const [loaded, setLoaded] = useState(false);

  const selectedKab = selectedKabupaten === "Semua" ? null : selectedKabupaten;

  // Buat lookup teragregasi per kabupaten
  const kabLookup = useRef({});
  useEffect(() => {
    if (!rawData || rawData.length === 0) return;

    const lookup = {};
    rawData.forEach((d) => {
      const rawName = d.nm_kabupaten || "";
      const norm = normName(rawName);
      const upper = rawName.toUpperCase();

      const target = lookup[norm] || {
        nm_kabupaten: rawName,
        provinsi: d.provinsi,
        erosi: [],
        ndvi: [],
        slope: [],
        elevMax: [],
        count: 0,
      };

      target.erosi.push(d.model_rusle?.laju_erosi_ton_ha_thn || 0);
      target.ndvi.push(d.biofisik?.vegetasi_ndvi?.ndvi_mean_historis || 0);
      target.slope.push(d.biofisik?.topografi?.slope_mean_deg || 0);
      target.elevMax.push(d.biofisik?.elevasi?.max_mdpl || 0);
      target.count += 1;

      lookup[norm] = target;
      lookup[upper] = target; // fallback key
    });

    Object.values(lookup).forEach((v) => {
      const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
      const max = (arr) => (arr.length ? Math.max(...arr) : 0);
      v.avgErosi = avg(v.erosi);
      v.avgNdvi = avg(v.ndvi);
      v.avgSlope = avg(v.slope);
      v.maxElev = max(v.elevMax);
    });

    kabLookup.current = lookup;

    // Refresh styling polygon jika geojson sudah ter-mount
    if (geoLayer.current) {
      geoLayer.current.eachLayer((layer) => {
        applyFeatureStyle(layer, layer.feature);
      });
    }
  }, [rawData]);

  // Fungsi pewarnaan layer feature
  const applyFeatureStyle = (layer, feature) => {
    const rawName = feature.properties?.nmkab || feature.properties?.NAME_2 || "";
    const norm = normName(rawName);
    const kabData = kabLookup.current[norm] || kabLookup.current[rawName.toUpperCase()];
    const isSelected = selectedKab && norm === normName(selectedKab);
    const { fill } = getColorByMode(activeMode, kabData);

    layer.setStyle({
      fillColor: fill,
      fillOpacity: isSelected ? 0.9 : 0.72,
      color: isSelected ? "#facc15" : "#ffffff", // Amber color for highlight
      weight: isSelected ? 4 : 0.8,
      dashArray: "",
    });
  };

  // Inisialisasi Map
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;

    // Bounds Pulau Sumatera (Aceh, Sumut, Sumbar)
    const map = L.map(mapRef.current, {
      center: [2.5, 98.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false, // Prevents scroll trap on mobile
      maxBounds: [
        [-5.0, 93.0],
        [7.0, 105.0],
      ],
      minZoom: 5,
    });

    mapInst.current = map;

    // Pasang Basemap awal (Esri Dark Canvas)
    const baseCfg = BASEMAP_CONFIGS[activeBasemap];
    const tileLayer = L.tileLayer(baseCfg.url, {
      subdomains: baseCfg.subdomains,
      maxZoom: baseCfg.maxZoom,
      attribution: "© Esri / BPS",
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Zoom control di pojok kanan bawah
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Invalidate size setelah DOM siap
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    setLoaded(true);

    return () => {
      if (mapInst.current) {
        try {
          mapInst.current.remove();
        } catch {}
        mapInst.current = null;
      }
    };
  }, []);

  // Update Basemap Layer
  const handleChangeBasemap = (key) => {
    if (!mapInst.current || key === activeBasemap) return;
    const cfg = BASEMAP_CONFIGS[key];
    if (tileLayerRef.current) {
      mapInst.current.removeLayer(tileLayerRef.current);
    }
    const newTileLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
      attribution: "© Esri",
    }).addTo(mapInst.current);
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
    setActiveBasemap(key);
  };

  // Muat dan gambar Poligon GeoJSON
  useEffect(() => {
    if (!loaded || !mapInst.current) return;

    const loadGeoJSON = async () => {
      if (!geojsonData.current) {
        try {
          const res = await fetch("/module-8/batas_wilayah_3_provinsi.geojson");
          geojsonData.current = await res.json();
        } catch (e) {
          console.error("Gagal membaca geojson:", e);
          return;
        }
      }

      if (!geojsonData.current || !mapInst.current) return;

      // Hapus layer lama jika ada
      if (geoLayer.current) {
        try {
          mapInst.current.removeLayer(geoLayer.current);
        } catch {}
        geoLayer.current = null;
      }

      // Filter fitur berdasarkan provinsi jika dipilih
      let features = geojsonData.current.features || [];
      if (selectedProvinsi && selectedProvinsi !== "Semua") {
        features = features.filter((f) => {
          const prov = (f.properties?.nmprov || "").toLowerCase();
          return prov === selectedProvinsi.toLowerCase();
        });
      }

      const filteredGeo = { ...geojsonData.current, features };

      const layer = L.geoJSON(filteredGeo, {
        style: (feature) => {
          const rawName = feature.properties?.nmkab || feature.properties?.NAME_2 || "";
          const norm = normName(rawName);
          const kabData = kabLookup.current[norm] || kabLookup.current[rawName.toUpperCase()];
          const isSelected = selectedKab && norm === normName(selectedKab);
          const { fill } = getColorByMode(activeMode, kabData);

          return {
            fillColor: fill,
            fillOpacity: isSelected ? 0.9 : 0.72,
            color: isSelected ? "#facc15" : "#ffffff",
            weight: isSelected ? 4 : 0.8,
          };
        },
        onEachFeature: (feature, lyr) => {
          const rawName = feature.properties?.nmkab || feature.properties?.NAME_2 || "Wilayah";
          const provName = feature.properties?.nmprov || "";
          const norm = normName(rawName);
          const kabData = kabLookup.current[norm] || kabLookup.current[rawName.toUpperCase()];

          // Tooltip interaktif
          const erosiVal = kabData ? kabData.avgErosi.toFixed(1) : "-";
          const ndviVal = kabData ? kabData.avgNdvi.toFixed(3) : "-";
          const slopeVal = kabData ? kabData.avgSlope.toFixed(1) : "-";
          const elevVal = kabData ? kabData.maxElev.toLocaleString("id-ID") : "-";
          const erosiCol = kabData ? getErosiColor(kabData.avgErosi).fill : "#94a3b8";

          const hoverHtml = `
            <div style="font-family: inherit; color: #f8fafc; padding: 2px;">
              <div style="font-weight: 700; font-size: 11px; color: #ffffff; text-transform: uppercase;">${rawName}</div>
              <div style="font-size: 9px; color: #94a3b8;">${provName}</div>
            </div>
          `;

          const popupHtml = `
            <div style="font-family: inherit; min-width: 170px; color: #f8fafc;">
              <div style="font-weight: 700; font-size: 13px; color: #ffffff; line-height: 1.2;">${rawName}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-bottom: 8px;">${provName}</div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span style="color: #cbd5e1;">Laju Erosi:</span>
                <strong style="color: ${erosiCol};">${erosiVal} T/ha/thn</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span style="color: #cbd5e1;">NDVI Rerata:</span>
                <strong style="color: #4ade80;">${ndviVal}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                <span style="color: #cbd5e1;">Kemiringan:</span>
                <strong style="color: #93c5fd;">${slopeVal}°</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px;">
                <span style="color: #cbd5e1;">Elevasi Maks:</span>
                <strong style="color: #c084fc;">${elevVal} mdpl</strong>
              </div>
            </div>
          `;

          lyr.bindTooltip(hoverHtml, {
            sticky: true,
            direction: "top",
            className: "custom-map-tooltip",
            offset: [0, -10],
          });

          // Popup untuk "kotak" yang menetap saat dipilih
          lyr.bindPopup(popupHtml, {
            className: "custom-map-popup",
            closeButton: false,
            autoPan: false,
          });

          // Efek Hover
          lyr.on("mouseover", function () {
            this.setStyle({
              fillOpacity: 0.95,
              color: "#ffffff",
              weight: 2.2,
            });
            this.bringToFront();
          });

          lyr.on("mouseout", function () {
            applyFeatureStyle(this, feature);
          });

          // Efek Klik
          lyr.on("click", function (e) {
            if (kabData && onKabupatenClick) {
              onKabupatenClick(kabData.nm_kabupaten, kabData.provinsi);
            }
          });
        },
      }).addTo(mapInst.current);

      geoLayer.current = layer;

      // Fit bounds langsung ke wilayah yang tersedia
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          mapInst.current.fitBounds(bounds, { padding: [15, 15] });
        }
      } catch (err) {
        console.error("Bounds error:", err);
      }
    };

    loadGeoJSON();
  }, [loaded, activeMode, selectedProvinsi]);

  // Auto zoom ke poligon saat selectedKab berubah (misal dari dropdown)
  useEffect(() => {
    if (mapInst.current && geoLayer.current) {
      if (selectedKab) {
        const normSelected = normName(selectedKab);
        geoLayer.current.eachLayer((layer) => {
          const rawName = layer.feature.properties?.nmkab || layer.feature.properties?.NAME_2 || "";
          if (normName(rawName) === normSelected) {
            mapInst.current.flyToBounds(layer.getBounds(), {
              duration: 0.8,
              padding: [40, 40],
              maxZoom: 9,
            });
            layer.bringToFront();
            layer.openPopup();
          } else {
            layer.closePopup();
          }
        });
      } else if (selectedProvinsi !== "Semua") {
        // Jika kembali ke "Semua" di kabupaten, tapi provinsi masih terpilih, fit bounds ke provinsi
        const bounds = geoLayer.current.getBounds();
        if (bounds.isValid()) {
          mapInst.current.fitBounds(bounds, { padding: [15, 15] });
        }
      }
    }
  }, [selectedKab, selectedProvinsi]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner" style={{ minHeight: "420px" }}>
      {/* CSS Override untuk Leaflet Tooltip & Control */}
      <style>{`
        .leaflet-container { 
          background: #090d16 !important; 
          font-family: inherit;
        }
        .custom-map-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          padding: 10px 14px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(8px) !important;
        }
        .custom-map-tooltip::before {
          border-top-color: rgba(15, 23, 42, 0.95) !important;
        }

        /* Styling Popup Permanen */
        .custom-map-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-radius: 12px !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(8px) !important;
        }
        .custom-map-popup .leaflet-popup-content {
          margin: 10px 14px !important;
        }
        .custom-map-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
          margin-bottom: 12px !important;
          margin-right: 12px !important;
        }
        .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.9) !important;
          color: #cbd5e1 !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          transition: all 0.2s;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(30, 41, 59, 1) !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* Map Element */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Loading Overlay */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-950 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-300 text-xs font-medium">Memuat Peta Spasial...</span>
          </div>
        </div>
      )}

      {/* TOP CONTROLS: Mode Switcher & Basemap Switcher */}
      <div className="absolute top-3 inset-x-3 z-[500] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Mode Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-lg">
          {MAP_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeMode === m.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{m.icon}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Basemap Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/85 backdrop-blur-md border border-white/10 p-1 rounded-xl shadow-lg">
          {Object.entries(BASEMAP_CONFIGS).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleChangeBasemap(key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                activeBasemap === key
                  ? "bg-slate-700 text-white font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Filter Button (Muncul jika ada filter aktif) */}
      {(selectedKab || selectedProvinsi !== "Semua") && (
        <button
          onClick={() => {
            if (onReset) onReset();
            else if (onKabupatenClick) onKabupatenClick("Semua");
            if (mapInst.current && geoLayer.current) {
              const bounds = geoLayer.current.getBounds();
              if (bounds.isValid()) mapInst.current.flyToBounds(bounds, { duration: 0.8, padding: [15, 15] });
            }
          }}
          className="absolute top-16 right-3 z-[500] px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg border border-blue-400/40 flex items-center gap-1.5 transition-all"
        >
          <span>✕</span>
          <span>Reset ke Semua</span>
        </button>
      )}

      {/* BOTTOM LEFT: Glassmorphic Legend */}
      <div className="absolute bottom-3 left-3 z-[500] bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl max-w-[210px]">
        <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-white/10">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            {MAP_MODES.find((m) => m.id === activeMode)?.label}
          </span>
          <span className="text-[10px] text-blue-400 font-mono">Modul 1</span>
        </div>
        <div className="space-y-1.5">
          {(LEGEND_ITEMS[activeMode] || []).map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded flex-shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-slate-300 font-medium leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM RIGHT: Info Wilayah Terpilih (Kecil) */}
      {selectedKab && kabLookup.current[normName(selectedKab)] && (() => {
        const kabData = kabLookup.current[normName(selectedKab)];

        return (
          <div className="absolute bottom-16 right-3 z-[500] bg-slate-900/90 backdrop-blur-md border border-amber-400/50 rounded-xl px-3 py-2 shadow-xl flex flex-col items-end transform transition-all duration-300">
            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mb-0.5">Wilayah Terpilih</span>
            <span className="text-white text-xs font-bold leading-none">{kabData.nm_kabupaten}</span>
          </div>
        );
      })()}
    </div>
  );
}