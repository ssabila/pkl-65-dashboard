import { useEffect, useState } from "react";
import { C, PARTICLES } from "../data/constants";

// HALAMAN 1 COVER 
export default function SectionHero({ active, setRef }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e) =>
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    if (active) window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [active]);

  return (
    <section
      ref={setRef}
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden w-full"
      style={{ background: "rgba(168, 196, 216, 0.45)" /* Semi-transparent so Mapbox shows */ }}
    >
      <div className="absolute inset-0 topo-bg" />

      {/* Particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle-el"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Center card with parallax */}
      <div
        className="relative z-10 max-w-2xl w-full mx-6 anim-fadeInUp"
        style={{ transform: `translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px)` }}
      >
        <div className="flex justify-center mb-5">
          <span
            className="px-5 py-2 rounded-full text-xs font-medium"
            style={{
              background: "rgba(232,235,239,0.92)",
              color: C.navy,
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "2px",
              border: "1px solid rgba(44,62,80,0.15)",
            }}
          >
            RISET 3 &bull; POLITEKNIK STATISTIKA STIS &bull; PKL 65
          </span>
        </div>

        <div
          className="glass rounded-3xl p-10 text-center mb-6"
          style={{ transform: `translate(${mousePos.x * 0.08}px, ${mousePos.y * 0.08}px)`, transition: "transform 0.1s ease" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-garet-bold)",
              fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
              fontWeight: 700,
              color: C.navy,
              lineHeight: 1.1,
              marginBottom: "1rem",
            }}
          >
            MODUL 5: DAMPAK &amp; LOGISTIK
          </h1>
          <p
            style={{
              fontFamily: "var(--font-lora)",
              fontStyle: "italic",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: C.navy,
              opacity: 0.8,
            }}
          >
            &ldquo;Memetakan Jejak Kehancuran, Merajut Kembali Jalur Harapan.&rdquo;
          </p>
        </div>

        <div className="text-center">
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: C.navy, opacity: 0.6, marginBottom: "12px" }}>
            Scroll ke bawah untuk memulai perjalanan
          </p>
          <div className="flex justify-center scroll-bounce">
            <svg width="26" height="44" viewBox="0 0 26 44" fill="none">
              <rect x="1" y="1" width="24" height="42" rx="12" stroke={C.navy} strokeWidth="2" opacity="0.4" />
              <circle cx="13" cy="11" r="4" fill={C.navy} opacity="0.4" />
              <path d="M13 22 L9 32 M13 22 L17 32" stroke={C.navy} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
