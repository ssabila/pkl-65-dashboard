"use client";

import React, { useState } from "react";

// Coordinates are relative percentage positions (x, y) on our custom SVG map container
const regencyCoordinates = {
  "Simeulue": { x: 15, y: 35, color: "text-accent-warning" },
  "Aceh Singkil": { x: 28, y: 45, color: "text-accent-danger" },
  "Aceh Selatan": { x: 25, y: 38, color: "text-accent-danger" },
  "Kota Gunungsitoli": { x: 26, y: 62, color: "text-accent-danger" },
  "Tapanuli Selatan": { x: 48, y: 65, color: "text-accent-danger" },
  "Asahan": { x: 58, y: 52, color: "text-accent-danger" },
  "Pasaman": { x: 58, y: 75, color: "text-accent-danger" },
  "Agam": { x: 62, y: 82, color: "text-accent-primary" },
  "Lima Puluh Kota": { x: 72, y: 80, color: "text-accent-warning" },
  "Padang Pariaman": { x: 64, y: 88, color: "text-accent-danger" }
};

export default function InteractiveMap({ selectedProvinsi, selectedKabupaten, onSelectKabupaten, dataKerentanan }) {
  const [hoveredRegency, setHoveredRegency] = useState(null);

  // Group coordinates and vulnerability indices together
  const mapMarkers = dataKerentanan.map(item => {
    const coords = regencyCoordinates[item.kabupaten] || { x: 50, y: 50 };
    return {
      ...item,
      x: coords.x,
      y: coords.y
    };
  });

  // Filter markers based on selected province
  const filteredMarkers = mapMarkers.filter(marker => {
    if (selectedProvinsi && selectedProvinsi !== "Semua Provinsi") {
      return marker.provinsi === selectedProvinsi;
    }
    return true;
  });

  return (
    <div className="relative w-full h-[450px] bg-slate-950 rounded-xl border border-card-border overflow-hidden shadow-inner flex flex-col justify-between p-4">
      {/* Map Header */}
      <div className="z-10 bg-slate-900/80 backdrop-blur-xs p-3 rounded-lg border border-slate-800 max-w-sm">
        <h5 className="text-white text-sm font-heading flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-danger animate-pulse"></span>
          Peta Indeks Kerentanan Bencana Sumatra
        </h5>
        <p className="text-slate-400 text-xs mt-1 font-sans">
          Klik pin kabupaten untuk melihat detail profil kerentanan atau gunakan filter dropdown di atas.
        </p>
      </div>

      {/* SVG Canvas Map Representation */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full opacity-30 object-contain text-slate-800 p-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {/* Abstract path representing Sumatra outline (North-West to South-East direction) */}
          <path
            d="M 120 80 
               C 150 60, 200 70, 250 110 
               C 280 130, 320 180, 380 240 
               C 420 280, 480 340, 520 380 
               C 560 420, 620 460, 680 500 
               C 720 530, 750 560, 720 580 
               C 680 600, 600 560, 550 510 
               C 500 460, 440 400, 380 340 
               C 320 280, 260 220, 200 180 
               C 160 150, 110 110, 100 95 
               Z"
            fill="rgba(42, 139, 126, 0.05)"
            stroke="rgba(91, 143, 191, 0.3)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          {/* Simeulue Island Mockup */}
          <path
            d="M 80 180 C 70 190, 60 220, 90 230 C 110 210, 100 190, 80 180 Z"
            fill="rgba(91, 143, 191, 0.1)"
            stroke="rgba(91, 143, 191, 0.3)"
            strokeWidth="2"
          />
          {/* Nias Island Mockup */}
          <path
            d="M 160 360 C 140 370, 150 410, 180 400 C 190 380, 180 365, 160 360 Z"
            fill="rgba(91, 143, 191, 0.1)"
            stroke="rgba(91, 143, 191, 0.3)"
            strokeWidth="2"
          />
          {/* Grid lines for coordinate mapping */}
          <line x1="50" y1="0" x2="50" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="100" y1="0" x2="100" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="200" y1="0" x2="200" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="300" y1="0" x2="300" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="400" y1="0" x2="400" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="500" y1="0" x2="500" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="600" y1="0" x2="600" y2="600" stroke="rgba(255,255,255,0.02)" />
          <line x1="700" y1="0" x2="700" y2="600" stroke="rgba(255,255,255,0.02)" />
        </svg>

        {/* Region Labels */}
        <div className="absolute top-[18%] left-[26%] text-slate-500 font-heading text-xs uppercase tracking-widest font-semibold opacity-70">
          Aceh
        </div>
        <div className="absolute top-[48%] left-[48%] text-slate-500 font-heading text-xs uppercase tracking-widest font-semibold opacity-70">
          Sumatera Utara
        </div>
        <div className="absolute top-[75%] left-[68%] text-slate-500 font-heading text-xs uppercase tracking-widest font-semibold opacity-70">
          Sumatera Barat
        </div>
      </div>

      {/* Markers Layer (Clickable & Hoverable) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {filteredMarkers.map((marker) => {
          const isSelected = selectedKabupaten === marker.kabupaten;
          const isHovered = hoveredRegency === marker.kabupaten;

          // Determine marker color based on vulnerability status
          let statusColor = "bg-accent-secondary"; // Rendah / Sedang
          if (marker.status === "Tinggi") {
            statusColor = "bg-accent-warning";
          } else if (marker.status === "Sangat Tinggi") {
            statusColor = "bg-accent-danger";
          }

          return (
            <button
              key={marker.kabupaten}
              className="absolute pointer-events-auto group focus:outline-none -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              onClick={() => onSelectKabupaten(marker.kabupaten)}
              onMouseEnter={() => setHoveredRegency(marker.kabupaten)}
              onMouseLeave={() => setHoveredRegency(null)}
            >
              {/* Pulse ripple for selected or highly vulnerable markers */}
              {(isSelected || marker.status === "Sangat Tinggi") && (
                <span className={`absolute inline-flex h-6 w-6 rounded-full ${statusColor} opacity-40 animate-ping -left-1.5 -top-1.5`}></span>
              )}

              {/* Pin Point */}
              <div
                className={`w-3.5 h-3.5 rounded-full border border-white shadow-lg transition-all duration-300 ${statusColor} ${
                  isSelected ? "scale-150 ring-4 ring-white/20" : "group-hover:scale-125"
                }`}
              ></div>

              {/* Minimalist tooltip */}
              <div
                className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white border border-slate-700 px-2 py-1 rounded text-xxs font-sans whitespace-nowrap pointer-events-none transition-all duration-200 ${
                  isSelected || isHovered ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-1 invisible"
                }`}
              >
                <div className="font-semibold text-white">{marker.kabupaten}</div>
                <div className="text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span>Indeks: {marker.indeks}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                  <span className={
                    marker.status === "Sangat Tinggi" ? "text-accent-danger font-bold" :
                    marker.status === "Tinggi" ? "text-accent-warning font-semibold" : "text-accent-secondary"
                  }>
                    {marker.status}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating Info Overlay (Bottom-left/Right) */}
      <div className="z-10 flex w-full justify-between items-end mt-auto pointer-events-none">
        {/* Legend */}
        <div className="bg-slate-900/80 backdrop-blur-xs px-3 py-2 rounded-lg border border-slate-800 text-xxs text-slate-400 flex flex-col gap-1 pointer-events-auto">
          <span className="font-semibold text-white mb-0.5">Indeks Kerentanan</span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-secondary"></span>
            <span>Rendah / Sedang</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-warning"></span>
            <span>Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-danger"></span>
            <span>Sangat Tinggi</span>
          </div>
        </div>

        {/* Selected Area Detail Quickview */}
        {selectedKabupaten && (
          <div className="bg-slate-900/95 backdrop-blur-xs p-3 rounded-lg border border-accent-primary max-w-[240px] text-xs text-white shadow-xl pointer-events-auto">
            {(() => {
              const selectedData = dataKerentanan.find(d => d.kabupaten === selectedKabupaten);
              if (!selectedData) return null;
              return (
                <div>
                  <div className="flex justify-between items-center gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
                    <span className="font-heading font-bold text-white text-[11px] truncate">{selectedData.kabupaten}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      selectedData.status === "Sangat Tinggi" ? "bg-accent-danger/20 text-accent-danger" :
                      selectedData.status === "Tinggi" ? "bg-accent-warning/20 text-accent-warning" : "bg-accent-secondary/20 text-accent-secondary"
                    }`}>
                      {selectedData.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-sans text-slate-300 text-[10px]">
                    <div>Banjir: <strong className="text-white">{selectedData.banjir}x</strong></div>
                    <div>Longsor: <strong className="text-white">{selectedData.longsor}x</strong></div>
                    <div>Miskin: <strong className="text-white">{selectedData.miskinPct}%</strong></div>
                    <div>Faskes: <strong className="text-white">{selectedData.faskes} unit</strong></div>
                  </div>
                  <div className="mt-2 text-[10px] text-accent-primary font-semibold text-center border-t border-slate-850 pt-1.5">
                    Indeks: {selectedData.indeks}
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
