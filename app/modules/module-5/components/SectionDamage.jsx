import { C, TOP_KABUPATEN } from "../data/constants";
import { useEffect, useState } from "react";

// HALAMAN 4
export default function SectionDamage({ active, setRef }) {
  const [barAnimated, setBarAnimated] = useState(false);

  useEffect(() => {
    if (active && !barAnimated) setBarAnimated(true);
  }, [active, barAnimated]);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex items-center overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(135deg, rgba(237,232,232,0.2) 0%, rgba(232,235,239,0.2) 100%)" }}
    >
      {/* Transisi warna yang ditarik dari Halaman 1 ke Halaman 2 */}
      <div 
        className="absolute top-0 left-0 right-0 h-64 z-0 pointer-events-none"
        style={{
          background: "rgba(232, 235, 239, 0.65)",
          backdropFilter: "blur(12px) contrast(0.9) brightness(1.1)",
          WebkitBackdropFilter: "blur(12px) contrast(0.9) brightness(1.1)",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
      />
      {/* Bar chart panel - left */}
      {active && (
        <div className="relative z-10 ml-6 glass rounded-2xl p-6 anim-fadeInLeft" style={{ width: "320px", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "0.88rem", color: C.red, fontWeight: 700, marginBottom: "4px" }}>
            10 Kabupaten Terparah
          </p>
          <p className="text-xs mb-4" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.6 }}>
            % Bangunan Rusak Berat
          </p>
          <div className="space-y-2">
            {TOP_KABUPATEN.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="flex-shrink-0 text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, width: "108px", fontSize: "11px" }}>
                  {d.name}
                </span>
                <div className="flex-1 rounded-full overflow-hidden" style={{ background: "rgba(44,62,80,0.12)", height: "14px" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: barAnimated ? `${d.value}%` : "0%",
                      background: `linear-gradient(90deg, ${C.red}, ${C.orange})`,
                      transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`,
                    }}
                  />
                </div>
                <span className="flex-shrink-0 text-xs font-semibold" style={{ fontFamily: "var(--font-dm-sans)", color: C.red, width: "34px" }}>
                  {d.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Metric Card - Right side */}
      {active && (
        <div 
          className="absolute right-10 top-1/3 z-10 glass rounded-2xl p-8 text-center anim-fadeInRight"
          style={{ width: "280px" }}
        >
          <div style={{ fontFamily: "var(--font-garet-bold)", fontSize: "4rem", color: C.red, lineHeight: 1, textShadow: "0 4px 20px rgba(217,56,58,0.3)" }}>
            45%
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: C.navy, marginTop: "1rem", fontWeight: 600 }}>
            Bangunan Hancur
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: C.navy, opacity: 0.7, marginTop: "0.5rem" }}>
            di Kabupaten Tertinggi
          </div>
        </div>
      )}

      {/* Bottom text */}
      {active && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 rounded-2xl p-8 anim-fadeInUp"
          style={{ 
            maxWidth: "60vw", 
            minWidth: "600px", 
            background: "rgba(255, 255, 255, 0.5)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.15)",
            animationDelay: "0.2s", animationFillMode: "both"
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

          <h3 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.4rem", color: C.red, marginBottom: "0.75rem", textAlign: "center", fontWeight: 700 }}>
            45% Bangunan Hancur di Kabupaten Tertinggi
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", color: C.navy, opacity: 0.9, lineHeight: 1.6, textAlign: "center" }}>
            "Lebih dari sekadar tergenang. Analisis perubahan spektrum warna (spectral change) dari satelit Sentinel-2 mendeteksi atap-atap yang hancur karena hantaman material. Mereka yang melewati batas langsung ditandai sebagai prioritas rekonstruksi."
          </p>
        </div>
      )}
    </section>
  );
}
