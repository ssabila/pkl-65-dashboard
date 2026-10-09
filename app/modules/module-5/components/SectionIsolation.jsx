import { C } from "../data/constants";
import { useEffect, useState } from "react";

// HALAMAN 6 (Isolation)
export default function SectionIsolation({ active, setRef }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (active && !animated) {
      setAnimated(true);
    }
  }, [active, animated]);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-none"
    >
      {/* Dimmed Map Filter Overlay (Opacity 30% black) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out z-0"
        style={{ 
          backgroundColor: "rgba(0, 0, 0, 0.4)", // Gelap dramatis
          opacity: active ? 1 : 0 
        }}
      />

      {/* Isolation Index Card */}
      {active && (
        <div
          className="absolute z-10 p-8 text-center anim-fadeInUp"
          style={{ 
            bottom: "15%",
            maxWidth: "650px",
            background: "rgba(255, 255, 255, 0.85)", 
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
            borderRadius: "24px",
            animationDelay: "0.2s", 
            animationFillMode: "both"
          }}
        >
          {/* SOS Badge */}
          <div className="mx-auto mb-4 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full w-fit"
            style={{ background: "rgba(217, 56, 58, 0.15)", border: `1px solid ${C.red}` }}>
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: C.red, animation: "ping 1.5s infinite" }} />
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: C.red, fontWeight: 700, letterSpacing: "2px" }}>
              CRITICAL ISOLATION
            </span>
          </div>

          <h3 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.8rem", color: C.navy, marginBottom: "1rem", fontWeight: 800 }}>
            TERISOLASI DARI DUNIA LUAR
          </h3>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "1rem", color: C.navy, opacity: 0.85, lineHeight: 1.7 }}>
            "Melalui algoritma perutean (routing), sistem menganalisis keterjangkauan dari posko utama. Apabila seluruh jalur masuk mengharuskan relawan melewati jalan putus, desa tersebut resmi dilabeli terisolir. Mereka menanti evakuasi jalur udara."
          </p>
        </div>
      )}
    </section>
  );
}
