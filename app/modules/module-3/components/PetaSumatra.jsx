"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import mapData from "./sumatra_map_data_optimized.json";

const JUDUL_PETA = {
  beranda: "Peta Wilayah Bencana Sumatra",
  banjir: "Peta Banjir Sumatra",
  longsor: "Peta Tanah Longsor Sumatra",
};

function normalizeName(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/^(kab\.|kota)\s+/i, "").trim();
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
  const hasBanjir = kabData.banjir_mean > 0;
  const hasLongsor = kabData.longsor_mean > 0;
  if (!hasBanjir && !hasLongsor) return null;
  return "#E33434"; // Terdampak
}

function formatAngka(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return Math.round(num).toLocaleString("id-ID");
}

export default function PetaSumatra({
  activeMenu,
  provinsi, setProvinsi,
  kabupaten, setKabupaten,
  kecamatan, setKecamatan,
}) {
  const targetProvinces = ["Aceh", "Sumatera Utara", "Sumatera Barat"];

  // Data dampak dari modul3_dampak.json
  const [dampakData, setDampakData] = useState([]);

  useEffect(() => {
    fetch("/data/modul3_dampak.json")
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
      const normKey = normalizeName(rawKey);
      if (!lookup[normKey]) {
        lookup[normKey] = {
          banjir_pixel: 0,
          banjir_sum: 0,
          longsor_pixel: 0,
          longsor_sum: 0,
          luas_km2: 0,
        };
      }
      lookup[normKey].banjir_pixel += r.dampak_banjir_longsor.pixel_count;
      lookup[normKey].banjir_sum += r.dampak_banjir_longsor.sum_nilai;
      lookup[normKey].longsor_pixel += r.dampak_genangan_longsor.pixel_count;
      lookup[normKey].longsor_sum += r.dampak_genangan_longsor.sum_nilai;
      lookup[normKey].luas_km2 += r.luas_kec_km2;
    }
    // Compute mean per kab and mirror raw names
    for (const normKey of Object.keys(lookup)) {
      const d = lookup[normKey];
      d.banjir_mean = d.banjir_pixel > 0 ? d.banjir_sum / d.banjir_pixel : 0;
      d.longsor_mean = d.longsor_pixel > 0 ? d.longsor_sum / d.longsor_pixel : 0;
      d.banjir_ha = d.banjir_pixel * 0.09;
      d.longsor_ha = d.longsor_pixel * 0.09;
    }
    return lookup;
  }, [dampakData]);

  // Build lookup per kecamatan
  const kecLookup = useMemo(() => {
    if (!dampakData.length) return {};
    const lookup = {};
    for (const r of dampakData) {
      const rawKey = `${r.nm_kabupaten}|${r.nm_kecamatan}`;
      const normKey = `${normalizeName(r.nm_kabupaten)}|${normalizeName(r.nm_kecamatan)}`;
      const val = {
        banjir_mean: r.dampak_banjir_longsor.mean_nilai,
        longsor_mean: r.dampak_genangan_longsor.mean_nilai,
        banjir_ha: r.dampak_banjir_longsor.pixel_count * 0.09,
        longsor_ha: r.dampak_genangan_longsor.pixel_count * 0.09,
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
  const normActiveKec = normalizeName(kecamatan);
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
            title="Zoom In"
            className="w-10 h-10 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 text-gray-900 font-bold text-xl flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-10 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 text-gray-900 font-bold text-xl flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            −
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title="Reset View"
            className="w-10 h-10 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 text-gray-900 font-bold text-sm flex items-center justify-center shadow-lg transition-all active:scale-95"
          >
            🔄
          </button>
          <button
            type="button"
            onClick={() => setIs3D(!is3D)}
            title="Toggle 3D View"
            className="px-3 py-1.5 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 text-gray-900 font-extrabold text-xs flex items-center justify-center shadow-lg transition-all active:scale-95 mt-1"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
          >
            {is3D ? "3D" : "2D"}
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
                <span className="font-serif text-[13px] text-gray-800">&lt; 3</span>
              </div>

              {/* Sedang */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0084FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Sedang</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">3 - 5</span>
              </div>

              {/* Berat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0044FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Berat</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&gt; 5</span>
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
        {hoveredItem && (
          <div
            className="fixed z-50 pointer-events-none flex items-center gap-1.5 transition-opacity duration-150"
            style={{
              left: `${tooltipPos.x - 12}px`,
              top: `${tooltipPos.y - 45}px`,
            }}
          >
            <svg className="w-10 h-10 overflow-visible">
              <defs>
                <marker id="calloutArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFFFFF" />
                </marker>
              </defs>
              <circle cx="6" cy="30" r="4.5" fill="#FFFFFF" stroke={hoveredItem.isSelected ? "#0F5257" : "#EE3B3B"} strokeWidth="2.5" />
              <line x1="8" y1="28" x2="34" y2="12" stroke="#FFFFFF" strokeWidth="2" markerEnd="url(#calloutArrow)" />
            </svg>

            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] border border-gray-200/90 flex flex-col ml-1">
              <span className="font-black text-[#0F5257] text-[14px] leading-snug" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                {hoveredItem.rawTitle || hoveredItem.title}
              </span>
              <span className="text-gray-500 text-[11px] font-medium">{hoveredItem.subtitle}</span>
              {hoveredItem.dampakHa != null && (
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-black text-[#EE3B3B] text-[14px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                    {formatAngka(hoveredItem.dampakHa)} ha
                  </span>
                  <span className="font-semibold text-gray-500 text-[11px]">
                    terdampak
                  </span>
                </div>
              )}
              {hoveredItem.hasDampak && (
                <span className="text-orange-500 font-semibold text-[11px] mt-0.5">⚠️ Wilayah Terdampak</span>
              )}
            </div>
          </div>
        )}

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
                  fill={isFilterActive ? "#FFFFFF" : "#F2E4C4"}
                  stroke={isFilterActive ? "#E2D8CC" : "#A89678"}
                  strokeWidth={isFilterActive ? "0.6" : "1.2"}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onMouseEnter={(e) => {
                    setHoveredItem({ title: prov.name, subtitle: "Provinsi Sumatra", isRed: false });
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setHoveredItem(null)}
                />
              ))}

              {/* RENDER KECAMATAN LAYER IF KECAMATAN FILTER IS ACTIVE */}
              {normActiveKec && mapData.kecamatan ? (
                mapData.kecamatan.map((item, idx) => {
                  const isSelectedKec = normalizeName(item.kec) === normActiveKec;
                  const kecKey = `${item.kab}|${item.kec}`;
                  const normKecKey = `${normalizeName(item.kab)}|${normalizeName(item.kec)}`;
                  const kecData = kecLookup[normKecKey] || kecLookup[kecKey];
                  const isProvTarget = targetProvinces.includes(item.prov);

                  // Cek apakah kecamatan ini termasuk dalam wilayah filter
                  let matchesFilter = true;
                  if (normActiveKec) {
                    matchesFilter = isSelectedKec;
                  } else if (kabupaten) {
                    matchesFilter = (item.kab === kabupaten || normalizeName(item.kab) === normalizeName(kabupaten));
                  } else if (provinsi) {
                    matchesFilter = (item.prov === provinsi);
                  }

                  const isExcluded = isFilterActive && !matchesFilter;
                  const hasDampak = Boolean(kecData && (kecData.banjir_mean > 0 || kecData.longsor_mean > 0));

                  // Tentukan warna fill dan stroke
                  let fillColor = "#F2E4C4";
                  let strokeColor = "#A89678";
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
                          dampakHa,
                          hasDampak: (kecData?.banjir_mean > 0 || kecData?.longsor_mean > 0),
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
                  const isKabSelected = Boolean(kabupaten && (kabupaten === kab.kab || normalizeName(kabupaten) === normalizeName(kab.kab)));
                  const isProvSelected = Boolean(provinsi && provinsi === kab.prov);
                  const kabData = kabLookup[normalizeName(kab.kab)] || kabLookup[kab.kab];

                  // Cek apakah kabupaten ini masuk dalam cakupan filter
                  let matchesFilter = true;
                  if (kabupaten) {
                    matchesFilter = isKabSelected;
                  } else if (provinsi) {
                    matchesFilter = isProvSelected;
                  }

                  const isExcluded = isFilterActive && !matchesFilter;
                  const hasDampak = Boolean(kabData && (kabData.banjir_mean > 0 || kabData.longsor_mean > 0));

                  // Tentukan warna fill dan stroke
                  let fillColor = "#F2E4C4";
                  let strokeColor = "#A89678";
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
                          isSelected: isHighlighted,
                          dampakHa,
                          hasDampak: (kabData?.banjir_mean > 0 || kabData?.longsor_mean > 0),
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