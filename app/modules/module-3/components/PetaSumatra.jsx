"use client";
import { useState, useRef } from "react";
import mapData from "./sumatra_map_data_optimized.json";

const JUDUL_PETA = {
  beranda: "Peta Wilayah Bencana Sumatra",
  banjir: "Peta Banjir Sumatra",
  longsor: "Peta Tanah Longsor Sumatra",
};

// Flood severity colors for Banjir tab (Matching Klasifikasi Banjir Image)
const BANJIR_CLASSIFICATION = {
  "Kota Medan": "#0044FF", // Berat (> 1,5 m)
  "Kab. Aceh Besar": "#0084FF", // Sedang (0,5 - 1,5 m)
  "Kab. Pidie": "#0044FF", // Berat (> 1,5 m)
  "Kota Padang": "#0084FF", // Sedang (0,5 - 1,5 m)
  "Kab. Deli Serdang": "#00D2FF", // Ringan (< 0,5 m)
};

// Landslide severity colors for Tanah Longsor tab (Matching Klasifikasi Longsor Image)
const LONGSOR_CLASSIFICATION = {
  "Kab. Aceh Besar": "#DC2626", // Berat (> 4 dB)
  "Kab. Pidie": "#DC2626", // Berat (> 4 dB)
  "Kota Medan": "#DC2626", // Berat (> 4 dB)
  "Kab. Deli Serdang": "#F97316", // Sedang (2 - 4 dB)
  "Kota Padang": "#DC2626", // Berat (> 4 dB)
  "Kab. Aceh Jaya": "#FCD34D", // Ringan (< 2 dB)
  "Kab. Aceh Barat": "#F97316", // Sedang (2 - 4 dB)
  "Kab. Aceh Selatan": "#FCD34D", // Ringan (< 2 dB)
  "Kab. Nagan Raya": "#F97316", // Sedang (2 - 4 dB)
  "Kab. Karo": "#F97316", // Sedang (2 - 4 dB)
  "Kab. Simalungun": "#FCD34D", // Ringan (< 2 dB)
  "Kab. Pesisir Selatan": "#F97316", // Sedang (2 - 4 dB)
  "Kab. Solok": "#FCD34D", // Ringan (< 2 dB)
};

function normalizeName(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/^(kab\.|kota)\s+/i, "").trim();
}

