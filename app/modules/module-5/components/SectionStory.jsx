import { useRef, useState, useEffect } from "react";
import { C } from "../data/constants";

// HALAMAN 2
export default function SectionStory({ active, setRef }) {
  const narrativeRef = useRef(null);
  const [showNarrative, setShowNarrative] = useState(false);

  useEffect(() => {
    const el = narrativeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowNarrative(true);
          observer.disconnect(); // Hanya sekali
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="section-story"
      ref={setRef}
      className="relative flex items-end justify-center pb-12 overflow-hidden pointer-events-none"
      style={{ minHeight: "260vh" }}
      // Latar belakang dihilangkan agar tembus pandang ke peta MapLibre di belakangnya
    >
      {/* Vignette Gelap untuk atmosfer malam hari */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)" }} />

      {/* Camera crosshair UI */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ width: 140, height: 140 }}>
          {[
            ["top-0 left-0", "border-t border-l"],
            ["top-0 right-0", "border-t border-r"],
            ["bottom-0 left-0", "border-b border-l"],
            ["bottom-0 right-0", "border-b border-r"],
          ].map(([pos, cls]) => (
            <div key={pos} className={`absolute w-10 h-10 ${pos} ${cls}`} style={{ borderColor: "rgba(44,62,80,0.8)", borderWidth: "1px" }} />
          ))}
          {/* Central cross */}
          <div className="absolute inset-0 m-auto w-4 h-4" style={{ 
            background: "transparent",
            borderTop: "1px solid rgba(44,62,80,0.5)",
            borderBottom: "1px solid rgba(44,62,80,0.5)",
            borderLeft: "1px solid rgba(44,62,80,0.5)",
            borderRight: "1px solid rgba(44,62,80,0.5)",
            clipPath: "polygon(40% 0%, 60% 0%, 60% 40%, 100% 40%, 100% 60%, 60% 60%, 60% 100%, 40% 100%, 40% 60%, 0% 60%, 0% 40%, 40% 40%)"
          }} />
        </div>
      </div>

      {/* Bottom Narrative Box - observer khusus agar muncul saat benar-benar terlihat */}
      <div
        ref={narrativeRef}
        className="relative z-10 rounded-2xl p-8 mx-6"
        style={{ 
          maxWidth: "60vw", 
          minWidth: "600px", 
          background: "rgba(255, 255, 255, 0.5)", 
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.15)",
          opacity: showNarrative ? 1 : 0,
          transform: showNarrative ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
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
          &ldquo;Malam itu, hujan menderas tanpa henti di sebuah desa lereng Bukit Barisan...&rdquo;
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", color: C.navy, opacity: 0.85, lineHeight: 1.6, marginBottom: "1.2rem" }}>
          Bagi Pak Rasyid, gemuruh dari arah bukit mengubah segalanya dalam hitungan detik. Jalan desa amblas, atap rumah hancur, dan akses keluar tertutup rapat.
        </p>
        <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.1rem", color: C.navy, fontWeight: 700 }}>
          Namun, jika dilihat dari atas, seberapa luas sebenarnya skala kehancuran ini?
        </p>
      </div>
    </section>
  );
}
