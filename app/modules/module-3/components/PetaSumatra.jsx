"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import mapData from "./sumatra_map_data_optimized.json";

const JUDUL_PETA = {
  beranda: "Peta Wilayah Bencana Sumatra",
  banjir: "Peta Banjir Sumatra",
  longsor: "Peta Tanah Longsor Sumatra",
};

function normalizeKabName(str) {
  if (!str) return "";
  let s = str.toLowerCase().trim();
  // Khusus Kota Solok vs Solok agar tidak bentrok
  if (s === "kota solok" || s === "kotasolok") return "kotasolok";
  if (s === "solok") return "solok";

  s = s.replace(/^(kab\.|kabupaten|kota)\s+/i, "").replace(/[^a-z0-9]/g, "");

  if (s === "sawahlunto") return "sawahlunto";
  if (s === "tobasamosir" || s === "toba") return "toba";
  if (s === "padangsidimpuan" || s === "padangsidempuan") return "padangsidimpuan";

  return s;
}

function normalizeKecName(str) {
  if (!str) return "";
  let s = str.toLowerCase().replace(/^(kec\.|kecamatan)\s+/i, "").replace(/[^a-z0-9]/g, "");
  if (s === "alapan" || s === "alafan") return "alapan";
  if (s === "geulumpangtiga" || s === "glumpangtiga") return "glumpangtiga";
  if (s === "setiabhakti" || s === "setiabakti") return "setiabakti";
  if (s === "pauahduo" || s === "pauhduo") return "pauhduo";
  if (s === "ixkoto" || s === "sembilankoto") return "ixkoto";
  if (s === "canduang" || s === "candung") return "canduang";
  if (s === "2x11enamlingkung" || s === "2x11enamlingkuang") return "2x11enamlingkung";
  if (s === "lubuktarok" || s === "lubuaktarok") return "lubuktarok";
  return s;
}

// Alias untuk kompatibilitas
function normalizeName(str) {
  return normalizeKabName(str);
}

// Warna klasifikasi banjir berdasarkan mean_nilai
function getBanjirColor(meanNilai) {
  if (meanNilai <= 0) return null; // Tidak terdampak
  if (meanNilai < 3) return "#00D2FF"; // Ringan
  if (meanNilai < 5) return "#0084FF"; // Sedang
  return "#0044FF"; // Berat
}

// Warna klasifikasi longsor berdasarkan mean_nilai (selisih backscatter dB)
function getLongsorColor(meanNilai) {
  if (meanNilai <= 0) return null; // Tidak terdampak
  if (meanNilai < 3) return "#FCD34D"; // Ringan
  if (meanNilai < 5) return "#F97316"; // Sedang
  return "#DC2626"; // Berat
}

// Warna beranda: merah jika terdampak, null jika tidak
function getBerandaColor(kabData) {
  if (!kabData) return null;
  const hasBanjir = (kabData.banjir_ha || 0) > 0 || (kabData.banjir_mean || 0) > 0;
  const hasLongsor = (kabData.longsor_ha || 0) > 0 || (kabData.longsor_mean || 0) > 0;
  if (!hasBanjir && !hasLongsor) return null;
  return "#E33434"; // Terdampak
}

function formatAngka(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return Math.round(num).toLocaleString("id-ID");
}

function formatDesimal(num, maxDigits = 2) {
  if (num === null || num === undefined || isNaN(num)) return "0";
  return Number(num).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: maxDigits,
  });
}

