"use client";
import { useState } from "react";

export default function OpeningPage({ onNavigate }) {
  const [hoveredNav, setHoveredNav] = useState(null);
  const [btnHovered, setBtnHovered] = useState(false);

  const navItems = [
    { label: "Data Historis",         page: "data-historis"  },
    { label: "Faktor Pemicu Banjir",  page: "faktor-banjir"  },
    { label: "Faktor Pemicu Longsor", page: "faktor-longsor" },
  ];

  const menuCards = [
    {
      label: "Skor Risiko Banjir",
      icon: <CloudIcon />,
      page: "faktor-banjir",
    },
    {
      label: "Skor Risiko Longsor",
      icon: <LandslideIcon />,
      page: "faktor-longsor",
    },
    {
      label: "Klasifikasi Risiko",
      icon: <ClassifyIcon />,
      page: "data-historis",
    },
    {
      label: "Peta Interaktif\nRisiko Bencana",
      icon: <MapPinIcon />,
      page: "faktor-banjir",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col aurora-bg">
      {/* Wave blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute rounded-full opacity-40 blur-3xl"
          style={{ width: 700, height: 500, top: -100, left: -100,
            background: "radial-gradient(circle, rgba(109,157,197,0.8) 0%, transparent 70%)" }}
        />
        <div
          className="absolute rounded-full opacity-35 blur-3xl"
          style={{ width: 600, height: 400, top: 50, right: -50,
            background: "radial-gradient(circle, rgba(190,120,210,0.7) 0%, transparent 70%)" }}
        />
        <div
          className="absolute rounded-full opacity-30 blur-3xl"
          style={{ width: 500, height: 400, bottom: -50, right: 100,
            background: "radial-gradient(circle, rgba(244,124,54,0.6) 0%, transparent 70%)" }}
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center px-8 py-4 gap-8">
        {/* Logo icons — placeholder */}
        <div className="flex items-center gap-2 mr-2">
          {["🌿","🔵","🟡"].map((icon, i) => (
            <div key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-base"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.35)" }}>
              {icon}
            </div>
          ))}
        </div>

        {navItems.map((item) => (
          <button
            key={item.page}
            onMouseEnter={() => setHoveredNav(item.page)}
            onMouseLeave={() => setHoveredNav(null)}
            onClick={() => onNavigate(item.page)}
            className="text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg"
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "#fff",
              background: hoveredNav === item.page ? "rgba(255,255,255,0.18)" : "transparent",
              backdropFilter: hoveredNav === item.page ? "blur(4px)" : "none",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8 py-8">
        <h1
          className="font-bold text-black mb-5 tracking-tight leading-tight"
          style={{
            fontFamily: "var(--font-garet-heavy)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            textShadow: "0 2px 20px rgba(0,0,0,0.25)",
          }}
        >
          DASHBOARD MONITORING<br />BENCANA SUMATERA
        </h1>
        <p
          className="text-black/75 text-sm max-w-md mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          Dashboard ini digunakan untuk memantau bencana banjir dan longsor di Aceh, Sumatera Utara,
          dan Sumatera Barat secara near real time dengan mengidentifikasi faktor risiko bencana
          (Early Warning System).
        </p>

        {/* CTA Button */}
        <button
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          onClick={() => onNavigate("data-historis")}
          className="px-10 py-3 rounded-full font-semibold text-sm transition-all duration-300"
          style={{
            fontFamily: "var(--font-dm-sans)",
            background: btnHovered ? "#111" : "rgba(255,255,255,0.95)",
            color: btnHovered ? "#fff" : "#111",
            boxShadow: btnHovered
              ? "0 8px 32px rgba(0,0,0,0.35)"
              : "0 4px 16px rgba(0,0,0,0.18)",
            transform: btnHovered ? "translateY(-2px) scale(1.02)" : "none",
          }}
        >
          Data Historis
        </button>
      </div>

      {/* Bottom cards */}
      <div className="relative z-10 flex justify-center gap-5 px-8 pb-14 flex-wrap">
        {menuCards.map((card, i) => (
          <GlassMenuCard key={i} card={card} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function GlassMenuCard({ card, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(card.page)}
      className="flex flex-col items-center gap-2.5 px-7 py-5 rounded-2xl transition-all duration-300 cursor-pointer text-center"
      style={{
        background: hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.13)",
        backdropFilter: "blur(12px)",
        border: hovered
          ? "1px solid rgba(255,255,255,0.6)"
          : "1px solid rgba(255,255,255,0.28)",
        boxShadow: hovered
          ? "0 0 24px rgba(255,255,255,0.22), 0 8px 32px rgba(0,0,0,0.18)"
          : "0 4px 16px rgba(0,0,0,0.1)",
        transform: hovered ? "translateY(-4px)" : "none",
        minWidth: "128px",
      }}
    >
      <div className="text-black/90 w-8 h-8 flex items-center justify-center">{card.icon}</div>
      <span className="text-black text-xs font-medium leading-snug whitespace-pre-line"
        style={{ fontFamily: "var(--font-dm-sans)" }}>
        {card.label}
      </span>
    </button>
  );
}

// Icon components
function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 9.5A5.5 5.5 0 0113 5.5a5.5 5.5 0 015 3.5A4.5 4.5 0 0117 18H5a4.5 4.5 0 01-2-8.5z" />
      <path strokeLinecap="round" d="M8 18v3M12 18v2M16 18v3" />
    </svg>
  );
}
function LandslideIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 19L12 5l5 8 2.5-4L22 19H2.5z" />
    </svg>
  );
}
function ClassifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
