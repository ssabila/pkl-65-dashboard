import { C, BUILDINGS, BRIDGES, BUBBLES } from "../data/constants";

/* ─────────────────────────────────────────
   SUMATRA SVG MAP COMPONENT
   Simplified 3-province visualization
───────────────────────────────────────── */
export default function SumatraMap({
  showWater = false,
  waterOpacity = 0.45,
  showDamaged = false,
  showRoads = false,
  roadAnimated = false,
  showBridges = false,
  showBubbles = false,
  dark = false,
}) {
  const bg = dark ? "#0a0f1a" : "#E8EBEF";
  const provinceFill = dark ? "#1a2440" : "#D2DCE6";
  const provinceStroke = dark ? "#334466" : "#BCC8D4";
  const mountainFill = dark ? "#152035" : "#C5D2DC";
  const waterFill = dark ? "#1a3050" : "#C8DCF0";

  return (
    <svg
      viewBox="0 0 400 500"
      className="w-full h-full"
      style={{ background: bg, transition: "background 0.8s ease" }}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id="glow-orange">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-red">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6D9DC5" />
          <stop offset="100%" stopColor="#4A7FA8" />
        </linearGradient>
        <pattern id="wavePattern" x="0" y="0" width="40" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 Q10 0 20 5 Q30 10 40 5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        </pattern>
        <clipPath id="waterClip">
          <rect x="0" y="0" width="400" height="500" />
        </clipPath>
      </defs>

      {/* Ocean background hint */}
      <rect x="0" y="0" width="400" height="500" fill={dark ? "#0a0f1a" : "#D8E8F4"} />

      {/* ── Province shapes ── */}
      {/* Aceh */}
      <path
        d="M 150,20 L 210,12 L 252,30 L 258,58 L 238,88 L 200,108 L 162,106 L 130,88 L 122,58 L 138,32 Z"
        fill={provinceFill}
        stroke={provinceStroke}
        strokeWidth="1.5"
      />
      {/* Sumatera Utara */}
      <path
        d="M 118,85 L 200,108 L 258,58 L 280,100 L 272,165 L 244,205 L 200,222 L 158,218 L 122,190 L 105,145 Z"
        fill={provinceFill}
        stroke={provinceStroke}
        strokeWidth="1.5"
      />
      {/* Sumatera Barat */}
      <path
        d="M 122,190 L 200,222 L 215,275 L 202,330 L 170,355 L 140,345 L 118,305 L 108,255 Z"
        fill={provinceFill}
        stroke={provinceStroke}
        strokeWidth="1.5"
      />

      {/* Mountain ridges (Bukit Barisan hint) */}
      <path
        d="M 185,30 L 220,55 L 240,90 L 235,140 L 220,180 L 205,220 L 195,265 L 185,310"
        fill="none"
        stroke={mountainFill}
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Rivers */}
      <path d="M 200,85 Q 215,120 230,150" fill="none" stroke={waterFill} strokeWidth="2" opacity="0.6" />
      <path d="M 175,160 Q 190,200 185,240" fill="none" stroke={waterFill} strokeWidth="1.5" opacity="0.6" />
      <path d="M 135,100 Q 145,130 150,165" fill="none" stroke={waterFill} strokeWidth="1.5" opacity="0.5" />

      {/* Province labels */}
      {!dark && (
        <>
          <text x="190" y="65" textAnchor="middle" fontSize="10" fill={C.navy} opacity="0.5" fontFamily="sans-serif">ACEH</text>
          <text x="195" y="158" textAnchor="middle" fontSize="10" fill={C.navy} opacity="0.5" fontFamily="sans-serif">SUMUT</text>
          <text x="165" y="275" textAnchor="middle" fontSize="9" fill={C.navy} opacity="0.5" fontFamily="sans-serif">SUMBAR</text>
        </>
      )}

      {/* ── Water flood overlay ── */}
      {showWater && (
        <g>
          <path
            d="M 145,130 L 200,125 L 250,145 L 255,180 L 235,200 L 200,205 L 165,198 L 140,175 Z"
            fill="url(#waterGrad)"
            opacity={waterOpacity}
            style={{ transition: "opacity 1s ease" }}
          />
          <path
            d="M 145,130 L 200,125 L 250,145 L 255,180 L 235,200 L 200,205 L 165,198 L 140,175 Z"
            fill="url(#wavePattern)"
            opacity={waterOpacity * 0.6}
          />
          <ellipse cx="160" cy="240" rx="28" ry="18" fill="url(#waterGrad)" opacity={waterOpacity * 0.8} />
          <ellipse cx="220" cy="260" rx="22" ry="14" fill="url(#waterGrad)" opacity={waterOpacity * 0.7} />
        </g>
      )}

      {/* ── Building dots ── */}
      {BUILDINGS.map((b) => {
        const cx = (b.cx / 100) * 400;
        const cy = (b.cy / 100) * 500;
        let fill = dark ? "#334466" : "#8BA0B0";
        if (showDamaged && b.damaged) fill = C.red;
        else if (showWater && b.flooded) fill = C.blue;
        return (
          <g key={b.id}>
            <circle cx={cx} cy={cy} r={3} fill={fill} opacity={0.8} style={{ transition: "fill 0.5s ease" }} />
            {showDamaged && b.damaged && (
              <circle
                cx={cx} cy={cy} r={8}
                fill="none"
                stroke={C.red}
                strokeWidth="1"
                opacity="0"
                style={{ animation: `ping 2s ease ${(b.id % 5) * 0.3}s infinite` }}
              />
            )}
          </g>
        );
      })}

      {/* ── Road network ── */}
      {showRoads && (
        <g>
          {[
            { x1: 190, y1: 30, x2: 210, y2: 80, damaged: false },
            { x1: 210, y1: 80, x2: 245, y2: 135, damaged: true },
            { x1: 245, y1: 135, x2: 255, y2: 175, damaged: false },
            { x1: 175, y1: 55, x2: 180, y2: 120, damaged: true },
            { x1: 180, y1: 120, x2: 175, y2: 180, damaged: false },
            { x1: 175, y1: 180, x2: 170, y2: 240, damaged: true },
            { x1: 140, y1: 100, x2: 155, y2: 155, damaged: false },
            { x1: 155, y1: 155, x2: 150, y2: 215, damaged: true },
            { x1: 150, y1: 215, x2: 145, y2: 270, damaged: false },
            { x1: 200, y1: 108, x2: 195, y2: 175, damaged: true },
            { x1: 122, y1: 165, x2: 125, y2: 225, damaged: false },
            { x1: 265, y1: 100, x2: 255, y2: 155, damaged: true },
          ].map((r, i) => (
            <line
              key={i}
              x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
              stroke={r.damaged ? C.orange : C.teal}
              strokeWidth={r.damaged ? 2.5 : 1.5}
              strokeLinecap="round"
              opacity={r.damaged ? 0.9 : 0.6}
              strokeDasharray={roadAnimated ? "none" : "1000"}
              strokeDashoffset={roadAnimated ? 0 : 1000}
              style={{
                filter: r.damaged ? `drop-shadow(0 0 4px ${C.orange})` : "none",
                transition: "stroke-dashoffset 1.5s ease, stroke 0.5s ease",
                strokeDashoffset: roadAnimated ? 0 : 1000,
              }}
            />
          ))}
        </g>
      )}

      {/* ── Bridge damage markers ── */}
      {showBridges && BRIDGES.map((br) => {
        const cx = (br.cx / 100) * 400;
        const cy = (br.cy / 100) * 500;
        return (
          <g key={br.id} transform={`translate(${cx},${cy})`}>
            <circle r={14} fill="none" stroke={C.red} strokeWidth="1.5" opacity="0"
              style={{ animation: `ping 1.5s ease ${br.id * 0.2}s infinite` }} />
            <circle r={20} fill="none" stroke={C.red} strokeWidth="1" opacity="0"
              style={{ animation: `ping 1.5s ease ${br.id * 0.2 + 0.4}s infinite` }} />
            <line x1={-7} y1={-7} x2={7} y2={7} stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
            <line x1={7} y1={-7} x2={-7} y2={7} stroke={C.red} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      })}

      {/* ── Bubble isolasi ── */}
      {showBubbles && BUBBLES.map((b, i) => {
        const cx = (b.x / 100) * 400;
        const cy = (b.y / 100) * 500;
        const r = b.r * 0.35;
        return (
          <g key={b.id}>
            <circle cx={cx} cy={cy} r={r * 2} fill="none" stroke={C.orange} strokeWidth="0.5" opacity="0"
              style={{ animation: `radarSvg 3s ease ${i * 0.3}s infinite` }} />
            <circle cx={cx} cy={cy} r={r} fill={C.orange} opacity="0.45"
              style={{ animation: `breatheSvg ${3 + i * 0.15}s ease ${i * 0.05}s infinite` }} />
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fill="#fff" fontFamily="sans-serif" fontWeight="600">{b.count}</text>
          </g>
        );
      })}

      {/* SVG keyframes */}
      <style>{`
        @keyframes ping {
          0% { r: 3px; opacity: 0.8; }
          100% { r: 20px; opacity: 0; }
        }
        @keyframes radarSvg {
          0% { r: 5px; opacity: 0.7; }
          100% { r: 60px; opacity: 0; }
        }
        @keyframes breatheSvg {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </svg>
  );
}
