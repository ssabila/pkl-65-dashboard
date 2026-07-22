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
      style={{ background: "linear-gradient(135deg, rgba(237,232,232,0.4) 0%, rgba(232,235,239,0.4) 100%)" }}
    >
      {/* Scan line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="scan-line" />
      </div>

      {/* Floating metric card - right */}
      {active && (
        <div
          className="absolute right-6 top-1/3 z-10 glass rounded-2xl p-8 text-center anim-fadeInRight"
          style={{ minWidth: "190px" }}
        >
          <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "4.5rem", lineHeight: 1, color: C.red, fontWeight: 700 }}>
            71%
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.78rem", color: C.navy, opacity: 0.75 }}>Bangunan Hancur</p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.72rem", color: C.navy, opacity: 0.55 }}>di Kabupaten Tertinggi</p>
        </div>
      )}

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

      {/* Bottom text */}
      {active && (
        <div
          className="absolute bottom-7 left-1/2 z-10 glass rounded-2xl p-5 anim-fadeInUp"
          style={{ transform: "translateX(-50%)", maxWidth: "540px", animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards" }}
        >
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, lineHeight: 1.75, textAlign: "center" }}>
            Lebih dari sekadar tergenang. Analisis perubahan spektrum warna (spectral change) dari satelit Sentinel-2 mendeteksi atap-atap yang hancur karena hantaman material. Mereka yang melewati batas langsung ditandai sebagai prioritas rekonstruksi.
          </p>
        </div>
      )}
    </section>
  );
}
