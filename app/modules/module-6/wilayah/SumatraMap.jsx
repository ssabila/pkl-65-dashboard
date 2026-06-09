"use client";

import { useState, useRef } from "react";

/**
 * Interactive SVG map of Sumatra showing kabupaten/kota as colored dots.
 * Color-coded by CRS risk status with hover tooltips.
 */
export default function SumatraMap({ data, provinsiKey }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const mapRef = useRef(null);

  // Color by status
  function getColor(status) {
    switch (status) {
      case "Sangat Tinggi":
        return "#8e2424";
      case "Tinggi":
        return "#c0392b";
      case "Sedang":
        return "#e67e22";
      case "Rendah":
        return "#27ae60";
      default:
        return "#bdc3c7";
    }
  }

  // Generate representative dot positions on the Sumatra outline
  // These are approximate lat/lng mapped to SVG coordinates
  function getRegionPositions() {
    const positions = {
      aceh: [
        { x: 165, y: 40 }, { x: 140, y: 60 }, { x: 155, y: 80 },
        { x: 130, y: 90 }, { x: 175, y: 55 }, { x: 150, y: 100 },
        { x: 120, y: 75 }, { x: 160, y: 70 }, { x: 145, y: 50 },
        { x: 170, y: 65 },
      ],
      sumut: [
        { x: 125, y: 120 }, { x: 110, y: 140 }, { x: 135, y: 135 },
        { x: 120, y: 155 }, { x: 145, y: 150 }, { x: 100, y: 160 },
        { x: 130, y: 170 }, { x: 115, y: 130 }, { x: 140, y: 145 },
        { x: 105, y: 150 }, { x: 125, y: 165 }, { x: 150, y: 160 },
        { x: 135, y: 175 }, { x: 155, y: 140 },
      ],
      sumbar: [
        { x: 95, y: 190 }, { x: 80, y: 210 }, { x: 105, y: 205 },
        { x: 90, y: 225 }, { x: 115, y: 220 }, { x: 75, y: 235 },
        { x: 100, y: 240 }, { x: 85, y: 250 }, { x: 110, y: 230 },
        { x: 70, y: 215 }, { x: 95, y: 260 }, { x: 120, y: 210 },
      ],
    };

    const result = [];
    data.forEach((item, i) => {
      const posArr = positions[item.provinsi_key];
      if (posArr) {
        const idx = data
          .filter((d) => d.provinsi_key === item.provinsi_key)
          .indexOf(item);
        const pos = posArr[idx % posArr.length];
        if (pos) {
          result.push({ ...item, cx: pos.x, cy: pos.y });
        }
      }
    });
    return result;
  }

  const regions = getRegionPositions();

  function handleMouseMove(e, item) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 10,
      });
    }
    setTooltipData(item);
    setHoveredId(item.KDPKAB);
  }

  return (
    <div className="m6-map-container" ref={mapRef}>
      <svg viewBox="0 0 280 400" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        {/* Water background */}
        <defs>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b9cc4" />
            <stop offset="100%" stopColor="#a5c8e0" />
          </linearGradient>
          <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="2" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,0.15)" />
          </filter>
        </defs>
        <rect width="280" height="400" fill="url(#waterGrad)" />

        {/* Sumatra outline path (simplified) */}
        <path
          d="M175,20 C180,25 185,30 182,40 C180,48 178,52 176,58
             C174,64 172,68 170,74 C168,78 165,82 163,88
             C160,94 158,98 155,104 C152,108 150,112 148,118
             C145,124 142,128 140,134 C138,138 135,142 133,148
             C130,154 128,158 126,164 C123,170 120,176 118,182
             C115,188 112,194 110,200 C108,206 105,210 102,216
             C100,222 97,226 95,232 C92,238 90,242 87,248
             C85,254 82,258 80,264 C77,270 75,276 73,282
             C70,288 68,294 65,300 C63,306 62,310 60,316
             C58,322 57,328 56,334 C55,340 55,346 56,352
             C57,356 59,358 62,360 C66,362 70,363 75,362
             C80,360 85,357 90,354 C95,350 100,346 105,342
             C110,338 115,334 120,328 C125,322 128,316 132,310
             C136,304 138,298 142,292 C146,286 148,280 152,274
             C155,268 157,262 160,256 C162,250 164,244 166,238
             C168,232 170,226 172,220 C174,214 176,208 177,202
             C178,196 179,190 180,184 C181,178 181,172 181,166
             C181,160 180,154 180,148 C179,142 178,136 178,130
             C178,124 178,118 178,112 C178,106 178,100 178,94
             C178,88 178,82 178,76 C178,70 178,64 177,58
             C177,52 176,46 176,40 C176,34 175,28 175,20Z"
          fill="#e8e8e8"
          stroke="#fff"
          strokeWidth="1.5"
          filter="url(#mapShadow)"
          opacity="0.85"
        />

        {/* Province boundaries (simplified lines) */}
        <line x1="168" y1="105" x2="100" y2="115" stroke="#ff8c42" strokeWidth="1.8" opacity="0.7" />
        <line x1="155" y1="180" x2="85" y2="185" stroke="#ff8c42" strokeWidth="1.8" opacity="0.7" />

        {/* Province labels */}
        <text x="155" y="70" fontSize="9" fill="#3a4a5c" fontWeight="600" opacity="0.5">Aceh</text>
        <text x="140" y="150" fontSize="9" fill="#3a4a5c" fontWeight="600" opacity="0.5">Sumut</text>
        <text x="90" y="225" fontSize="9" fill="#3a4a5c" fontWeight="600" opacity="0.5">Sumbar</text>

        {/* Region dots */}
        {regions.map((item) => (
          <g key={item.KDPKAB}>
            <circle
              cx={item.cx}
              cy={item.cy}
              r={hoveredId === item.KDPKAB ? 9 : 6}
              fill={getColor(item.status_crs)}
              stroke="#fff"
              strokeWidth="1.5"
              opacity={hoveredId === item.KDPKAB ? 1 : 0.85}
              style={{
                cursor: "pointer",
                transition: "r 0.2s ease, opacity 0.2s ease",
              }}
              onMouseMove={(e) => handleMouseMove(e, item)}
              onMouseLeave={() => {
                setHoveredId(null);
                setTooltipData(null);
              }}
            />
          </g>
        ))}

        {/* Highlight rectangle for selected region */}
        {provinsiKey !== "all" && (
          <rect
            x={
              provinsiKey === "aceh" ? 110 : provinsiKey === "sumut" ? 90 : 60
            }
            y={
              provinsiKey === "aceh" ? 25 : provinsiKey === "sumut" ? 110 : 180
            }
            width={provinsiKey === "aceh" ? 85 : provinsiKey === "sumut" ? 80 : 75}
            height={provinsiKey === "aceh" ? 85 : provinsiKey === "sumut" ? 80 : 90}
            fill="none"
            stroke="#ff8c42"
            strokeWidth="2"
            strokeDasharray="4,3"
            rx="6"
            opacity="0.8"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="14"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        )}
      </svg>

      {/* Custom tooltip */}
      {tooltipData && (
        <div
          className="m6-tooltip"
          style={{
            position: "absolute",
            top: tooltipPos.y,
            left: tooltipPos.x,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <div className="m6-tooltip__name">{tooltipData.WADMKK}</div>
          <div className="m6-tooltip__row">
            <span className="m6-tooltip__label">CRS:</span>
            <span className="m6-tooltip__value">
              {(tooltipData.norm_crs * 100).toFixed(1)}%
            </span>
          </div>
          <div className="m6-tooltip__row">
            <span className="m6-tooltip__label">Status:</span>
            <span className="m6-tooltip__value">{tooltipData.status_crs}</span>
          </div>
          <div className="m6-tooltip__row">
            <span className="m6-tooltip__label">Hazard:</span>
            <span className="m6-tooltip__value">
              {(tooltipData.indeks_hazard * 100).toFixed(1)}%
            </span>
          </div>
          <div className="m6-tooltip__row">
            <span className="m6-tooltip__label">Exposure:</span>
            <span className="m6-tooltip__value">
              {(tooltipData.indeks_exposure * 100).toFixed(1)}%
            </span>
          </div>
          <div className="m6-tooltip__row">
            <span className="m6-tooltip__label">Vulnerability:</span>
            <span className="m6-tooltip__value">
              {(tooltipData.indeks_kerentanan * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      {/* Map legend */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: 12,
          display: "flex",
          gap: 10,
          background: "rgba(255,255,255,0.85)",
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: "0.72rem",
          fontWeight: 500,
          color: "#3a4a5c",
          backdropFilter: "blur(4px)",
        }}
      >
        {[
          { label: "Rendah", color: "#27ae60" },
          { label: "Sedang", color: "#e67e22" },
          { label: "Tinggi", color: "#c0392b" },
          { label: "S. Tinggi", color: "#8e2424" },
        ].map((l) => (
          <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: l.color,
                display: "inline-block",
              }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}
