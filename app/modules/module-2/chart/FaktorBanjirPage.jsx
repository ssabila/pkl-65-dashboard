"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { curahHujanBulanan, getCurahHujanHarian, bulanOptions, wilayahAceh } from "../data/dummyData";
import { GlassCard, KpiCard, ToggleLabel, ToggleDivider, DropdownPill, RiskLegend, MapDetailPanel } from "./UI";
import { Search, X } from "lucide-react";

// Dynamic import — Leaflet needs client-only
const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false, loading: () => (
  <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: "rgba(220,232,245,0.5)", minHeight: 260 }}>
    <p className="text-[11px]" style={{ color: "rgba(44,62,80,0.4)" }}>Memuat peta…</p>
  </div>
) });

export default function FaktorBanjirPage({ provinsi }) {
  const [trendMode,        setTrendMode]        = useState(null);
  const [bulan,            setBulan]            = useState("Mar");
  const [mapMode,          setMapMode]          = useState(null);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [selectedWilayah,  setSelectedWilayah]  = useState(null);

  const chartData = trendMode === "harian"
    ? getCurahHujanHarian(bulan)
    : curahHujanBulanan["2026"];

  const fmtY = v => v >= 1000 ? `${v / 1000}K` : v;

  const filteredWilayah = searchQuery.length > 1
    ? wilayahAceh.filter(w => w.nama.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const handleSelect = useCallback((w) => {
    setSelectedWilayah(prev => prev?.nama === w.nama ? null : w);
  }, []);

  const kpis = [
    { label: "Curah Hujan Hari Ini",       value: "7,265", change: "+11.01%" },
    { label: "Akumulasi Curah Hujan 3 Hari", value: "7,265", change: "+11.01%" },
    { label: "Akumulasi Curah Hujan 7 Hari", value: "7,265", change: "+11.01%" },
    { label: "Anomali Curah Hujan",          value: "7,265", change: "+11.01%" },
  ];

  return (
    <div className="space-y-4" style={{ fontFamily: "var(--font-dm-sans)" }}>
      <p className="text-[13px] font-semibold" style={{ color: "#2C3E50", fontFamily: "var(--font-garet-heavy)" }}>
        Faktor Pemicu Banjir – Analisis Curah Hujan
      </p>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Tren Curah Hujan */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-[12px] font-semibold" style={{ color: "#2C3E50" }}>Tren Curah Hujan</span>
          <ToggleLabel label="Harian"  active={trendMode === "harian"}
            onClick={() => setTrendMode(m => m === "harian"  ? null : "harian")} />
          <ToggleLabel label="Bulanan" active={trendMode === "bulanan"}
            onClick={() => setTrendMode(m => m === "bulanan" ? null : "bulanan")} />
          <ToggleDivider />
          <DropdownPill
            value="Tanggal"
            options={[]}
            disabled={trendMode === "harian" || trendMode === "bulanan"}
            tooltip="Anda telah memilih tren curah hujan harian"
          />
          <DropdownPill
            value={bulan}
            options={bulanOptions}
            onChange={setBulan}
            disabled={trendMode === "bulanan"}
          />
          <span className="text-[11px] ml-auto" style={{ color: "rgba(44,62,80,0.5)" }}>2026</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,62,80,0.07)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(44,62,80,0.4)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(44,62,80,0.4)" }} axisLine={false} tickLine={false} tickFormatter={fmtY} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12, border: "1px solid rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.92)" }} />
            <Line type="monotone" dataKey="solid"  stroke="rgba(44,62,80,0.85)" strokeWidth={2}   dot={false} name="Curah Hujan" />
            <Line type="monotone" dataKey="dashed" stroke="rgba(44,62,80,0.35)" strokeWidth={1.5} dot={false} strokeDasharray="5 4" name="Rata-rata" />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-center mt-1" style={{ color: "rgba(44,62,80,0.4)" }}>Bulan</p>
      </GlassCard>

      {/* Peta Potensi Banjir */}
      <GlassCard className="p-4">
        {/* Controls row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-[12px] font-semibold" style={{ color: "#2C3E50" }}>Peta Potensi Banjir</span>
          <ToggleLabel label="Kabupaten" active={mapMode !== "kota"} onClick={() => setMapMode("kabupaten")} />
          <ToggleLabel label="Kota"      active={mapMode === "kota"} onClick={() => setMapMode("kota")} />
          <ToggleDivider />
          <DropdownPill value="Tanggal" options={[]} />
          <DropdownPill value={bulan} options={bulanOptions} onChange={setBulan} />

          {/* Search */}
          <div className="relative ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.65)", backdropFilter: "blur(8px)" }}>
              <input
                type="text" placeholder="Cari Wilayah"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="text-[11px] bg-transparent outline-none w-28"
                style={{ color: "#2C3E50" }}
              />
              {searchQuery
                ? <button onClick={() => { setSearchQuery(""); setSelectedWilayah(null); }}><X size={12} style={{ color: "rgba(44,62,80,0.4)" }} /></button>
                : <Search size={12} style={{ color: "rgba(44,62,80,0.4)" }} />
              }
            </div>
            {/* Search autocomplete */}
            {filteredWilayah.length > 0 && (
              <div className="absolute top-full right-0 mt-1 w-44 rounded-xl overflow-hidden z-50"
                style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)", boxShadow: "0 8px 24px rgba(44,62,80,0.12)" }}>
                {filteredWilayah.map(w => (
                  <button key={w.nama} onClick={() => { setSelectedWilayah(w); setSearchQuery(w.nama); }}
                    className="w-full text-left px-3 py-2 text-[11px] hover:bg-white/60 transition-colors"
                    style={{ color: "#2C3E50" }}>
                    {w.nama}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map + Detail */}
        <div className="flex gap-4" style={{ minHeight: "280px" }}>
          <div className="flex-1 rounded-xl overflow-hidden" style={{ minHeight: "260px" }}>
            <InteractiveMap
              provinsi={provinsi}
              type="banjir"
              onSelect={handleSelect}
              selectedWilayah={selectedWilayah}
            />
          </div>

          {/* Detail panel */}
          <div className="w-48 flex-shrink-0 flex items-start pt-2">
            {selectedWilayah ? (
              <MapDetailPanel
                wilayah={selectedWilayah}
                onClose={() => setSelectedWilayah(null)}
                type="banjir"
              />
            ) : (
              <div className="text-center pt-8 w-full">
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(44,62,80,0.4)" }}>
                  Klik titik pada peta atau cari wilayah untuk melihat detail
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "rgba(44,62,80,0.08)" }}>
          <RiskLegend />
        </div>
      </GlassCard>
    </div>
  );
}
