"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Clock, Bell, PanelLeft, PanelRight, AlertTriangle, Download, LayoutDashboard, Home } from "lucide-react";
import { ringkasanByProvinsi, alertFeedData, provinsiOptions } from "../data/dummyData";
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DashboardLayout({ activePage, onNavigate, provinsi, onProvinsiChange, children }) {
  const [leftOpen,     setLeftOpen]     = useState(true);
  const [rightOpen,    setRightOpen]    = useState(true);
  const [provinsiOpen, setProvinsiOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [historyOpen,  setHistoryOpen]  = useState(false);

  const ringkasan = ringkasanByProvinsi[provinsi];

  const navItems = [
    { label: "Data Historis",         page: "data-historis",  badge: "31" },
    { label: "Faktor Pemicu Banjir",  page: "faktor-banjir"  },
    { label: "Faktor Pemicu Longsor", page: "faktor-longsor" },
  ];

  const provinsiRef = useRef(null);
  const [provinsiPos, setProvinsiPos] = useState({ top: 0, left: 0 });

  // Fungsi buka dropdown provinsi
  const handleProvinsiOpen = () => {
    if (provinsiRef.current) {
      const rect = provinsiRef.current.getBoundingClientRect();
      setProvinsiPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX - 40, // center offset
      });
    }
    setProvinsiOpen(!provinsiOpen);
  };

  // Tutup saat klik luar
  useEffect(() => {
    if (!provinsiOpen) return;
    const handler = (e) => {
      if (!provinsiRef.current?.contains(e.target)) setProvinsiOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [provinsiOpen]);

  return (
    <div className="flex h-screen overflow-hidden aurora-dashboard-bg" style={{ fontFamily: "var(--font-dm-sans)" }}>

      {/* ─── LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside
        className="flex-shrink-0 transition-all duration-300 overflow-hidden"
        style={{
          width: leftOpen ? "210px" : "0px",
          background: "rgba(232,235,239,0.50)",
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderRight: "1px solid rgba(255,255,255,0.6)",
        }}
      >
        <div className="w-[210px] h-full flex flex-col">
          {/* Brand label */}
          <div className="px-5 pt-5 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#2C3E50", opacity: 0.5 }}>
              Dashboards
            </p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 text-left"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.52)" : "transparent",
                    color: isActive ? "#2C3E50" : "rgba(44,62,80,0.6)",
                    fontWeight: isActive ? "600" : "400",
                    boxShadow: isActive
                      ? "inset 0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(44,62,80,0.07)"
                      : "none",
                  }}
                >
                  <ChevronRight size={13} style={{ opacity: isActive ? 1 : 0.3 }} />
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md mr-0.5"
                      style={{ background: "rgba(44,62,80,0.12)", color: "#2C3E50" }}>
                      {item.badge}
                    </span>
                  )}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ─── MAIN ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP BAR */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4"
          style={{
            height: "46px",
            background: "rgba(255,255,255,0.60)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.65)",
          }}
        >
          {/* Left */}
          <div className="flex items-center gap-2">
            <button onClick={() => setLeftOpen(!leftOpen)}
              className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
              <PanelLeft size={15} style={{ color: "#2C3E50", opacity: 0.6 }} />
            </button>

            {/* Breadcrumb trail */}
            <nav className="flex items-center gap-1" aria-label="Breadcrumb">
              {/* Home icon — ke opening page */}
              <button
                onClick={() => onNavigate("opening")}
                title="Kembali ke halaman utama"
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/60 group"
              >
                <Home size={13} style={{ color: "rgba(44,62,80,0.55)" }}
                  className="group-hover:text-[#6D9DC5] transition-colors" />
              </button>

              <ChevronRight size={11} style={{ color: "rgba(44,62,80,0.25)", flexShrink: 0 }} />

              {/* Dashboard root — Link ke path Next.js */}
              <Link
                href="/modules/module-2"
                className="flex items-center gap-1 text-[11px] px-1.5 py-1 rounded-md transition-all duration-200 hover:bg-white/60"
                style={{ color: "rgba(44,62,80,0.55)", textDecoration: "none" }}
                onClick={() => onNavigate("opening")}
              >
                <LayoutDashboard size={11} />
                <span>Dashboard Monitoring Bencana</span>
              </Link>

              <ChevronRight size={11} style={{ color: "rgba(44,62,80,0.25)", flexShrink: 0 }} />

              {/* Modul 2 — klik kembali ke opening */}
              <button
                onClick={() => onNavigate("opening")}
                className="text-[11px] px-1.5 py-1 rounded-md transition-all duration-200 hover:bg-white/60"
                style={{ color: "rgba(44,62,80,0.55)" }}
              >
                Modul 2
              </button>

              {/* Current page segment */}
              {activePage !== "opening" && (
                <>
                  <ChevronRight size={11} style={{ color: "rgba(44,62,80,0.25)", flexShrink: 0 }} />
                  <span className="text-[11px] font-semibold px-1"
                    style={{ color: "#2C3E50" }}>
                    {activePage === "data-historis"  && "Data Historis"}
                    {activePage === "faktor-banjir"  && "Faktor Pemicu Banjir"}
                    {activePage === "faktor-longsor" && "Faktor Pemicu Longsor"}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Center — provinsi dropdown */}
          <div className="relative">
            <button
              ref={provinsiRef}
              onClick={handleProvinsiOpen}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.7)",
                color: "#2C3E50",
                boxShadow: "0 2px 8px rgba(44,62,80,0.08)",
              }}
            >
              {provinsi}
              <ChevronDown size={12} />
            </button>

            {provinsiOpen && typeof document !== "undefined" && createPortal(
              <div style={{
                position: "absolute",
                top: provinsiPos.top,
                left: provinsiPos.left,
                width: "192px",
                zIndex: 9999,
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 24px rgba(44,62,80,0.12)",
                borderRadius: "12px",
                overflow: "hidden",
              }}>
                {provinsiOptions.map((p) => (
                  <button key={p} onClick={() => { onProvinsiChange(p); setProvinsiOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-[12px] hover:bg-white/60 transition-colors"
                    style={{ color: p === provinsi ? "#6D9DC5" : "#2C3E50", fontWeight: p === provinsi ? "600" : "400" }}>
                    {p}
                  </button>
                ))}
              </div>,
              document.body
            )}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1.5">
            {/* Sun / mode placeholder */}
            <button className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ color: "rgba(44,62,80,0.55)" }}>
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

            {/* History */}
            <div className="relative">
              <button onClick={() => setHistoryOpen(!historyOpen)}
                className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                <Clock size={15} style={{ color: "rgba(44,62,80,0.55)" }} />
              </button>
              {historyOpen && (
                <div className="absolute top-full right-0 mt-1 w-52 rounded-xl p-4 z-50"
                  style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(44,62,80,0.12)" }}>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">History</p>
                  <p className="text-[11px] text-slate-400">Fitur history belum tersedia.</p>
                </div>
              )}
            </div>

            {/* Notifikasi */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-1.5 rounded-lg hover:bg-white/50 transition-colors">
                <Bell size={15} style={{ color: "rgba(44,62,80,0.55)" }} />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              {notifOpen && (
                <div className="absolute top-full right-0 mt-1 w-72 rounded-xl overflow-hidden z-10"
                  style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(44,62,80,0.12)" }}>
                  <div className="px-4 py-3 border-b border-white/50">
                    <p className="text-[11px] font-semibold" style={{ color: "#2C3E50" }}>Alert Feed</p>
                  </div>
                  {alertFeedData.map(a => (
                    <div key={a.id} className="px-4 py-2.5 border-b border-white/30 hover:bg-white/40 transition-colors flex items-start gap-2">
                      <AlertTriangle size={12} className="mt-0.5 flex-shrink-0"
                        style={{ color: a.severity === "critical" ? "#D9383A" : "#F47C36" }} />
                      <div>
                        <p className="text-[11px] leading-tight" style={{ color: "#2C3E50" }}>{a.message}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "rgba(44,62,80,0.4)" }}>{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle right sidebar */}
            <button onClick={() => setRightOpen(!rightOpen)}
              className="p-1.5 rounded-lg hover:bg-white/50 transition-colors">
              <PanelRight size={15} style={{ color: "rgba(44,62,80,0.55)" }} />
            </button>
          </div>
        </header>

        {/* PAGE + RIGHT SIDEBAR */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-5 min-w-0">
            {children}
          </main>

          {/* RIGHT SIDEBAR */}
          <aside
            className="flex-shrink-0 transition-all duration-300 overflow-hidden"
            style={{
              width: rightOpen ? "210px" : "0px",
              background: "rgba(232,235,239,0.45)",
              backdropFilter: "blur(24px) saturate(1.5)",
              WebkitBackdropFilter: "blur(24px) saturate(1.5)",
              borderLeft: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div className="w-[210px] h-full flex flex-col overflow-y-auto py-5 px-4 space-y-5">

              {/* Ringkasan Faktor Bencana */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(44,62,80,0.5)" }}>
                  Ringkasan Faktor Bencana
                </p>
                <div className="space-y-3">
                  <RightItem icon="📋" label="Total Kejadian Bencana"   value={`${ringkasan.totalKejadian.toLocaleString()} Kejadian`} />
                  <RightItem icon="🔍" label="Jenis Bencana Terbanyak"  value={ringkasan.jenisBencanaTerbanyak} />
                  <RightItem icon="💧" label="Skor Risiko Banjir"       value={ringkasan.skorRisikoBanjir} />
                  <RightItem icon="⚠️" label="Skor Risiko Longsor"      value={ringkasan.skorRisikoLongsor} />
                </div>
              </div>

              {/* Alert Feed */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(44,62,80,0.5)" }}>
                  Alert Feed
                </p>
                <div className="space-y-2">
                  {alertFeedData.slice(0, 2).map(a => (
                    <div key={a.id} className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{
                        background: a.severity === "critical"
                          ? "rgba(244,124,54,0.18)"
                          : "rgba(244,184,54,0.12)",
                        border: "1px solid rgba(255,255,255,0.4)",
                      }}>
                      <span className="text-sm flex-shrink-0">🌧️</span>
                      <p className="text-[11px] leading-snug font-medium" style={{ color: "#F47C36" }}>
                        {a.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ekspor Data */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(44,62,80,0.5)" }}>
                  Ekspor Data
                </p>
                <div className="space-y-1.5">
                  <EksporBtn label="Peta Potensi Banjir GeoJSON" />
                  <EksporBtn label="Peta Potensi Longsor GeoJSON" />
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function RightItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] leading-tight" style={{ color: "rgba(44,62,80,0.5)" }}>{label}</p>
        <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#2C3E50" }}>{value}</p>
      </div>
    </div>
  );
}

function EksporBtn({ label }) {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="w-full flex items-center gap-2 text-left text-[11px] py-1.5 transition-all duration-200 rounded-lg px-1"
      style={{ color: hov ? "#6D9DC5" : "rgba(44,62,80,0.55)", background: hov ? "rgba(109,157,197,0.08)" : "transparent" }}>
      <span className="text-[11px]">→</span>
      <span>{label}</span>
    </button>
  );
}