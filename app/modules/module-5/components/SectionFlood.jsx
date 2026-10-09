import { C } from "../data/constants";
import DonutChart from "./DonutChart";

// HALAMAN 3 
export default function SectionFlood({ active, setRef }) {
  return (
    <section
      id="section-flood"
      ref={setRef}
      className="relative min-h-screen flex overflow-hidden pointer-events-none"
    >
      {/* 
        Efek animasi banjir palsu telah dihapus karena sekarang 
        kita menggunakan data batas kecamatan sungguhan dari MapLibre.
      */}

      {/* Side Data Panel */}
      {active && (
        <div 
          className="absolute left-8 top-1/2 -translate-y-1/2 z-10 rounded-2xl p-6 anim-fadeInLeft" 
          style={{ 
            width: "300px", 
            background: "rgba(255, 255, 255, 0.6)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.15)"
          }}
        >
          <h3 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.1rem", color: C.navy, marginBottom: "8px", lineHeight: 1.2 }}>
            ANALISIS DATA SPASIAL BANGUNAN
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.65, fontSize: "0.85rem", marginBottom: "24px", lineHeight: 1.5 }}>
            Illustrative data transparan-embedded data and draw-in toorspaver buildings
          </p>

          <DonutChart data={[{ label: "Aman", value: 62, color: C.teal }, { label: "Tergenang", value: 38, color: C.blue }]} />

          <div className="space-y-3 mt-6">
            {[{ l: "Aman", v: "62%", c: C.teal }, { l: "Tergenang", v: "38%", c: C.blue }].map((it) => (
              <div key={it.l} className="flex items-center gap-3 text-sm">
                <div className="w-4 h-4" style={{ background: it.c }} />
                <span style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, fontWeight: 600 }}>{it.c}</span>
                <span style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.8 }}>{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mini Map Legend */}
      {active && (
        <div 
          className="absolute bottom-8 right-8 z-10 rounded-xl p-4 anim-fadeInRight" 
          style={{ 
            background: "rgba(255, 255, 255, 0.7)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.1)",
            animationDelay: "0.5s", animationFillMode: "both"
          }}
        >
          <div className="flex items-center gap-3 mb-3 border-b border-gray-300 pb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 12C2 12 5 9 12 12C19 15 22 12 22 12" stroke={C.blue} strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 17C2 17 5 14 12 17C19 20 22 17 22 17" stroke={C.blue} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            </svg>
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: C.navy, fontWeight: 600 }}>Area Genangan Terparah</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#27AE60" }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: C.navy, opacity: 0.8 }}>Kecamatan Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#2980B9" }} />
              <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.8rem", color: C.navy, opacity: 0.8 }}>Kecamatan Tergenang Banjir</span>
            </div>
          </div>
          {/* Pointer line connecting legend to map center */}
          <svg className="absolute -top-[120px] -left-[180px] pointer-events-none" width="200" height="150">
            <path d="M200 130 L30 30" stroke={C.navy} strokeWidth="1" opacity="0.3" fill="none" />
            <circle cx="30" cy="30" r="3" fill="none" stroke={C.navy} opacity="0.5" />
          </svg>
        </div>
      )}

      {/* Bottom Narrative Box */}
      {active && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 rounded-2xl p-8 anim-fadeInUp"
          style={{ 
            maxWidth: "50vw", 
            minWidth: "500px", 
            background: "rgba(255, 255, 255, 0.5)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.15)",
            animationDelay: "1s", animationFillMode: "both"
          }}
        >
          {/* Live Update Badge */}
          <div
            className="absolute -top-4 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: C.gray, border: "1px solid rgba(44,62,80,0.15)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
          >
            <span className="live-dot w-2 h-2 rounded-full inline-block" style={{ background: C.red }} />
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: C.red, opacity: 0.85, fontWeight: 600, letterSpacing: "1px" }}>
              LIVE UPDATE
            </span>
          </div>

          <p style={{ fontFamily: "var(--font-lora)", fontStyle: "italic", fontSize: "1.25rem", color: C.navy, lineHeight: 1.65, marginBottom: "1rem" }}>
            &ldquo;Rumah yang dulu menjadi tempat berlindung paling aman, kini tenggelam.&rdquo;
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", color: C.navy, opacity: 0.85, lineHeight: 1.6 }}>
            Dengan melakukan overlay luasan banjir di atas data hunian spasial, algoritma mengkalkulasi jumlah bangunan yang tergenang per desa sebagai basis estimasi nyawa yang terdampak.
          </p>
        </div>
      )}
    </section>
  );
}
