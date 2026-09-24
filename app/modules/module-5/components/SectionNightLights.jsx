import { useEffect, useState, useRef, useCallback } from "react";
import { C, STARS_BEFORE, STARS_AFTER } from "../data/constants";

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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pointer-events-none"
      style={{ background: "rgba(44, 62, 80, 0.45)" }}
    >
      {/* Static starfield */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${((i * 5003 + 17) % 1000) / 10}%`,
            top: `${((i * 3847 + 93) % 1000) / 10}%`,
            width: `${1 + ((i * 1117) % 3)}px`,
            height: `${1 + ((i * 1117) % 3)}px`,
            background: `rgba(232,235,239,${0.1 + ((i * 677) % 30) / 100})`,
          }}
        />
      ))}

      {/* Title */}
      {active && (
        <div className="relative z-10 text-center mb-7 px-6 anim-fadeInUp">
          <h2 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "clamp(1.4rem, 3vw, 2.3rem)", color: C.gray, fontWeight: 700, letterSpacing: "0.04em" }}>
            PENURUNAN INTENSITAS CAHAYA &gt; 50%
          </h2>
        </div>
      )}

      {/* Swipe component */}
      <div
        ref={swipeContainerRef}
        className="relative z-10 mx-6 rounded-2xl overflow-hidden pointer-events-auto"
        style={{
          width: "100%",
          maxWidth: "760px",
          height: "400px",
          cursor: "ew-resize",
          userSelect: "none",
          boxShadow: `0 0 60px rgba(109,157,197,0.25)`,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* AFTER (dark) */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #050810 0%, #0d1520 100%)" }}>
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(217,56,58,0.28)", color: C.gray, fontFamily: "var(--font-dm-sans)" }}>
              SESUDAH BENCANA
            </span>
          </div>
          {STARS_AFTER.map((s) => (
            <div key={s.id} className="absolute rounded-full" style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.s}px`, height: `${s.s}px`,
              background: `rgba(200,200,150,${s.b * 0.35})`,
              boxShadow: `0 0 ${s.s * 2}px rgba(200,200,150,${s.b * 0.15})`,
            }} />
          ))}
        </div>

        {/* BEFORE (bright) — clipped by swipe position */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #112240 0%, #1e3a5f 100%)",
            clipPath: `inset(0 ${100 - swipePos}% 0 0)`,
          }}
        >
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(32,135,116,0.28)", color: C.gray, fontFamily: "var(--font-dm-sans)" }}>
              SEBELUM BENCANA
            </span>
          </div>
          {STARS_BEFORE.map((s) => (
            <div key={s.id} className="absolute rounded-full" style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.s}px`, height: `${s.s}px`,
              background: `rgba(255,255,200,${s.b})`,
              boxShadow: `0 0 ${s.s * 3}px rgba(255,255,180,${s.b * 0.75})`,
            }} />
          ))}
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center"
          style={{ left: `${swipePos}%`, transform: "translateX(-50%)", width: "2px", background: "rgba(255,255,255,0.85)", boxShadow: "0 0 16px rgba(255,255,255,0.7)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#fff", boxShadow: "0 0 16px rgba(255,255,255,0.8)", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M6 9L2 5V13L6 9Z" fill={C.navy} />
              <path d="M12 9L16 5V13L12 9Z" fill={C.navy} />
            </svg>
          </div>
        </div>
      </div>

      <p className="relative z-10 mt-3 text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(232,235,239,0.4)" }}>
        ← Geser slider untuk membandingkan kondisi sebelum dan sesudah bencana →
      </p>

      {/* Telemetry card */}
      {active && (
        <div
          className="absolute bottom-8 left-8 z-10 glass-dark rounded-xl p-5 anim-fadeInLeft"
          style={{ animationDelay: "0.35s", opacity: 0, animationFillMode: "forwards" }}
        >
          <p className="text-xs mb-3" style={{ fontFamily: "var(--font-dm-sans)", color: C.gray, opacity: 0.5, letterSpacing: "0.12em" }}>
            VIIRS DNB SENSOR DATA
          </p>
          {[
            { l: "Radiansi Sebelum", v: "42,7 nW/cm²/sr", hi: false },
            { l: "Radiansi Sesudah", v: "18,3 nW/cm²/sr", hi: false },
            { l: "Penurunan", v: "57,2%", hi: true },
          ].map((it) => (
            <div key={it.l} className="flex gap-6 justify-between mb-1">
              <span className="text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(232,235,239,0.55)" }}>{it.l}</span>
              <span className="text-xs font-medium" style={{ fontFamily: "var(--font-dm-sans)", color: it.hi ? C.orange : C.gray }}>{it.v}</span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {active && (
        <div
          className="relative z-10 mt-5 max-w-xl text-center px-6 anim-fadeInUp"
          style={{ animationDelay: "0.5s", opacity: 0, animationFillMode: "forwards" }}
        >
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(232,235,239,0.72)", lineHeight: 1.78 }}>
            Pencitraan VIIRS mengungkap realitas pamungkas. Padamnya separuh cahaya malam bukan sekadar kerusakan gardu, melainkan proksi terkuat bahwa roda ekonomi dan denyut kehidupan warga telah berhenti total.
          </p>
        </div>
      )}
    </section>
  );
}