export default function PetaSumatra({
  activeMenu,
  provinsi, setProvinsi,
  kabupaten, setKabupaten,
  kecamatan, setKecamatan,
}) {
  const targetProvinces = ["Aceh", "Sumatera Utara", "Sumatera Barat"];

  // Data dampak dari modul3_dampak_baru.json
  const [dampakData, setDampakData] = useState([]);

  useEffect(() => {
    fetch("/data/modul3_dampak_baru.json")
      .then((res) => res.json())
      .then((data) => setDampakData(data))
      .catch((err) => console.error("Gagal memuat data dampak:", err));
  }, []);

  // Build lookup per kabupaten: aggregate mean_nilai per kabupaten
  const kabLookup = useMemo(() => {
    if (!dampakData.length) return {};
    const lookup = {};
    for (const r of dampakData) {
      const rawKey = r.nm_kabupaten;
      const normKey = normalizeKabName(rawKey);
      if (!lookup[normKey]) {
        lookup[normKey] = {
          banjir_ha: 0,
          banjir_sum_kedalaman: 0,
          longsor_ha: 0,
          longsor_sum_db: 0,
          luas_km2: 0,
        };
      }
      const b = r.dampak_bencana?.banjir;
      const l = r.dampak_bencana?.longsor;
      if (b?.estimasi_luas_ha > 0) {
        lookup[normKey].banjir_ha += b.estimasi_luas_ha;
        lookup[normKey].banjir_sum_kedalaman += b.estimasi_luas_ha * (b.proxy_kedalaman_m || 0);
      }
      if (l?.estimasi_luas_ha > 0) {
        lookup[normKey].longsor_ha += l.estimasi_luas_ha;
        lookup[normKey].longsor_sum_db += l.estimasi_luas_ha * (l.tingkat_keparahan_db || 0);
      }
      lookup[normKey].luas_km2 += r.luas_kec_km2;
    }
    // Compute mean per kab and mirror raw names
    for (const normKey of Object.keys(lookup)) {
      const d = lookup[normKey];
      d.banjir_mean = d.banjir_ha > 0 ? d.banjir_sum_kedalaman / d.banjir_ha : 0;
      d.longsor_mean = d.longsor_ha > 0 ? d.longsor_sum_db / d.longsor_ha : 0;
    }
    for (const r of dampakData) {
      const normKey = normalizeKabName(r.nm_kabupaten);
      if (lookup[normKey]) {
        lookup[r.nm_kabupaten] = lookup[normKey];
      }
    }
    return lookup;
  }, [dampakData]);

  // Build lookup per kecamatan
  const kecLookup = useMemo(() => {
    if (!dampakData.length) return {};
    const lookup = {};
    for (const r of dampakData) {
      const b = r.dampak_bencana?.banjir;
      const l = r.dampak_bencana?.longsor;
      const rawKey = `${r.nm_kabupaten}|${r.nm_kecamatan}`;
      const normKey = `${normalizeKabName(r.nm_kabupaten)}|${normalizeKecName(r.nm_kecamatan)}`;
      const val = {
        banjir_mean: b?.proxy_kedalaman_m || 0,
        longsor_mean: l?.tingkat_keparahan_db || 0,
        banjir_ha: b?.estimasi_luas_ha || 0,
        longsor_ha: l?.estimasi_luas_ha || 0,
        luas_km2: r.luas_kec_km2,
      };
      lookup[rawKey] = val;
      lookup[normKey] = val;
    }
    return lookup;
  }, [dampakData]);

  // Zoom, Pan, and 3D State
  const [scale, setScale] = useState(1.18);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [is3D, setIs3D] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset view handler
  const handleResetView = () => {
    setScale(1.18);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(s * 1.3, 4.5));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.3, 0.7));

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.87;
    setScale((s) => Math.min(Math.max(s * delta, 0.7), 4.5));
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Non-target provinces (cream background layer)
  const nonTargetProvinces = mapData.provinces.filter((p) => !targetProvinces.includes(p.name));

  // Match active kecamatan item
  const normActiveKec = normalizeKecName(kecamatan);
  const isFilterActive = Boolean(provinsi || kabupaten || normActiveKec);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[1050px] mx-auto select-none">
      {/* Label Glass Pill Button */}
      <div
        className="flex items-center justify-center w-full max-w-[90vw] sm:w-[440px] xl:w-[480px] 2xl:w-[573px] h-[44px] sm:h-[48px] xl:h-[52px] 2xl:h-[58px] rounded-[40px] sm:rounded-[50px] border-[3.5px] sm:border-[4px] lg:border-[5px] border-[rgba(255,255,255,0.45)] transition-all duration-300 xl:-mt-6 2xl:-mt-12 z-20"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.12) 100%)",
          boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
        }}
      >
        <span
          className="font-black text-white text-center text-[16px] sm:text-[22px] lg:text-[25px] [text-shadow:0_4px_6px_rgba(0,0,0,0.6)] whitespace-nowrap [-webkit-text-stroke:1px_rgba(44,44,44,0.4)]"
          style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
        >
          {JUDUL_PETA[activeMenu] ?? "Peta Wilayah Bencana Sumatra"}
        </span>
      </div>

      {/* Map Viewport Area */}
      <div
        className="relative w-full h-[400px] sm:h-[540px] xl:h-[520px] 2xl:h-[620px] 3xl:h-[680px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Floating Zoom & 3D Controls */}
        <div className="absolute right-4 top-4 z-30 flex flex-col gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleZoomIn}
            title="Perbesar (Zoom In)"
            className="w-10 h-10 rounded-full bg-white/45 hover:bg-white/80 active:scale-95 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#272525"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 transition-transform group-hover:scale-110"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            title="Perkecil (Zoom Out)"
            className="w-10 h-10 rounded-full bg-white/45 hover:bg-white/80 active:scale-95 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#272525"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 transition-transform group-hover:scale-110"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleResetView}
            title="Reset Posisi Peta"
            className="w-10 h-10 rounded-full bg-white/45 hover:bg-white/80 active:scale-95 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#272525"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-180"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setIs3D(!is3D)}
            title="Beralih Tampilan 3D / 2D"
            className="w-10 h-10 rounded-full bg-white/45 hover:bg-white/80 active:scale-95 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200 mt-0.5"
          >
            <span
              className="text-[13px] font-[850] text-[#272525] tracking-tight"
              style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            >
              {is3D ? "3D" : "2D"}
            </span>
          </button>
        </div>

        {/* Floating Klasifikasi Banjir Card */}
        {activeMenu === "banjir" && (
          <div className="absolute left-4 bottom-4 z-30 flex flex-col w-[210px] px-4 py-3 rounded-[22px] border-[1.5px] border-[#8C6B4F] bg-white/95 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.25)] pointer-events-auto">
            {/* Title */}
            <p
              className="font-extrabold text-[#0F5257] text-[14px] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] mb-1"
              style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            >
              Klasifikasi Banjir
            </p>
            {/* Underline separator */}
            <div className="w-full h-[1px] bg-[#0F5257]/40 mb-2" />

            {/* Items */}
            <div className="flex flex-col gap-2 text-[13px] text-gray-900 font-medium">
              {/* Ringan */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00D2FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Ringan</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&lt; 3 m</span>
              </div>

              {/* Sedang */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0084FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Sedang</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">3 - 5 m</span>
              </div>

              {/* Berat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0044FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Berat</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&gt; 5 m</span>
              </div>

              {/* Tidak Terdampak */}
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#F5F5F7] border border-gray-700 shadow-sm flex-shrink-0" />
                <span className="font-serif text-[14px]">Tidak Terdampak</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Klasifikasi Longsor Card */}
        {activeMenu === "longsor" && (
          <div className="absolute left-4 bottom-4 z-30 flex flex-col w-[210px] px-4 py-3 rounded-[22px] border-[1.5px] border-[#8C6B4F] bg-white/95 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.25)] pointer-events-auto">
            {/* Title */}
            <p
              className="font-extrabold text-[#0F5257] text-[14px] text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)] mb-1"
              style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            >
              Klasifikasi Longsor
            </p>
            {/* Underline separator */}
            <div className="w-full h-[1px] bg-[#0F5257]/40 mb-2" />

            {/* Items */}
            <div className="flex flex-col gap-2 text-[13px] text-gray-900 font-medium">
              {/* Ringan */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#FCD34D] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Ringan</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&lt; 3 dB</span>
              </div>

              {/* Sedang */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#F97316] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Sedang</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">3 - 5 dB</span>
              </div>

              {/* Berat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#DC2626] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Berat</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&gt; 5 dB</span>
              </div>

              {/* Tidak Terdampak */}
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#F5F5F7] border border-gray-700 shadow-sm flex-shrink-0" />
                <span className="font-serif text-[14px]">Tidak Terdampak</span>
              </div>
            </div>
          </div>
        )}



        {/* Hover Tooltip */}
        {hoveredItem && (() => {
          const isFlippedX = typeof window !== "undefined" && tooltipPos.x > window.innerWidth - 240;
          const isFlippedY = typeof window !== "undefined" && tooltipPos.y < 130;
          const pointerColor = hoveredItem.isSelected
            ? "#0F5257"
            : activeMenu === "banjir"
              ? "#0066CC"
              : "#EE3B3B";

          const targetX = isFlippedX ? -42 : 42;
          const targetY = isFlippedY ? 24 : -24;
          const startX = isFlippedX ? -4.5 : 4.5;
          const startY = isFlippedY ? 2.5 : -2.5;

          return (
            <div
              className="fixed z-50 pointer-events-none transition-opacity duration-75"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
              }}
            >
              {/* Leader Line & Noktah SVG */}
              <svg className="absolute overflow-visible pointer-events-none" style={{ left: 0, top: 0 }}>
                <defs>
                  <filter id="calloutGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.45" />
                  </filter>
                  <marker
                    id="calloutArrow"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FFFFFF" />
                  </marker>
                </defs>

                {/* Garis Penunjuk ke Kartu */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={targetX}
                  y2={targetY}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd="url(#calloutArrow)"
                  filter="url(#calloutGlow)"
                />

                {/* Noktah (Target Dot) - tepat di titik koordinat kursor (0,0) */}
                <circle
                  cx="0"
                  cy="0"
                  r="5"
                  fill="#FFFFFF"
                  stroke={pointerColor}
                  strokeWidth="2.5"
                  filter="url(#calloutGlow)"
                />
                <circle cx="0" cy="0" r="1.8" fill={pointerColor} />
              </svg>

              {/* Tooltip Card */}
              <div
                className="absolute bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-[18px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] border border-gray-200/90 flex flex-col min-w-[160px]"
                style={{
                  left: isFlippedX ? "auto" : "42px",
                  right: isFlippedX ? "42px" : "auto",
                  top: isFlippedY ? "10px" : "-46px",
                  whiteSpace: "nowrap",
                }}
              >
                <span className="font-black text-[#0F5257] text-[13.5px] leading-snug" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                {hoveredItem.rawTitle || hoveredItem.title}
              </span>
              <span className="text-gray-500 text-[10.5px] font-medium leading-none mt-0.5 mb-2">{hoveredItem.subtitle}</span>

              {/* Detail Angka Bencana */}
              {hoveredItem.subtitle?.includes("Di Luar") ? null : activeMenu === "banjir" ? (
                hoveredItem.dampakHa > 0 ? (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500 text-[11px] font-medium">Luas Genangan:</span>
                      <span className="font-black text-[#0066CC] text-[13px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                        {formatAngka(hoveredItem.dampakHa)} ha
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500 text-[11px] font-medium">Kedalaman:</span>
                      <span className="font-black text-[#004080] text-[13px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                        {formatDesimal(hoveredItem.kedalamanM)} m
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-gray-100">
                    <span className="text-gray-400 text-[11px] font-medium italic">Tidak Terdampak Banjir</span>
                  </div>
                )
              ) : activeMenu === "longsor" ? (
                hoveredItem.dampakHa > 0 ? (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500 text-[11px] font-medium">Luas Longsor:</span>
                      <span className="font-black text-[#E33434] text-[13px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                        {formatAngka(hoveredItem.dampakHa)} ha
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500 text-[11px] font-medium">Keparahan:</span>
                      <span className="font-black text-[#900C0C] text-[13px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                        {formatDesimal(hoveredItem.keparahanDb)} dB
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-gray-100">
                    <span className="text-gray-400 text-[11px] font-medium italic">Tidak Terdampak Longsor</span>
                  </div>
                )
              ) : (
                /* activeMenu === "beranda" */
                hoveredItem.hasDampak ? (
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-gray-500 text-[11px] font-medium">Total Luas:</span>
                      <span className="font-black text-[#EE3B3B] text-[13px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                        {formatAngka(hoveredItem.dampakHa)} ha
                      </span>
                    </div>
                    {hoveredItem.banjirHa > 0 && (
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="text-gray-500">Banjir:</span>
                        <span className="font-bold text-[#0066CC]">
                          {formatAngka(hoveredItem.banjirHa)} ha {hoveredItem.kedalamanM > 0 && `(${formatDesimal(hoveredItem.kedalamanM)} m)`}
                        </span>
                      </div>
                    )}
                    {hoveredItem.longsorHa > 0 && (
                      <div className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="text-gray-500">Longsor:</span>
                        <span className="font-bold text-[#E33434]">
                          {formatAngka(hoveredItem.longsorHa)} ha {hoveredItem.keparahanDb > 0 && `(${formatDesimal(hoveredItem.keparahanDb)} dB)`}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-gray-100">
                    <span className="text-gray-400 text-[11px] font-medium italic">Tidak Terdampak Bencana</span>
                  </div>
                )
              )}
              </div>
            </div>
          );
        })()}

        {/* 3D / 2D Transform Wrapper */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) ${is3D ? "perspective(1200px) rotateX(25deg) rotateZ(-4deg)" : "rotateX(0deg)"
              }`,
            transformOrigin: "center center",
          }}
        >
          <svg
            viewBox={mapData.viewBox}
            className="w-full h-full max-w-[960px] max-h-[640px] object-contain"
            style={{ overflow: "visible" }}
          >
            <defs>
              <filter id="mod3MapExtrudeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#000000" floodOpacity="0.35" />
              </filter>
              <filter id="selectedGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F5257" floodOpacity="0.35" />
              </filter>
            </defs>

            <g filter="url(#mod3MapExtrudeShadow)">
              {/* 3D Extrusion Depth Layer */}
              {is3D &&
                mapData.provinces.map((prov) => (
                  <path
                    key={`depth-${prov.name}`}
                    d={prov.path}
                    fill="#7C603D"
                    transform="translate(0, 10)"
                    opacity="0.85"
                  />
                ))}

              {/* Non-target Provinces */}
              {nonTargetProvinces.map((prov) => (
                <path
                  key={`nontarget-${prov.name}`}
                  d={prov.path}
                  fill="#FFFFFF"
                  stroke="#E2D8CC"
                  strokeWidth="0.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onMouseEnter={(e) => {
                    setHoveredItem({ title: prov.name, subtitle: "Provinsi Sumatra (Di Luar Wilayah Kajian)", isRed: false });
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              ))}

              {/* RENDER KECAMATAN LAYER IF KECAMATAN FILTER IS ACTIVE */}
              {normActiveKec && mapData.kecamatan ? (
                mapData.kecamatan.map((item, idx) => {
                  const isSelectedKec = normalizeKecName(item.kec) === normActiveKec;
                  const kecKey = `${item.kab}|${item.kec}`;
                  const normKecKey = `${normalizeKabName(item.kab)}|${normalizeKecName(item.kec)}`;
                  const kecData = kecLookup[normKecKey] || kecLookup[kecKey];
                  const isProvTarget = targetProvinces.includes(item.prov);

                  // Cek apakah kecamatan ini termasuk dalam wilayah filter
                  let matchesFilter = true;
                  if (normActiveKec) {
                    matchesFilter = isSelectedKec;
                  } else if (kabupaten) {
                    matchesFilter = (item.kab === kabupaten || normalizeKabName(item.kab) === normalizeKabName(kabupaten));
                  } else if (provinsi) {
                    matchesFilter = (item.prov === provinsi);
                  }

                  const isExcluded = isFilterActive && !matchesFilter;
                  const hasDampak = Boolean(kecData && (kecData.banjir_ha > 0 || kecData.longsor_ha > 0));

                  const kecDampakHa = activeMenu === "banjir"
                    ? (kecData?.banjir_ha ?? 0)
                    : activeMenu === "longsor"
                      ? (kecData?.longsor_ha ?? 0)
                      : ((kecData?.banjir_ha ?? 0) + (kecData?.longsor_ha ?? 0));

                  // Tentukan warna fill dan stroke
                  let fillColor = "#FFFFFF";
                  let strokeColor = "#D0C4B8";
                  let strokeW = 0.4;
                  let filterAttr = undefined;

                  if (isExcluded) {
                    // TIDAK DIFILTER -> warna putih!
                    fillColor = "#FFFFFF";
                    strokeColor = "#E2D8CC";
                    strokeW = 0.3;
                  } else {
                    // KEFILTER ATAU TANPA FILTER -> warnanya sama aja tanpa filter!
                    filterAttr = isSelectedKec ? "url(#selectedGlow)" : undefined;

                    if (activeMenu === "banjir") {
                      if (isProvTarget) {
                        const banjirMean = kecData?.banjir_mean ?? 0;
                        fillColor = getBanjirColor(banjirMean) || "#FFFFFF";
                        strokeColor = isSelectedKec ? "#0F5257" : (banjirMean > 0 ? "#004080" : "#D0C4B8");
                        strokeW = isSelectedKec ? 2.0 : (banjirMean > 0 ? 0.8 : 0.4);
                      }
                    } else if (activeMenu === "longsor") {
                      if (isProvTarget) {
                        const longsorMean = kecData?.longsor_mean ?? 0;
                        fillColor = getLongsorColor(longsorMean) || "#FFFFFF";
                        strokeColor = isSelectedKec ? "#0F5257" : (longsorMean > 0 ? "#991B1B" : "#D0C4B8");
                        strokeW = isSelectedKec ? 2.0 : (longsorMean > 0 ? 0.8 : 0.4);
                      }
                    } else {
                      // Beranda: biner merah awal (#E33434 dengan outline merah tua #900C0C) dan putih (#FFFFFF)
                      if (isProvTarget) {
                        if (hasDampak) {
                          fillColor = "#E33434";
                          strokeColor = isSelectedKec ? "#0F5257" : "#900C0C";
                          strokeW = isSelectedKec ? 2.0 : 1.0;
                        } else {
                          fillColor = "#FFFFFF";
                          strokeColor = isSelectedKec ? "#0F5257" : "#D0C4B8";
                          strokeW = isSelectedKec ? 2.0 : 0.4;
                        }
                      }
                    }
                  }

                  return (
                    <path
                      key={`kec-${item.prov}-${item.kab}-${item.kec}-${idx}`}
                      d={item.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={filterAttr}
                      className="transition-colors duration-200 hover:opacity-85 cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredItem({
                          rawTitle: item.kec,
                          title: `Kec. ${item.kec}`,
                          subtitle: `${item.kab}, ${item.prov}`,
                          isSelected: isSelectedKec,
                          dampakHa: kecDampakHa,
                          banjirHa: kecData?.banjir_ha ?? 0,
                          kedalamanM: kecData?.banjir_mean ?? 0,
                          longsorHa: kecData?.longsor_ha ?? 0,
                          keparahanDb: kecData?.longsor_mean ?? 0,
                          hasDampak: Boolean(kecData && (kecData.banjir_ha > 0 || kecData.longsor_ha > 0)),
                        });
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setKecamatan) {
                          setKecamatan(isSelectedKec ? "" : item.kec);
                        }
                      }}
                    />
                  );
                })
              ) : (
                /* RENDER KABUPATEN LAYER OTHERWISE */
                mapData.kabupaten.map((kab) => {
                  const isProvTarget = targetProvinces.includes(kab.prov);
                  const isKabSelected = Boolean(kabupaten && (kabupaten === kab.kab || normalizeKabName(kabupaten) === normalizeKabName(kab.kab)));
                  const isProvSelected = Boolean(provinsi && provinsi === kab.prov);
                  const kabData = kabLookup[normalizeKabName(kab.kab)] || kabLookup[kab.kab];

                  // Cek apakah kabupaten ini masuk dalam cakupan filter
                  let matchesFilter = true;
                  if (kabupaten) {
                    matchesFilter = isKabSelected;
                  } else if (provinsi) {
                    matchesFilter = isProvSelected;
                  }

                  const isExcluded = isFilterActive && !matchesFilter;
                  const hasDampak = Boolean(kabData && (kabData.banjir_ha > 0 || kabData.longsor_ha > 0));

                  // Tentukan warna fill dan stroke
                  let fillColor = "#FFFFFF";
                  let strokeColor = "#D0C4B8";
                  let strokeW = 0.8;
                  let filterAttr = undefined;

                  if (isExcluded) {
                    // TIDAK DIFILTER -> warnanya putih aja!
                    fillColor = "#FFFFFF";
                    strokeColor = "#E2D8CC";
                    strokeW = 0.5;
                  } else {
                    // KEFILTER ATAU TANPA FILTER -> warnanya sama aja tanpa filter!
                    filterAttr = isKabSelected ? "url(#selectedGlow)" : undefined;

                    if (activeMenu === "banjir") {
                      if (isProvTarget) {
                        const banjirMean = kabData?.banjir_mean ?? 0;
                        fillColor = getBanjirColor(banjirMean) || "#FFFFFF";
                        if (isKabSelected) {
                          strokeColor = "#0F5257";
                          strokeW = 2.0;
                        } else if (banjirMean > 0) {
                          strokeColor = "#004080";
                          strokeW = 1.0;
                        } else {
                          strokeColor = "#D0C4B8";
                          strokeW = 0.8;
                        }
                      }
                    } else if (activeMenu === "longsor") {
                      if (isProvTarget) {
                        const longsorMean = kabData?.longsor_mean ?? 0;
                        fillColor = getLongsorColor(longsorMean) || "#FFFFFF";
                        if (isKabSelected) {
                          strokeColor = "#0F5257";
                          strokeW = 2.0;
                        } else if (longsorMean > 0) {
                          strokeColor = "#991B1B";
                          strokeW = 1.0;
                        } else {
                          strokeColor = "#D0C4B8";
                          strokeW = 0.8;
                        }
                      }
                    } else {
                      // Beranda: biner merah awal (#E33434 dengan outline merah tua #900C0C) dan putih (#FFFFFF)
                      if (isProvTarget) {
                        if (hasDampak) {
                          fillColor = "#E33434";
                          if (isKabSelected) {
                            strokeColor = "#0F5257";
                            strokeW = 2.0;
                          } else {
                            strokeColor = "#900C0C";
                            strokeW = 1.4;
                          }
                        } else {
                          fillColor = "#FFFFFF";
                          if (isKabSelected) {
                            strokeColor = "#0F5257";
                            strokeW = 2.0;
                          } else {
                            strokeColor = "#D0C4B8";
                            strokeW = 0.8;
                          }
                        }
                      }
                    }
                  }

                  const dampakHa = activeMenu === "banjir"
                    ? kabData?.banjir_ha ?? 0
                    : activeMenu === "longsor"
                      ? kabData?.longsor_ha ?? 0
                      : (kabData ? (kabData.banjir_ha + kabData.longsor_ha) : 0);

                  return (
                    <path
                      key={`kab-${kab.prov}-${kab.kab}`}
                      d={kab.path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter={filterAttr}
                      className="transition-colors duration-200 hover:opacity-85 cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredItem({
                          rawTitle: kab.kab,
                          title: kab.kab,
                          subtitle: kab.prov,
                          isSelected: isKabSelected,
                          dampakHa,
                          banjirHa: kabData?.banjir_ha ?? 0,
                          kedalamanM: kabData?.banjir_mean ?? 0,
                          longsorHa: kabData?.longsor_ha ?? 0,
                          keparahanDb: kabData?.longsor_mean ?? 0,
                          hasDampak: Boolean(kabData && (kabData.banjir_ha > 0 || kabData.longsor_ha > 0)),
                        });
                        setTooltipPos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredItem(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (setProvinsi) {
                          if (provinsi === kab.prov && kabupaten === kab.kab) {
                            setProvinsi("");
                            if (setKabupaten) setKabupaten("");
                          } else {
                            setProvinsi(kab.prov);
                            if (setKabupaten) setKabupaten(kab.kab);
                          }
                        }
                      }}
                    />
                  );
                })
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}