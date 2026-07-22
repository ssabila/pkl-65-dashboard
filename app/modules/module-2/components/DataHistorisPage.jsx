"use client";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Cell as BarCell,
} from "recharts";
import {
  trendTahunanData, faktorPemicuByProvinsi, donutBanjirByProvinsi,
  donutLongsorByProvinsi, frekuensiBencana, tahunOptions, ringkasanByProvinsi,
} from "../data/dummyData";
import { GlassCard, KpiCard, ToggleLabel, ToggleDivider, DropdownPill, FaktorPemicuRow } from "./UI";

// Donut palette matching design (black, blue, teal, light gray)
const DONUT_COLORS = ["#2C3E50", "#6D9DC5", "#208774", "#C8D0D8"];

export default function DataHistorisPage({ provinsi }) {
  const [activeTrend,     setActiveTrend]     = useState(null); // null | 'banjir' | 'longsor'
  const [tahun,           setTahun]           = useState("2026");
  const [activeMayoritas, setActiveMayoritas] = useState("banjir"); // 'banjir' | 'longsor'

  const ringkasan = ringkasanByProvinsi[provinsi];
  const chartData = trendTahunanData[tahun] || trendTahunanData["2026"];
  const faktor    = faktorPemicuByProvinsi[provinsi] || [];
  const donutData = activeMayoritas === "longsor"
    ? (donutLongsorByProvinsi[provinsi] || [])
    : (donutBanjirByProvinsi[provinsi]  || []);
  const frekuensi = frekuensiBencana[provinsi] || frekuensiBencana["Aceh"];

  // Filter chart lines
  const showBanjir  = activeTrend === null || activeTrend === "banjir";
  const showLongsor = activeTrend === null || activeTrend === "longsor";

  const fmtY = (v) => v >= 1000 ? `${v/1000}K` : v;

  return (
    <div className="space-y-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
      {/* Title */}
      <p className="text-[13px] font-semibold" style={{ color: "#2C3E50", fontFamily: "var(--font-garet-heavy)" }}>
        Data Historis Bencana Selama 10 Tahun Terakhir (2016–2026)
      </p>

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Total Kejadian Bencana"
          value={ringkasan.totalKejadian.toLocaleString()}
          change={ringkasan.perubahan} />
        <KpiCard label="Mayoritas Bencana"
          value={ringkasan.mayoritasBencana}
          suffix={ringkasan.persentaseMayoritas} />
        <KpiCard label="Puncak Bencana"
          value={ringkasan.puncakBencana}
          suffix={ringkasan.persentasePuncak} />
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_280px] gap-3">

        {/* Tren Tahunan */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="text-[12px] font-semibold" style={{ color: "#2C3E50" }}>Tren Tahunan</span>
            <ToggleLabel label="Banjir"  active={activeTrend === "banjir"}
              onClick={() => setActiveTrend(t => t === "banjir"  ? null : "banjir")} />
            <ToggleLabel label="Longsor" active={activeTrend === "longsor"}
              onClick={() => setActiveTrend(t => t === "longsor" ? null : "longsor")} />
            <ToggleDivider />
            <DropdownPill value={tahun} options={tahunOptions} onChange={setTahun} />
          </div>
          <p className="text-[10px] mb-2" style={{ color: "rgba(44,62,80,0.45)" }}>Frekuensi</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,62,80,0.07)" />
              <XAxis dataKey="bulan" tick={{ fontSize: 10, fill: "rgba(44,62,80,0.4)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "rgba(44,62,80,0.4)" }} axisLine={false} tickLine={false} tickFormatter={fmtY} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)" }}
                itemStyle={{ color: "#2C3E50" }}
              />
              {showBanjir && (
                <Line type="monotone" dataKey="solid" stroke="rgba(44,62,80,0.85)" strokeWidth={2} dot={false} name="Banjir" />
              )}
              {showLongsor && (
                <Line type="monotone" dataKey="dashed" stroke="rgba(44,62,80,0.4)" strokeWidth={1.5} dot={false} strokeDasharray="5 4" name="Longsor" />
              )}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-center mt-1" style={{ color: "rgba(44,62,80,0.4)" }}>Bulan</p>
        </GlassCard>

        {/* Faktor Pemicu */}
        <GlassCard className="p-4">
          <p className="text-[12px] font-semibold mb-4" style={{ color: "#2C3E50" }}>Faktor Pemicu</p>
          <div className="space-y-3.5">
            {faktor.map(f => (
              <FaktorPemicuRow key={f.faktor} faktor={f.faktor} level={f.level} />
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ── Bottom row ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Donut chart */}
        <GlassCard className="p-4">
          <p className="text-[12px] font-semibold mb-3" style={{ color: "#2C3E50" }}>
            Mayoritas Bencana Berdasarkan Kabupaten/Kota
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={donutData} innerRadius={42} outerRadius={65} dataKey="value" paddingAngle={2} startAngle={90} endAngle={-270}>
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 10, background: "rgba(255,255,255,0.92)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                  <span className="text-[11px]" style={{ color: "rgba(44,62,80,0.7)" }}>{d.name}</span>
                  <span className="text-[11px] font-semibold ml-auto pl-3" style={{ color: "#2C3E50" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banjir / Longsor toggle pills */}
          <div className="flex items-center gap-2 mt-4">
            <BencanaPill label="Banjir"  active={activeMayoritas === "banjir"}
              onClick={() => setActiveMayoritas("banjir")} color="#F47C36" />
            <BencanaPill label="Longsor" active={activeMayoritas === "longsor"}
              onClick={() => setActiveMayoritas("longsor")} color="rgba(44,62,80,0.5)" />
          </div>
        </GlassCard>

        {/* Bar chart — Frekuensi per Jenis Bencana */}
        <GlassCard className="p-4">
          <p className="text-[12px] font-semibold mb-1" style={{ color: "#2C3E50" }}>
            Frekuensi per Jenis Bencana
          </p>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#F47C36" }} />
            <span className="text-[10px]" style={{ color: "rgba(44,62,80,0.5)" }}>Bencana dengan Frekuensi Terbanyak</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={frekuensi} margin={{ top: 0, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,62,80,0.07)" vertical={false} />
              <XAxis dataKey="jenis" tick={{ fontSize: 9, fill: "rgba(44,62,80,0.4)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(44,62,80,0.4)" }} axisLine={false} tickLine={false} tickFormatter={fmtY} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10, background: "rgba(255,255,255,0.92)", border: "1px solid rgba(255,255,255,0.7)" }} />
              <Bar dataKey="frekuensi" radius={[5, 5, 0, 0]} name="Frekuensi">
                {frekuensi.map((d, i) => (
                  <Cell key={i} fill={d.highlight ? "#F47C36" : "#6D9DC5"} fillOpacity={d.highlight ? 1 : 0.75} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}

function BencanaPill({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} className="px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200"
      style={{
        background: active ? color : "transparent",
        color: active ? "#fff" : "rgba(44,62,80,0.5)",
        border: `1.5px solid ${active ? color : "rgba(44,62,80,0.2)"}`,
      }}>
      {label}
    </button>
  );
}
