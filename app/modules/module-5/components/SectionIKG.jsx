import { useEffect, useState } from "react";
import { C, BUBBLES, IKG_DATA } from "../data/constants";

// HALAMAN 8 
export default function SectionIKG({ active, setRef }) {
  const [ikgAnimated, setIkgAnimated] = useState(false);
  const [ikgData, setIkgData] = useState([]);
  const [ikgDisplay, setIkgDisplay] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetch("/data/module-5/batasdesa.json")
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          const isolated = data.features.filter(f => f.properties && f.properties.terisolir && f.properties.terisolir.toLowerCase() === "ya");
          
          let parsedData = isolated.map(f => {
            const awal = parseFloat(f.properties["IKG Baseli"]) || 0;
            const pasca = parseFloat(f.properties["IKG Pasca"]) || 0;
            return {
              kabupaten: `${f.properties.NAMOBJ} (${f.properties.WADMKK})`,
              ikgAwal: awal,
              ikgKrisis: pasca,
              diff: pasca - awal,
              status: f.properties.Klasifikas || (pasca > 80 ? "Sangat Kritis" : "Kritis")
            };
          });

          // Sort by diff descending
          parsedData.sort((a, b) => b.diff - a.diff);
          
          const top8 = parsedData.slice(0, 8);
          setIkgData(top8);
          setIkgDisplay(top8.map(d => ({ ...d, display: 0 })));
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (active && !ikgAnimated && ikgData.length > 0) {
      setIkgAnimated(true);
      let step = 0;
      // 1.2 detik = sekitar 70 frame pada 60fps
      const totalSteps = 70;
      const id = setInterval(() => {
        step++;
        const p = step / totalSteps;
        setIkgDisplay(
          ikgData.map((d) => ({
            ...d,
            display: d.ikgAwal + (d.ikgKrisis - d.ikgAwal) * (step < totalSteps ? Math.random() * 0.6 + p * 0.4 : 1),
          }))
        );
        if (step >= totalSteps) {
          setIkgDisplay(ikgData.map((d) => ({ ...d, display: d.ikgKrisis })));
          clearInterval(id);
        }
      }, 17);
    }
  }, [active, ikgAnimated, ikgData]);

  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-14 overflow-hidden pointer-events-none"
    >
      {/* Latar belakang sengaja dikosongkan (transparan) agar peta tetap terlihat penuh */}

      {/* Narrative */}
      <div 
        className="relative z-10 text-center mb-8 p-8 transition-transform duration-1000 rounded-2xl mx-6" 
        style={{ 
          transform: active ? 'translateY(-20px)' : 'translateY(100px)', 
          opacity: active ? 1 : 0,
          maxWidth: "750px",
          background: "rgba(255, 255, 255, 0.85)", 
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.15)",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.6rem", color: C.red, marginBottom: "0.75rem", fontWeight: 700 }}>
          DESA YANG SULIT DIJANGKAU, KINI TAK TERSENTUH
        </h3>
        <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.95rem", color: C.navy, opacity: 0.9, lineHeight: 1.6 }}>
          "Mengombinasikan Indeks Kesulitan Geografis (IKG) dasar dengan skor keterisolasian saat bencana. Data ini membuktikan bahwa hancurnya infrastruktur penghubung secara drastis mengubah klasifikasi desa menjadi sangat kritis."
        </p>
      </div>

      {/* IKG Glass Table */}
      {active && (
        <div className="relative z-10 w-full px-6 anim-fadeInUp" style={{ maxWidth: "900px" }}>
          <div className="rounded-2xl overflow-hidden pointer-events-auto" style={{ background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 8px 32px 0 rgba(44, 62, 80, 0.15)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(44,62,80,0.15)" }}>
                  {["Desa (Kabupaten)", "IKG Awal", "IKG Krisis (Pasca)", "Status"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-sans)", color: `rgba(44,62,80,0.65)`, fontWeight: 600 }}>
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
                    style={{ 
                      borderBottom: "1px solid rgba(44,62,80,0.08)", 
                      transition: "background 0.2s", 
                      cursor: "default",
                      background: hoveredRow === i ? "rgba(44,62,80,0.06)" : "transparent"
                    }}
                  >
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, fontWeight: 500 }}>{row.kabupaten}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, fontWeight: 500, opacity: 0.8 }}>{row.ikgAwal.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "var(--font-garet-bold)", color: C.red, fontSize: "1rem" }}>
                          {ikgAnimated ? row.ikgKrisis.toFixed(1) : Math.max(0, row.display || 0).toFixed(1)}
                        </span>
                        <span className="shimmer-el" style={{ animationDuration: '2s' }}>🔺</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: row.status === "Sangat Tinggi" || row.status === "Sangat Kritis" ? "rgba(217,56,58,0.15)" : "rgba(244,124,54,0.15)",
                          color: row.status === "Sangat Tinggi" || row.status === "Sangat Kritis" ? C.red : C.orange,
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        {row.status === "Sangat Tinggi" ? "Sangat Kritis" : row.status === "Tinggi" ? "Kritis" : row.status}
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
