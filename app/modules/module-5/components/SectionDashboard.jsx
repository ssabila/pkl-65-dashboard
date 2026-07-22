import { useState } from "react";
import Link from "next/link";
import { C, KECAMATAN_TABLE } from "../data/constants";

// HALAMAN 10 
export default function SectionDashboard({ active, setRef }) {
  const [filterActive, setFilterActive] = useState("Semua");
  const [downloadHover, setDownloadHover] = useState(false);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(140deg, #A8C4D8 0%, #E8EBEF 45%, #F2C4A4 100%)" }}
    >
      <div className="absolute inset-0 topo-bg" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: C.navy, fontWeight: 700, lineHeight: 1.15 }}>
              EKSPLORASI DATA DAMPAK &amp; LOGISTIK
            </h2>
            <p className="mt-1" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, opacity: 0.65, maxWidth: "540px", lineHeight: 1.65 }}>
              Di balik setiap data spasial, terdapat nyawa dan kehidupan yang harus dipulihkan. Gunakan alat interaktif di bawah ini untuk melihat rincian kerusakan hingga tingkat kecamatan.
            </p>
          </div>
          <Link href="/" className="px-4 py-2 rounded-full text-sm flex-shrink-0" style={{ background: "rgba(44,62,80,0.12)", color: C.navy, fontFamily: "var(--font-dm-sans)", backdropFilter: "blur(10px)", border: "1px solid rgba(44,62,80,0.15)" }}>
            ← Beranda
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["Semua", "Bangunan", "Jalan", "Jembatan", "Isolasi", "Cahaya Malam", "IKG", "Logistik"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.8rem",
                padding: "6px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(44,62,80,0.2)",
                background: filterActive === f ? C.navy : "rgba(255,255,255,0.6)",
                color: filterActive === f ? C.gray : C.navy,
                backdropFilter: "blur(10px)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 240px" }}>
          {/* Map */}
          <div className="glass rounded-2xl overflow-hidden relative" style={{ height: "430px" }}>
            {/* Peta Mapbox merender di background, kita kosongkan div ini agar tembus pandang */}

            {/* Tooltip */}
            <div className="absolute top-4 left-4 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(44,62,80,0.88)", backdropFilter: "blur(10px)", color: C.gray, fontFamily: "var(--font-dm-sans)" }}>
              <p className="font-semibold">Kab. Toba Samosir</p>
              <p style={{ opacity: 0.7 }}>Status: Terisolir ⚠️</p>
              <p style={{ opacity: 0.7 }}>IKG: 89,4 — Sangat Kritis</p>
            </div>

            {/* Reset button */}
            <button
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-base"
              style={{ background: "rgba(44,62,80,0.85)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer" }}
              title="Reset tampilan peta"
            >
              🧭
            </button>
          </div>

          {/* Stat cards */}
          <div className="flex flex-col gap-3">
            {[
              { l: "Bangunan Terdampak", v: "247.832", u: "unit", c: C.red },
              { l: "Jalan Terputus", v: "1.847", u: "km", c: C.orange },
              { l: "Jembatan Lumpuh", v: "247", u: "titik", c: C.red },
              { l: "Desa Terisolir", v: "1.293", u: "desa", c: C.orange },
            ].map((m) => (
              <div key={m.l} className="glass rounded-xl p-4">
                <p className="text-xs mb-0.5" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.6 }}>{m.l}</p>
                <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.7rem", color: m.c, lineHeight: 1.1 }}>{m.v}</p>
                <p className="text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.5 }}>{m.u}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom data table */}
        <div className="mt-4 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.25)" }}>
            <h3 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, color: C.navy, fontSize: "0.92rem" }}>
              Data Spasial Detail per Kecamatan
            </h3>
            <button
              onMouseEnter={() => setDownloadHover(true)}
              onMouseLeave={() => setDownloadHover(false)}
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.82rem",
                padding: "8px 18px",
                borderRadius: "999px",
                border: "none",
                background: downloadHover ? C.teal : C.navy,
                color: C.gray,
                cursor: "pointer",
                transition: "background 0.3s ease",
              }}
            >
              ⬇ Unduh Data
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                {["Kecamatan", "Kabupaten", "Bangunan Tergenang", "Jalan Putus (km)", "Status Logistik"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(44,62,80,0.55)", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KECAMATAN_TABLE.map((row, i) => (
                <tr
                  key={row.kec}
                  className="data-row"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "default" }}
                >
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.navy }}>{row.kec}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.navy, opacity: 0.75 }}>{row.kab}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.blue }}>{row.bangunan}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.orange }}>{row.jalan}</span></td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        background: row.status === "Terisolir" ? "rgba(217,56,58,0.15)" : row.status === "Kritis" ? "rgba(244,124,54,0.15)" : "rgba(32,135,116,0.15)",
                        color: row.status === "Terisolir" ? C.red : row.status === "Kritis" ? C.orange : C.teal,
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