export default function PetaSumatra({
  activeMenu,
  provinsi, setProvinsi,
  kabupaten, setKabupaten,
  kecamatan, setKecamatan,
}) {
  const targetProvinces = ["Aceh", "Sumatera Utara", "Sumatera Barat"];

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
                <span className="font-serif text-[13px] text-gray-800">&lt; 0,5 m</span>
              </div>

              {/* Sedang */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0084FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Sedang</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">0,5 - 1,5 m</span>
              </div>

              {/* Berat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0044FF] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Berat</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&gt; 1,5 m</span>
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
                <span className="font-serif text-[13px] text-gray-800">&lt; 2 dB</span>
              </div>

              {/* Sedang */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#F97316] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Sedang</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">2 - 4 dB</span>
              </div>

              {/* Berat */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#DC2626] shadow-sm flex-shrink-0" />
                  <span className="font-serif text-[14px]">Berat</span>
                </div>
                <span className="font-serif text-[13px] text-gray-800">&gt; 4 dB</span>
              </div>

              {/* Tidak Terdampak */}
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#F5F5F7] border border-gray-700 shadow-sm flex-shrink-0" />
                <span className="font-serif text-[14px]">Tidak Terdampak</span>
              </div>
            </div>
          </div>
        )}

        {/* Hover Tooltip / Callout Pointer Line */}
        {hoveredItem && (
          activeMenu === "banjir" ? (
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
                <circle cx="6" cy="30" r="4.5" fill="#FFFFFF" stroke="#EE3B3B" strokeWidth="2.5" />
                <line x1="8" y1="28" x2="34" y2="12" stroke="#FFFFFF" strokeWidth="2" markerEnd="url(#calloutArrow)" />
              </svg>

              <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-[20px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] border border-gray-200/90 flex flex-col ml-1">
                <span className="font-black text-[#0F5257] text-[14px] leading-snug" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                  {hoveredItem.rawTitle || hoveredItem.title}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-[#EE3B3B] text-[14px]" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                    4.200 ha
                  </span>
                  <span className="font-semibold text-gray-500 text-[11px]">
                    terdampak
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="fixed z-50 pointer-events-none px-3.5 py-2 rounded-xl bg-gray-900/90 text-white backdrop-blur-md shadow-2xl border border-white/20 text-xs flex flex-col gap-0.5 transition-opacity duration-150"
              style={{
                left: `${tooltipPos.x + 15}px`,
                top: `${tooltipPos.y + 15}px`,
              }}
            >
              <span className="font-bold text-yellow-300 text-sm">{hoveredItem.title}</span>
              <span className="text-gray-300">{hoveredItem.subtitle}</span>
              {hoveredItem.isRed && (
                <span className="text-red-400 font-semibold text-[11px] mt-0.5">⚠️ Wilayah Bencana</span>
              )}
            </div>
          )
        )}

        {/* 3D / 2D Transform Wrapper */}
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) ${
              is3D ? "perspective(1200px) rotateX(25deg) rotateZ(-4deg)" : "rotateX(0deg)"
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
                  fill="#F2E4C4"
                  stroke="#A89678"
                  strokeWidth="1.2"
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
                  let fillColor = isSelectedKec ? "#FF1744" : "#F2E4C4";
                  if (activeMenu === "banjir" && !isSelectedKec) {
                    fillColor = BANJIR_CLASSIFICATION[item.kab] || "#0084FF";
                  } else if (activeMenu === "longsor" && !isSelectedKec) {
                    fillColor = LONGSOR_CLASSIFICATION[item.kab] || "#F97316";
                  }

                  return (
                    <path
                      key={`kec-${item.prov}-${item.kab}-${item.kec}-${idx}`}
                      d={item.path}
                      fill={fillColor}
                      stroke={isSelectedKec ? "#900C0C" : "#D0C2A8"}
                      strokeWidth={isSelectedKec ? 2.2 : 0.4}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="transition-colors duration-200 hover:opacity-85 cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredItem({
                          rawTitle: item.kec,
                          title: `Kec. ${item.kec}`,
                          subtitle: `${item.kab}, ${item.prov}`,
                          isRed: isSelectedKec,
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
                  let isRed = false;

                  if (!provinsi || provinsi === "") {
                    isRed = isProvTarget;
                  } else if (provinsi === kab.prov) {
                    if (!kabupaten || kabupaten === "") {
                      isRed = true;
                    } else {
                      isRed = kab.kab === kabupaten;
                    }
                  }

                  const isKabSelected = kabupaten && kabupaten === kab.kab;
                  let fillColor = "#F2E4C4";

                  if (activeMenu === "banjir") {
                    fillColor = isKabSelected
                      ? "#FF1744"
                      : (BANJIR_CLASSIFICATION[kab.kab] || (isProvTarget ? "#0084FF" : "#F2E4C4"));
                  } else if (activeMenu === "longsor") {
                    fillColor = isKabSelected
                      ? "#FF1744"
                      : (LONGSOR_CLASSIFICATION[kab.kab] || (isProvTarget ? "#F97316" : "#F2E4C4"));
                  } else {
                    fillColor = isRed ? (isKabSelected ? "#FF1744" : "#E33434") : "#F2E4C4";
                  }

                  return (
                    <path
                      key={`kab-${kab.prov}-${kab.kab}`}
                      d={kab.path}
                      fill={fillColor}
                      stroke={isRed ? "#900C0C" : "#A89678"}
                      strokeWidth={isRed ? 1.4 : 0.8}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="transition-colors duration-200 hover:opacity-85 cursor-pointer"
                      onMouseEnter={(e) => {
                        setHoveredItem({ rawTitle: kab.kab, title: kab.kab, subtitle: kab.prov, isRed });
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