"use client";

import React, { useState, useEffect } from "react";

// Helper to normalize names for robust matching
function normalizeName(str) {
  if (!str) return "";
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Calculate centroid of a GeoJSON geometry (Polygon or MultiPolygon)
function getGeometryCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return [98, 3];
  let sumLon = 0, sumLat = 0, count = 0;

  const processRing = (ring) => {
    ring.forEach(([lon, lat]) => {
      sumLon += lon;
      sumLat += lat;
      count++;
    });
  };

  if (geometry.type === "Polygon") {
    geometry.coordinates.forEach(processRing);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((poly) => poly.forEach(processRing));
  }

  if (count === 0) return [98, 3];
  return [sumLon / count, sumLat / count];
}

export default function InteractiveMap({ selectedProvinsi, selectedKabupaten, onSelectKabupaten, dataKerentanan = [] }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load GeoJSON map
  useEffect(() => {
    fetch("/data/peta_kerentanan.geojson")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("GeoJSON not found");
      })
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.log("GeoJSON map load error:", err));
  }, []);

  // Helper to project GeoJSON (lon, lat) to SVG canvas coordinates (800x600)
  const projectPoint = ([lon, lat]) => {
    const px = ((lon - 94.5) / (101.5 - 94.5)) * 740 + 30;
    const py = ((6.5 - lat) / (6.5 - (-3.5))) * 520 + 45;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  };

  const projectPointObj = ([lon, lat]) => {
    const px = ((lon - 94.5) / (101.5 - 94.5)) * 740 + 30;
    const py = ((6.5 - lat) / (6.5 - (-3.5))) * 520 + 45;
    return { x: px, y: py };
  };

  // Convert GeoJSON geometry to SVG Path string
  const renderGeometryPath = (geometry) => {
    if (!geometry || !geometry.coordinates) return "";
    const renderRing = (ring) => "M" + ring.map(projectPoint).join("L") + "Z";

    if (geometry.type === "Polygon") {
      return geometry.coordinates.map(renderRing).join(" ");
    } else if (geometry.type === "MultiPolygon") {
      return geometry.coordinates.flatMap((poly) => poly.map(renderRing)).join(" ");
    }
    return "";
  };

  // Mouse move handler for smooth tooltip tracking
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      className="relative w-full h-[540px] bg-[#e0f2fe] rounded-2xl border border-sky-200/90 shadow-xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 select-none"
      onMouseMove={handleMouseMove}
    >
      {/* Top Header Layer (Compact Floating Glassmorphism Pill) */}
      <div className="z-10 flex items-center justify-between gap-3 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-sky-200/80 shadow-md pointer-events-auto flex items-center gap-2.5 text-xs text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0f8575] animate-pulse"></span>
          <span className="font-heading font-bold text-slate-900">Peta Interaktif Kerentanan Wilayah</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 text-[11px] font-sans">Arahkan kursor / klik kabupaten</span>
        </div>

        {/* Selected Province Badge */}
        {selectedProvinsi && selectedProvinsi !== "Semua Provinsi" && (
          <div className="bg-[#0f8575]/10 border border-[#0f8575]/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[#0f8575] font-sans text-xs font-bold shadow-sm pointer-events-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0f8575]"></span>
            Fokus: {selectedProvinsi}
          </div>
        )}
      </div>

      {/* SVG Canvas Map Container */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center p-2">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full object-contain"
          fill="none"
        >
          <defs>
            <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="0.75" strokeDasharray="3 3" />
            </pattern>
          </defs>

          {/* Seamless Grid Layer */}
          <rect width="800" height="600" fill="url(#mapGrid)" />

          {/* Vector Map Features Layer */}
          {geoJsonData && geoJsonData.features ? (
            geoJsonData.features.map((feature, idx) => {
              const rawName = feature.properties?.NAME_2 || "";
              const rawProv = feature.properties?.NAME_1 || "";

              // Find matching entry from dataKerentanan
              const matchData = dataKerentanan.find((k) =>
                normalizeName(k.rawKabupaten) === normalizeName(rawName) ||
                normalizeName(k.kabupaten) === normalizeName(rawName)
              );

              const status = matchData?.status || feature.properties?.["Data Ind11"] || "Sedang";
              const kabName = matchData?.kabupaten || rawName;
              const provName = matchData?.provinsi || (rawProv.includes("Sumatera Utara") ? "Sumatera Utara" : rawProv.includes("Sumatera Barat") ? "Sumatera Barat" : "Aceh");

              // Filter check: is this regency inside the selected province?
              const isProvinceActive =
                !selectedProvinsi ||
                selectedProvinsi === "Semua Provinsi" ||
                provName === selectedProvinsi;

              const isSelected = selectedKabupaten === kabName;
              const isHovered = hoveredFeature?.kabName === kabName;

              // Special handling for water bodies (Lake Toba)
              const isWaterBody = rawName.toLowerCase().includes("lake") || rawName.toLowerCase().includes("danau");
              if (isWaterBody) {
                return (
                  <path
                    key={idx}
                    d={renderGeometryPath(feature.geometry)}
                    fill="rgba(2, 132, 199, 0.45)"
                    stroke="#0284c7"
                    strokeWidth="1.2"
                    className="pointer-events-auto cursor-default"
                    onMouseEnter={() =>
                      setHoveredFeature({
                        kabName: "Danau Toba",
                        provName: "Sumatera Utara",
                        status: "Danau / Perairan",
                        indeks: "-",
                        isWater: true
                      })
                    }
                    onMouseLeave={() => setHoveredFeature(null)}
                  />
                );
              }

              // Color mapping per vulnerability status (Vibrant & Crisp over Light Ocean BG)
              let fillColor = "rgba(234, 179, 8, 0.7)"; // Sedang (Amber Yellow)
              let strokeColor = "rgba(180, 83, 9, 0.6)";
              let dotColor = "#d97706";

              if (status === "Sangat Tinggi") {
                fillColor = "rgba(239, 68, 68, 0.78)"; // Vibrant Red
                strokeColor = "rgba(185, 28, 28, 0.85)";
                dotColor = "#dc2626";
              } else if (status === "Tinggi") {
                fillColor = "rgba(249, 115, 22, 0.75)"; // Warm Orange
                strokeColor = "rgba(194, 65, 12, 0.8)";
                dotColor = "#ea580c";
              } else if (status === "Rendah") {
                fillColor = "rgba(16, 185, 129, 0.7)"; // Emerald Green
                strokeColor = "rgba(4, 120, 87, 0.8)";
                dotColor = "#059669";
              }

              // Dim non-selected provinces
              let opacity = isProvinceActive ? 1 : 0.2;
              if (isSelected || isHovered) {
                fillColor = fillColor.replace(/0\.\d+/, "0.95");
                strokeColor = "#0f172a";
                opacity = 1;
              }

              // Centroid for SVG pinned marker
              const centroid = getGeometryCentroid(feature.geometry);
              const point = projectPointObj(centroid);

              return (
                <g key={idx} className="transition-all duration-200">
                  {/* Regency Polygon Path */}
                  <path
                    d={renderGeometryPath(feature.geometry)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? "2.5" : isHovered ? "1.8" : "0.75"}
                    opacity={opacity}
                    className="cursor-pointer transition-all duration-200 hover:brightness-110"
                    onClick={() => onSelectKabupaten(kabName)}
                    onMouseEnter={() =>
                      setHoveredFeature({
                        kabName,
                        provName,
                        status,
                        indeks: matchData?.indeks ?? "-",
                        banjir: matchData?.banjir ?? 0,
                        longsor: matchData?.longsor ?? 0,
                        miskinPct: matchData?.miskinPct ?? 0,
                        faskes: matchData?.faskes ?? 0
                      })
                    }
                    onMouseLeave={() => setHoveredFeature(null)}
                  />

                  {/* SVG Centroid Marker Pin */}
                  {isProvinceActive && (
                    <g
                      transform={`translate(${point.x}, ${point.y})`}
                      className="cursor-pointer pointer-events-none"
                    >
                      {/* Animated Pulse Ring for Selected or Highly Vulnerable */}
                      {(isSelected || isHovered || status === "Sangat Tinggi") && (
                        <circle
                          r="9"
                          fill={dotColor}
                          opacity="0.4"
                          className="animate-ping"
                        />
                      )}

                      {/* Main Marker Dot */}
                      <circle
                        r={isSelected ? "5" : isHovered ? "4.5" : "3"}
                        fill={dotColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected || isHovered ? "1.5" : "0.8"}
                        className="transition-all duration-200 shadow-md"
                      />
                    </g>
                  )}
                </g>
              );
            })
          ) : (
            /* Sleek Loading Fallback */
            <g>
              <text x="400" y="300" textAnchor="middle" fill="#64748b" fontSize="14" fontFamily="sans-serif">
                Memuat Peta Vektor GeoJSON...
              </text>
            </g>
          )}

          {/* Cartographic Province Labels (Rendered on top with crisp white outline) */}
          <g className="pointer-events-none select-none">
            {/* ACEH */}
            <text
              x="180"
              y="100"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="3.5"
              paintOrder="stroke fill"
              fontSize="13"
              fontWeight="800"
              letterSpacing="3"
              opacity="0.9"
              fontFamily="sans-serif"
            >
              ACEH
            </text>

            {/* SUMATERA UTARA */}
            <text
              x="340"
              y="235"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="3.5"
              paintOrder="stroke fill"
              fontSize="13"
              fontWeight="800"
              letterSpacing="3"
              opacity="0.9"
              fontFamily="sans-serif"
            >
              SUMATERA UTARA
            </text>

            {/* SUMATERA BARAT */}
            <text
              x="530"
              y="445"
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth="3.5"
              paintOrder="stroke fill"
              fontSize="13"
              fontWeight="800"
              letterSpacing="3"
              opacity="0.9"
              fontFamily="sans-serif"
            >
              SUMATERA BARAT
            </text>
          </g>
        </svg>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredFeature && (
        <div
          className="pointer-events-none absolute z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl px-3.5 py-2 text-white shadow-2xl flex items-center gap-2.5 whitespace-nowrap transition-all duration-75"
          style={{
            left: `${mousePos.x > 550 ? mousePos.x - 210 : mousePos.x + 22}px`,
            top: `${mousePos.y < 60 ? mousePos.y + 24 : mousePos.y - 54}px`
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-xs text-white">
              {hoveredFeature.kabName}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hoveredFeature.isWater
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : hoveredFeature.status === "Sangat Tinggi"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : hoveredFeature.status === "Tinggi"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : hoveredFeature.status === "Sedang"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}
            >
              {hoveredFeature.status}
            </span>
          </div>

          {!hoveredFeature.isWater && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-sans border-l border-slate-700 pl-2">
              <span className="text-slate-400">{hoveredFeature.provName}</span>
              <span className="text-slate-500">•</span>
              <span>Skor: <strong className="text-emerald-400">{hoveredFeature.indeks}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Info Overlay Layer (Legend & Detail Card) */}
      <div className="z-10 flex w-full justify-between items-end gap-4 pointer-events-none mt-auto">
        {/* Map Legend */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200/90 text-xs text-slate-700 flex flex-col gap-1.5 shadow-lg pointer-events-auto">
          <span className="font-heading font-bold text-slate-900 text-[11px] uppercase tracking-wider">
            Indeks Kerentanan
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-sans font-medium">Rendah</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="font-sans font-medium">Sedang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="font-sans font-medium">Tinggi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="font-sans font-medium">Sangat Tinggi</span>
            </div>
          </div>
        </div>

        {/* Selected Kabupaten Detail Card */}
        {selectedKabupaten && (
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-emerald-500/40 w-full max-w-[270px] text-xs text-slate-800 shadow-xl pointer-events-auto transition-all duration-300">
            {(() => {
              const selectedData = dataKerentanan.find(
                (d) => d.kabupaten === selectedKabupaten
              );
              if (!selectedData) return null;
              return (
                <div>
                  <div className="flex justify-between items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                    <div>
                      <h6 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                        {selectedData.kabupaten}
                      </h6>
                      <p className="text-[10px] text-slate-500 font-sans">
                        {selectedData.provinsi}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${selectedData.status === "Sangat Tinggi"
                        ? "bg-red-500/15 text-red-700 border border-red-500/30"
                        : selectedData.status === "Tinggi"
                          ? "bg-orange-500/15 text-orange-700 border border-orange-500/30"
                          : selectedData.status === "Sedang"
                            ? "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"
                        }`}
                    >
                      {selectedData.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Banjir</span>
                      <strong className="text-slate-900 text-xs">{selectedData.banjir}x</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Longsor</span>
                      <strong className="text-slate-900 text-xs">{selectedData.longsor}x</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Kemiskinan</span>
                      <strong className="text-slate-900 text-xs">{selectedData.miskinPct}%</strong>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-500 text-[10px] block">Faskes</span>
                      <strong className="text-slate-900 text-xs">{selectedData.faskes} unit</strong>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                    <span className="text-slate-500 font-medium">Skor Indeks Total:</span>
                    <span className="font-heading font-black text-[#0f8575] text-xs sm:text-sm">
                      {selectedData.indeks}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
