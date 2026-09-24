import { C } from "../data/constants";
import { useEffect, useState } from "react";

// HALAMAN 5
export default function SectionRoads({ active, setRef }) {
  const [roadAnimated, setRoadAnimated] = useState(false);
  const [counterVal, setCounterVal] = useState(0);

  useEffect(() => {
    if (active && !roadAnimated) {
      setRoadAnimated(true);
      let v = 0;
      const target = 1847;
      const id = setInterval(() => {
        v = Math.min(v + 28, target);
        setCounterVal(v);
        if (v >= target) clearInterval(id);
      }, 16);
    }
  }, [active, roadAnimated]);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex items-center overflow-hidden pointer-events-none"
      style={{ background: "rgba(232, 235, 239, 0.45)" }}
    >
      {/* Grid pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: "linear-gradient(rgba(44,62,80,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(44,62,80,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Logistics card - top left */}
      {active && (
        <div className="absolute top-8 left-8 z-10 glass rounded-2xl p-6 anim-fadeInLeft" style={{ minWidth: "210px" }}>
          <p className="text-xs mb-1" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.6 }}>Total Jalan Terputus</p>
          <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "2.8rem", color: C.orange, fontWeight: 700, lineHeight: 1 }}>
            {counterVal.toLocaleString("id-ID")}
          </p>
          <p className="text-sm" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.6 }}>kilometer</p>
          <div className="mt-4 pt-3 space-y-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.35)" }}>
            {[{ c: C.orange, l: "Ruas Terputus" }, { c: C.teal, l: "Ruas Aman" }].map(({ c, l }) => (
              <div key={l} className="flex items-center gap-2">
                <div className="rounded" style={{ width: 14, height: 5, background: c }} />
                <span className="text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom narrative */}
      {active && (
        <div
          className="absolute bottom-7 left-1/2 z-10 glass rounded-2xl p-6 anim-fadeInUp"
          style={{ transform: "translateX(-50%)", maxWidth: "560px", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
        >
          <p className="mb-3" style={{ fontFamily: "var(--font-lora)", fontStyle: "italic", fontSize: "1.1rem", color: C.navy }}>
            &ldquo;Tanpa akses jalan, bantuan darurat hanya berhenti menjadi doa.&rdquo;
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, opacity: 0.8, lineHeight: 1.75 }}>
            Sistem menumpuk genangan di atas peta jalan. Setiap ruas yang tertutup air otomatis diklasifikasikan &lsquo;terputus&rsquo;. Jalur evakuasi dan arteri distribusi logistik darat lumpuh total.
          </p>
        </div>
      )}
    </section>
  );
}
