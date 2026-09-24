import { useEffect, useState } from "react";
import { C, BUBBLES, IKG_DATA } from "../data/constants";

// HALAMAN 8 
export default function SectionIKG({ active, setRef }) {
  const [ikgAnimated, setIkgAnimated] = useState(false);
  const [ikgDisplay, setIkgDisplay] = useState(IKG_DATA.map((d) => ({ ...d, display: 0 })));
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    if (active && !ikgAnimated) {
      setIkgAnimated(true);
      let step = 0;
      const totalSteps = 70;
      const id = setInterval(() => {
        step++;
        const p = step / totalSteps;
        setIkgDisplay(
          IKG_DATA.map((d) => ({
            ...d,
            display: d.ikgAwal + (d.ikgKrisis - d.ikgAwal) * (step < totalSteps ? Math.random() * 0.6 + p * 0.4 : 1),
          }))
        );
        if (step >= totalSteps) {
          setIkgDisplay(IKG_DATA.map((d) => ({ ...d, display: d.ikgKrisis })));
          clearInterval(id);
        }
      }, 17);
    }
  }, [active, ikgAnimated]);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-14 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(135deg, rgba(224,232,240,0.6) 0%, rgba(232,235,239,0.6) 100%)" }}
    >
      {/* Ghost bubbles */}
      <div className="absolute inset-0 pointer-events-none">
        {BUBBLES.slice(0, 5).map((b) => (
          <div
            key={b.id}
            className="absolute rounded-full"
            style={{
              left: `${b.x}%`, top: `${b.y}%`,
              width: `${b.r}px`, height: `${b.r}px`,
              background: "rgba(244,124,54,0.12)",
              transform: "translate(-50%,-50%)",
            }}
          />
        ))}
      </div>

      {/* Narrative */}
      <div className="relative z-10 text-center mb-8 px-6 max-w-xl">
        <p className="mb-3" style={{ fontFamily: "var(--font-lora)", fontStyle: "italic", fontSize: "1.25rem", color: C.navy }}>
          &ldquo;Desa yang sulit dijangkau, kini benar-benar tak tersentuh.&rdquo;
        </p>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", color: C.navy, opacity: 0.75, lineHeight: 1.75 }}>
          Mengombinasikan Indeks Kesulitan Geografis (IKG) dasar dengan skor keterisolasian saat bencana. Data ini membuktikan bahwa hancurnya infrastruktur penghubung secara drastis mengubah klasifikasi desa menjadi sangat kritis.
        </p>
      </div>

      {/* IKG Glass Table */}
      {active && (
        <div className="relative z-10 w-full px-6 anim-fadeInUp" style={{ maxWidth: "900px" }}>
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.35)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.22)" }}>
                  {["Kabupaten", "IKG Awal", "IKG Krisis (Pasca)", "Status"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-sans)", color: `rgba(44,62,80,0.55)`, fontWeight: 500 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ikgDisplay.map((row, i) => (
                  <tr
                    key={row.kabupaten}
                    className="data-row"
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", transition: "background 0.2s", cursor: "default" }}
                  >
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy }}>{row.kabupaten}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, fontWeight: 500 }}>{row.ikgAwal}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "var(--font-garet-bold)", color: C.red, fontSize: "1rem" }}>
                          {ikgAnimated ? row.ikgKrisis.toFixed(1) : Math.max(0, row.display || 0).toFixed(1)}
                        </span>
                        <span className="shimmer-el">🔺</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: row.status === "Sangat Kritis" ? "rgba(217,56,58,0.18)" : "rgba(244,124,54,0.18)",
                          color: row.status === "Sangat Kritis" ? C.red : C.orange,
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
      )}
    </section>
  );
}
