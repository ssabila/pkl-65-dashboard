"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ChevronRight, ChevronDown, Clock, Bell, PanelLeft, PanelRight,
  AlertTriangle, LayoutDashboard, Home, Sun, Moon,
} from "lucide-react";
import { ringkasanByProvinsi, alertFeedData, provinsiOptions } from "../data/dummyData";

// ─── Portal helper ─────────────────────────────────────────────────────────────
function Portal({ children }) {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  if (!m) return null;
  return createPortal(children, document.body);
}

// Hitung posisi fixed dari anchor button
function useAnchorPos(ref, open) {
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0 });
  useEffect(() => {
    if (!open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right });
  }, [open]);
  return pos;
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function DashboardLayout({ activePage, onNavigate, provinsi, onProvinsiChange, onDarkChange, children }) {
  const [leftOpen,  setLeftOpen]  = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [dark,      setDark]      = useState(false);

  // Persist dark mode
  useEffect(() => {
    const saved = localStorage.getItem("m2-dark");
    if (saved === "1") { setDark(true); onDarkChange?.(true); }
  }, []);
  const toggleDark = () => setDark(d => {
    const next = !d;
    localStorage.setItem("m2-dark", next ? "1" : "0");
    onDarkChange?.(next);
    return next;
  });

  const ringkasan = ringkasanByProvinsi[provinsi];

  const navItems = [
    { label: "Data Historis",         page: "data-historis", badge: "31" },
    { label: "Faktor Pemicu Banjir",  page: "faktor-banjir"  },
    { label: "Faktor Pemicu Longsor", page: "faktor-longsor" },
  ];

  // ── Design tokens ──────────────────────────────────────
  const T = {
    rootBg:       dark ? "aurora-dark-dashboard-bg"     : "aurora-dashboard-bg",
    sidebarBg:    dark ? "rgba(14,22,36,0.80)"          : "rgba(232,235,239,0.50)",
    sidebarBdr:   dark ? "rgba(255,255,255,0.07)"       : "rgba(255,255,255,0.6)",
    headerBg:     dark ? "rgba(14,22,36,0.78)"          : "rgba(255,255,255,0.60)",
    headerBdr:    dark ? "rgba(255,255,255,0.07)"       : "rgba(255,255,255,0.65)",
    textPri:      dark ? "#e8ecf2"                      : "#2C3E50",
    textSec:      dark ? "rgba(232,236,242,0.55)"       : "rgba(44,62,80,0.55)",
    textMut:      dark ? "rgba(232,236,242,0.30)"       : "rgba(44,62,80,0.30)",
    activeBg:     dark ? "rgba(255,255,255,0.10)"       : "rgba(255,255,255,0.52)",
    activeShadow: dark
      ? "inset 0 0 0 1px rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.2)"
      : "inset 0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(44,62,80,0.07)",
    hoverBg:      dark ? "rgba(255,255,255,0.06)"       : "rgba(255,255,255,0.50)",
    pillBg:       dark ? "rgba(255,255,255,0.08)"       : "rgba(255,255,255,0.70)",
    pillBdr:      dark ? "rgba(255,255,255,0.12)"       : "rgba(255,255,255,0.65)",
    popupBg:      dark ? "rgba(14,22,36,0.97)"          : "rgba(255,255,255,0.97)",
    popupBdr:     dark ? "rgba(255,255,255,0.10)"       : "rgba(255,255,255,0.75)",
    popupShadow:  dark ? "0 12px 40px rgba(0,0,0,0.55)": "0 8px 32px rgba(44,62,80,0.14)",
    divBdr:       dark ? "rgba(255,255,255,0.07)"       : "rgba(255,255,255,0.5)",
    rightBg:      dark ? "rgba(14,22,36,0.75)"          : "rgba(232,235,239,0.45)",
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${T.rootBg}`}
      style={{ fontFamily: "var(--font-dm-sans)" }}
    >
      {/* ── Aurora CSS injection for dark bg ── */}
      <style>{`
        .aurora-dark-dashboard-bg {
          background:
            radial-gradient(ellipse at 8% 28%, rgba(30,60,100,0.45) 0%, transparent 48%),
            radial-gradient(ellipse at 92% 72%, rgba(80,30,20,0.30) 0%, transparent 42%),
            radial-gradient(ellipse at 52% 0%,  rgba(60,20,80,0.30) 0%, transparent 38%),
            linear-gradient(155deg, #0d1520 0%, #121e30 38%, #16102a 66%, #1a1210 100%);
        }
      `}</style>

      {/* ─── LEFT SIDEBAR ────────────────────────────────────── */}
      <aside
        className="flex-shrink-0 transition-all duration-300 overflow-hidden"
        style={{
          width: leftOpen ? "210px" : "0px",
          background: T.sidebarBg,
          backdropFilter: "blur(24px) saturate(1.6)",
          WebkitBackdropFilter: "blur(24px) saturate(1.6)",
          borderRight: `1px solid ${T.sidebarBdr}`,
        }}
      >
        <div className="w-[210px] h-full flex flex-col">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: T.textSec }}>
              Dashboards
            </p>
          </div>
          <nav className="flex-1 px-3 space-y-0.5">
            {navItems.map(item => {
              const isActive = activePage === item.page;
              return (
                <button key={item.page} onClick={() => onNavigate(item.page)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 text-left"
                  style={{
                    background: isActive ? T.activeBg : "transparent",
                    color: isActive ? T.textPri : T.textSec,
                    fontWeight: isActive ? "600" : "400",
                    boxShadow: isActive ? T.activeShadow : "none",
                  }}>
                  <ChevronRight size={13} style={{ opacity: isActive ? 1 : 0.3 }} />
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md mr-0.5"
                      style={{ background: dark ? "rgba(255,255,255,0.12)" : "rgba(44,62,80,0.12)", color: T.textPri }}>
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
            background: T.headerBg,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${T.headerBdr}`,
            position: "relative",
            zIndex: 40,
          }}
        >
          {/* Left — toggle + breadcrumb */}
          <div className="flex items-center gap-2">
            <button onClick={() => setLeftOpen(!leftOpen)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <PanelLeft size={15} style={{ color: T.textSec }} />
            </button>

            <nav className="flex items-center gap-0.5" aria-label="Breadcrumb">
              <button onClick={() => onNavigate("opening")} title="Kembali ke halaman utama"
                className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Home size={13} style={{ color: T.textSec }} />
              </button>
              <ChevronRight size={11} style={{ color: T.textMut, flexShrink: 0 }} />
              <Link href="/modules/module-2"
                className="flex items-center gap-1 text-[11px] px-1.5 py-1 rounded-md transition-colors"
                style={{ color: T.textSec, textDecoration: "none" }}
                onClick={() => onNavigate("opening")}
                onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <LayoutDashboard size={11} />
                <span>Dashboard Monitoring Bencana</span>
              </Link>
              <ChevronRight size={11} style={{ color: T.textMut, flexShrink: 0 }} />
              <button onClick={() => onNavigate("opening")}
                className="text-[11px] px-1.5 py-1 rounded-md transition-colors"
                style={{ color: T.textSec }}
                onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Modul 2
              </button>
              {activePage !== "opening" && (
                <>
                  <ChevronRight size={11} style={{ color: T.textMut, flexShrink: 0 }} />
                  <span className="text-[11px] font-semibold px-1" style={{ color: T.textPri }}>
                    {activePage === "data-historis"  && "Data Historis"}
                    {activePage === "faktor-banjir"  && "Faktor Pemicu Banjir"}
                    {activePage === "faktor-longsor" && "Faktor Pemicu Longsor"}
                  </span>
                </>
              )}
            </nav>
          </div>

          {/* Center — provinsi dropdown */}
          <ProvinsiDropdown
            provinsi={provinsi}
            onProvinsiChange={onProvinsiChange}
            T={T}
            dark={dark}
          />

          {/* Right icons */}
          <div className="flex items-center gap-1">
            {/* Dark / Light toggle */}
            <button onClick={toggleDark}
              title={dark ? "Mode Terang" : "Mode Gelap"}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: T.textSec }}
              onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {dark
                ? <Sun size={15} />
                : <Moon size={15} />
              }
            </button>

            {/* History */}
            <HistoryPopup T={T} dark={dark} />

            {/* Notifikasi */}
            <NotifPopup T={T} dark={dark} />

            {/* Toggle right sidebar */}
            <button onClick={() => setRightOpen(!rightOpen)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: T.textSec }}
              onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <PanelRight size={15} />
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
              background: T.rightBg,
              backdropFilter: "blur(24px) saturate(1.5)",
              WebkitBackdropFilter: "blur(24px) saturate(1.5)",
              borderLeft: `1px solid ${T.sidebarBdr}`,
            }}
          >
            <div className="w-[210px] h-full flex flex-col overflow-y-auto py-5 px-4 space-y-5">
              {/* Ringkasan */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: T.textSec }}>
                  Ringkasan Faktor Bencana
                </p>
                <div className="space-y-3">
                  <RightItem icon="📋" label="Total Kejadian Bencana"  value={`${ringkasan.totalKejadian.toLocaleString()} Kejadian`} T={T} />
                  <RightItem icon="🔍" label="Jenis Bencana Terbanyak" value={ringkasan.jenisBencanaTerbanyak} T={T} />
                  <RightItem icon="💧" label="Skor Risiko Banjir"      value={ringkasan.skorRisikoBanjir} T={T} />
                  <RightItem icon="⚠️" label="Skor Risiko Longsor"     value={ringkasan.skorRisikoLongsor} T={T} />
                </div>
              </div>
              {/* Alert Feed */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: T.textSec }}>
                  Alert Feed
                </p>
                <div className="space-y-2">
                  {alertFeedData.slice(0, 2).map(a => (
                    <div key={a.id} className="flex items-start gap-2 rounded-xl px-3 py-2.5"
                      style={{ background: a.severity === "critical" ? "rgba(244,124,54,0.18)" : "rgba(244,184,54,0.12)", border: "1px solid rgba(255,255,255,0.3)" }}>
                      <span className="text-sm flex-shrink-0">🌧️</span>
                      <p className="text-[11px] leading-snug font-medium" style={{ color: "#F47C36" }}>{a.message}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Ekspor */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: T.textSec }}>
                  Ekspor Data
                </p>
                <div className="space-y-1.5">
                  <EksporBtn label="Peta Potensi Banjir GeoJSON"   T={T} />
                  <EksporBtn label="Peta Potensi Longsor GeoJSON"  T={T} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Provinsi Dropdown — portal-based ─────────────────────────────────────────
function ProvinsiDropdown({ provinsi, onProvinsiChange, T, dark }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const pos    = useAnchorPos(btnRef, open);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener("mousedown", h), 100);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", h); };
  }, [open]);

  return (
    <div ref={btnRef}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-medium transition-colors"
        style={{ background: T.pillBg, backdropFilter: "blur(8px)", border: `1px solid ${T.pillBdr}`, color: T.textPri, boxShadow: "0 2px 8px rgba(44,62,80,0.08)" }}>
        {provinsi}
        <ChevronDown size={12} />
      </button>

      {open && (
        <Portal>
          <div style={{
            position: "fixed", top: pos.top,
            left: pos.left - 24, // center-ish under button
            zIndex: 9999, width: 192,
            background: T.popupBg, backdropFilter: "blur(24px)",
            border: `1px solid ${T.popupBdr}`,
            borderRadius: 14,
            boxShadow: T.popupShadow,
            overflow: "hidden",
          }}>
            {provinsiOptions.map(p => (
              <button key={p} onClick={() => { onProvinsiChange(p); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[12px] transition-colors"
                style={{ color: p === provinsi ? "#6D9DC5" : T.textPri, fontWeight: p === provinsi ? "600" : "400", background: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.07)" : "rgba(109,157,197,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {p}
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}

// ─── History Popup ─────────────────────────────────────────────────────────────
function HistoryPopup({ T, dark }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const pos    = useAnchorPos(btnRef, open);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener("mousedown", h), 100);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", h); };
  }, [open]);

  const history = [
    { label: "Aceh – Data Historis",          time: "2 menit lalu" },
    { label: "Aceh – Faktor Pemicu Banjir",   time: "18 menit lalu" },
    { label: "Sumut – Faktor Pemicu Longsor", time: "1 jam lalu" },
    { label: "Aceh – Data Historis",          time: "3 jam lalu" },
  ];

  return (
    <div ref={btnRef}>
      <button onClick={() => setOpen(o => !o)} title="History"
        className="p-1.5 rounded-lg transition-colors relative"
        style={{ color: T.textSec }}
        onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Clock size={15} />
      </button>

      {open && (
        <Portal>
          <div style={{
            position: "fixed", top: pos.top, right: pos.right - 10,
            zIndex: 9999, width: 264,
            background: T.popupBg, backdropFilter: "blur(24px)",
            border: `1px solid ${T.popupBdr}`,
            borderRadius: 16,
            boxShadow: T.popupShadow,
            overflow: "hidden",
          }}>
            <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${T.divBdr}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textPri, fontFamily: "var(--font-dm-sans)" }}>
                Riwayat Navigasi
              </p>
            </div>
            {history.map((h, i) => (
              <div key={i}
                className="flex items-center justify-between px-4 py-2.5 transition-colors cursor-pointer"
                style={{ borderBottom: `1px solid ${T.divBdr}` }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(109,157,197,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="flex items-center gap-2">
                  <Clock size={11} style={{ color: T.textMut, flexShrink: 0 }} />
                  <p style={{ fontSize: 11, color: T.textPri, fontFamily: "var(--font-dm-sans)" }}>{h.label}</p>
                </div>
                <span style={{ fontSize: 10, color: T.textMut, whiteSpace: "nowrap", marginLeft: 8 }}>{h.time}</span>
              </div>
            ))}
            <div style={{ padding: "8px 16px" }}>
              <p style={{ fontSize: 10, color: T.textMut, fontFamily: "var(--font-dm-sans)" }}>
                History disimpan secara lokal
              </p>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ─── Notifikasi Popup ──────────────────────────────────────────────────────────
function NotifPopup({ T, dark }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const pos    = useAnchorPos(btnRef, open);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!btnRef.current?.contains(e.target)) setOpen(false); };
    const t = setTimeout(() => document.addEventListener("mousedown", h), 100);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", h); };
  }, [open]);

  const severityColor = { critical: "#D9383A", high: "#F47C36" };

  return (
    <div ref={btnRef}>
      <button onClick={() => setOpen(o => !o)} title="Notifikasi Alert Feed"
        className="p-1.5 rounded-lg transition-colors relative"
        style={{ color: T.textSec }}
        onMouseEnter={e => e.currentTarget.style.background = T.hoverBg}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Bell size={15} />
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
      </button>

      {open && (
        <Portal>
          <div style={{
            position: "fixed", top: pos.top, right: pos.right - 10,
            zIndex: 9999, width: 300,
            background: T.popupBg, backdropFilter: "blur(24px)",
            border: `1px solid ${T.popupBdr}`,
            borderRadius: 16,
            boxShadow: T.popupShadow,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${T.divBdr}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.textPri, fontFamily: "var(--font-dm-sans)" }}>Alert Feed</p>
              <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#D9383A", color: "#fff", fontWeight: 600 }}>
                {alertFeedData.length} baru
              </span>
            </div>
            {/* Items */}
            {alertFeedData.map(a => (
              <div key={a.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                style={{ borderBottom: `1px solid ${T.divBdr}` }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(109,157,197,0.06)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${severityColor[a.severity]}22` }}>
                  <AlertTriangle size={11} style={{ color: severityColor[a.severity] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 11, color: T.textPri, lineHeight: 1.4, fontFamily: "var(--font-dm-sans)" }}>{a.message}</p>
                  <p style={{ fontSize: 10, color: T.textMut, marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
            {/* Footer */}
            <div style={{ padding: "8px 16px" }}>
              <button style={{ fontSize: 10, color: "#6D9DC5", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-dm-sans)" }}>
                Tandai semua sudah dibaca
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

// ─── Helper sub-components ─────────────────────────────────────────────────────
function RightItem({ icon, label, value, T }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-[10px] leading-tight" style={{ color: T.textSec }}>{label}</p>
        <p className="text-[11px] font-semibold mt-0.5" style={{ color: T.textPri }}>{value}</p>
      </div>
    </div>
  );
}

function EksporBtn({ label, T }) {
  const [hov, setHov] = useState(false);
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className="w-full flex items-center gap-2 text-left text-[11px] py-1.5 transition-all duration-200 rounded-lg px-1"
      style={{ color: hov ? "#6D9DC5" : T.textSec, background: hov ? "rgba(109,157,197,0.08)" : "transparent" }}>
      <span>→</span>
      <span>{label}</span>
    </button>
  );
}
