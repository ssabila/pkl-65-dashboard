"use client";
import { useState } from "react";

// ─── Glass Card ────────────────────────────────────────
export function GlassCard({ children, className = "", style = {} }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.58)",
        backdropFilter: "blur(18px) saturate(1.5)",
        WebkitBackdropFilter: "blur(18px) saturate(1.5)",
        border: "1px solid rgba(255,255,255,0.68)",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(44,62,80,0.09)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────
export function KpiCard({ label, value, change, suffix }) {
  return (
    <GlassCard className="p-4 flex flex-col gap-1">
      <p className="text-[11px] leading-tight" style={{ color: "rgba(44,62,80,0.55)", fontFamily: "var(--font-dm-sans)" }}>
        {label}
      </p>
      <div className="flex items-end gap-2 mt-1 flex-wrap">
        <span className="font-bold leading-none" style={{ fontFamily: "var(--font-garet-heavy)", fontSize: "1.55rem", color: "#2C3E50" }}>
          {value}
        </span>
        {suffix && <span className="text-[11px] mb-0.5" style={{ color: "rgba(44,62,80,0.5)" }}>{suffix}</span>}
        {change && (
          <span className="text-[11px] font-semibold mb-0.5 flex items-center gap-0.5" style={{ color: "#208774" }}>
            {change} ↗
          </span>
        )}
      </div>
    </GlassCard>
  );
}

// ─── Toggle text (Banjir / Longsor / Harian / Bulanan) ─
export function ToggleLabel({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-[12px] transition-all duration-200"
      style={{
        fontFamily: "var(--font-dm-sans)",
        color: active ? "#2C3E50" : "rgba(44,62,80,0.32)",
        fontWeight: active ? "700" : "400",
        letterSpacing: active ? "-0.2px" : "0",
      }}
    >
      {label}
    </button>
  );
}

// ─── Divider between toggles ───────────────────────────
export function ToggleDivider() {
  return <span className="text-[12px]" style={{ color: "rgba(44,62,80,0.2)" }}>|</span>;
}

// ─── Dropdown pill ─────────────────────────────────────
export function DropdownPill({ value, options, onChange, disabled = false, tooltip }) {
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        onMouseEnter={() => disabled && tooltip && setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all"
        style={{
          background: disabled ? "rgba(232,235,239,0.5)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.65)",
          color: disabled ? "rgba(44,62,80,0.3)" : "#2C3E50",
          cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: disabled ? "none" : "0 2px 6px rgba(44,62,80,0.07)",
        }}
      >
        {value}
        <svg viewBox="0 0 10 6" className="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {showTip && tooltip && (
        <div className="absolute left-0 top-full mt-1.5 z-50 rounded-xl px-3 py-2 text-[10px] whitespace-nowrap shadow-lg"
          style={{ background: "rgba(44,62,80,0.85)", backdropFilter: "blur(8px)", color: "#fff" }}>
          {tooltip}
        </div>
      )}

      {open && !disabled && (
        <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-50 min-w-[120px]"
          style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(44,62,80,0.12)" }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[11px] hover:bg-white/60 transition-colors"
              style={{ color: opt === value ? "#6D9DC5" : "#2C3E50", fontWeight: opt === value ? "600" : "400" }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Risk dot legend ───────────────────────────────────
export function RiskLegend() {
  const levels = [
    { label: "Rendah",  color: "#208774" },
    { label: "Sedang",  color: "#F4B836" },
    { label: "Tinggi",  color: "#F47C36" },
    { label: "Kritis",  color: "#D9383A" },
  ];
  return (
    <div className="flex items-center gap-5">
      {levels.map(l => (
        <div key={l.label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
          <span className="text-[10px]" style={{ color: "rgba(44,62,80,0.6)", fontFamily: "var(--font-dm-sans)" }}>{l.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Faktor Pemicu dash rows ───────────────────────────
// level 1-4 rendered as short horizontal dashes
export function FaktorPemicuRow({ faktor, level }) {
  const maxLevel = 4;
  const dashStyles = Array.from({ length: maxLevel }, (_, i) => {
    const filled = i < level;
    const isLast = i === maxLevel - 1;
    const widths = [16, 24, 32, 40];
    return { width: widths[i], filled };
  });

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] w-32 flex-shrink-0" style={{ color: "rgba(44,62,80,0.65)", fontFamily: "var(--font-dm-sans)" }}>
        {faktor}
      </span>
      <div className="flex items-center gap-1">
        {dashStyles.map((d, i) => (
          <div key={i} className="h-[3px] rounded-full"
            style={{
              width: d.width,
              background: d.filled ? "#2C3E50" : "rgba(44,62,80,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Map detail panel (glass) ─────────────────────────
export function MapDetailPanel({ wilayah, onClose, type = "banjir" }) {
  if (!wilayah) return null;

  const banjirItems = [
    { icon: "💧", label: "Curah Hujan",    value: wilayah.curahHujan    },
    { icon: "🌊", label: "Luas Genangan",  value: wilayah.luasGenangan  },
    { icon: "⚠️", label: "Skor Risiko",    value: wilayah.skorRisiko    },
  ];
  const longsorItems = [
    { icon: "🪨", label: "Jenis Tanah",       value: wilayah.jenisTanah       },
    { icon: "⛰️", label: "Kemiringan Lereng", value: wilayah.kemiringan        },
    { icon: "🌿", label: "Tutupan Lahan",     value: wilayah.tutupanLahan      },
    { icon: "💧", label: "Soil Moisture",     value: wilayah.soilMoisture      },
    { icon: "⚠️", label: "Skor Risiko",       value: wilayah.skorRisikoLongsor },
  ];

  const items = type === "banjir" ? banjirItems : longsorItems;

  return (
    <div className="rounded-2xl p-4 min-w-[180px]"
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow: "0 4px 20px rgba(44,62,80,0.1)",
      }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold" style={{ color: "#2C3E50", fontFamily: "var(--font-garet-heavy)" }}>
          {wilayah.nama}
        </span>
        <button onClick={onClose}
          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 text-xs"
          style={{ background: "rgba(44,62,80,0.08)" }}>
          ×
        </button>
      </div>
      <div className="space-y-2.5">
        {items.map(item => (
          <div key={item.label} className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0 mt-px">{item.icon}</span>
            <div>
              <p className="text-[10px]" style={{ color: "rgba(44,62,80,0.45)" }}>{item.label}</p>
              <p className="text-[11px] font-semibold" style={{ color: "#2C3E50" }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
