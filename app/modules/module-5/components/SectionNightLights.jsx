import { useEffect, useState, useRef, useCallback } from "react";
import { C } from "../data/constants";

// HALAMAN 9
export default function SectionNightLights({ active, setRef }) {
  const [swipePos, setSwipePos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const swipeContainerRef = useRef(null);

  const handleSwipeMove = useCallback((clientX) => {
    if (!swipeContainerRef.current) return;
    const rect = swipeContainerRef.current.getBoundingClientRect();
    const p = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSwipePos(p);
  }, []);

  useEffect(() => {
    const onMove = (e) => isDragging && handleSwipeMove(e.clientX);
    const onTouch = (e) => isDragging && handleSwipeMove(e.touches[0].clientX);
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouch);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [isDragging, handleSwipeMove]);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex items-center justify-center px-6 py-12 pointer-events-none"
      style={{ background: "linear-gradient(135deg, #4f7396 0%, #0f172a 100%)" }}
    >
      {/* MAIN CONTAINER */}
      <div
        ref={swipeContainerRef}
        className={`relative z-10 w-full max-w-7xl h-[80vh] rounded-[2.5rem] overflow-hidden pointer-events-auto transition-all duration-1000 ${active ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}
        style={{
          cursor: "ew-resize",
          userSelect: "none",
          boxShadow: `0 40px 100px rgba(0,0,0,0.6)`,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* AFTER (Dark Right Side) */}
        <div className="absolute inset-0" style={{ background: "#000000" }}>
          {/* Starry Dust AFTER */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{ left: `${((i * 41) % 100)}%`, top: `${((i * 73) % 100)}%`, width: `${(i % 3) + 1}px`, height: `${(i % 3) + 1}px`, background: `rgba(255,220,150,${0.2 + (i % 5) / 10})`, boxShadow: "0 0 10px rgba(255,220,150,0.5)" }} />
          ))}

          <img
            src="/data/module-5/ntl_post.svg"
            alt="Sesudah Bencana"
            className="w-full h-full object-contain p-4 opacity-90"
          />
          <div className="absolute top-8 right-12 z-10">
            <span style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.25rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
              Sebelum
            </span>
          </div>
        </div>

        {/* BEFORE (Bright Left Side) — clipped by swipe position */}
        <div
          className="absolute inset-0"
          style={{
            background: "#000000",
            clipPath: `inset(0 ${100 - swipePos}% 0 0)`,
          }}
        >
          {/* Starry Dust BEFORE */}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`b-${i}`} className="absolute rounded-full" style={{ left: `${((i * 53) % 100)}%`, top: `${((i * 89) % 100)}%`, width: `${(i % 4) + 1.5}px`, height: `${(i % 4) + 1.5}px`, background: `rgba(255,255,255,${0.6 + (i % 4) / 10})`, boxShadow: "0 0 15px rgba(255,255,255,0.9)" }} />
          ))}

          <img
            src="/data/module-5/ntl_pre.svg"
            alt="Sebelum Bencana"
            className="w-full h-full object-contain p-4 opacity-80"
          />
          <div className="absolute top-8 left-12 z-10">
            <span style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.25rem", color: "rgba(255,255,255,0.9)", letterSpacing: "0.02em" }}>
              Sesudah
            </span>
          </div>
        </div>

        {/* SWIPE LINE & HANDLE */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center"
          style={{ left: `${swipePos}%`, transform: "translateX(-50%)", width: "4px", background: "#fff", boxShadow: "0 0 25px rgba(255,255,255,0.9)" }}
        >
          {/* Glowic white neon separator handle */}
          <div
            className="w-4 h-24 rounded-full"
            style={{ background: "#fff", boxShadow: "0 0 30px rgba(255,255,255,1)", flexShrink: 0 }}
          />
        </div>

        {/* FLOATING TELEMETRY CARD (Bottom Left) */}
        {active && (
          <div
            className="absolute bottom-8 left-8 z-10 rounded-2xl p-5 anim-fadeInLeft pointer-events-auto"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              width: "280px",
              animationDelay: "0.4s", opacity: 0, animationFillMode: "forwards"
            }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "var(--font-dm-sans)", color: "#ffffff" }}>
              Floating telemetry Card
            </h3>
            <div className="flex justify-between text-xs mb-3 border-b border-white/20 pb-2" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(255,255,255,0.8)" }}>
              <span>Glassogray</span>
              <span className="font-semibold text-white">40-60%</span>
            </div>

            <h4 className="text-xs font-bold mt-4 mb-2" style={{ fontFamily: "var(--font-dm-sans)", color: "#ffffff" }}>Radiance Statistics</h4>
            {[
              { l: "Radiance", v: "42.7 nW" },
              { l: "Background", v: "40-60%" },
              { l: "Decrease", v: "> 50%" },
            ].map((it) => (
              <div key={it.l} className="flex justify-between text-xs mb-1.5" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(255,255,255,0.7)" }}>
                <span>{it.l}</span>
                <span className="font-medium text-white/90">{it.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* FLOATING TITLE & DESC CARD (Bottom Right) */}
        {active && (
          <div
            className="absolute bottom-8 right-8 z-10 rounded-[2rem] p-8 anim-fadeInUp pointer-events-auto"
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
              maxWidth: "480px",
              animationDelay: "0.6s", opacity: 0, animationFillMode: "forwards"
            }}
          >
            <h2 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.75rem", color: "#fff", fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.2, marginBottom: "1rem" }}>
              PENURUNAN INTENSITAS CAHAYA &gt; 50%
            </h2>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>
              Pencitraan VIIRS mengungkap realitas pamungkas. Padamnya separuh cahaya malam bukan sekadar kerusakan gardu, melainkan proksi terkuat bahwa roda ekonomi dan denyut kehidupan warga telah berhenti total.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
