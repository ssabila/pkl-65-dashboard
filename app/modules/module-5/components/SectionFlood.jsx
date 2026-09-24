import { C } from "../data/constants";
import DonutChart from "./DonutChart";

// HALAMAN 3 
export default function SectionFlood({ active, setRef }) {
  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex items-center overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(135deg, rgba(224,234,242,0.45) 0%, rgba(200,216,232,0.45) 100%)" }}
    >
      {active && (
        <div className="relative z-10 ml-6 glass rounded-2xl p-6 anim-fadeInLeft" style={{ width: "280px", flexShrink: 0 }}>
          <p className="text-xs font-medium tracking-widest uppercase mb-1" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.55 }}>
            Analisis Hunian
          </p>
          <h3 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1rem", color: C.navy, marginBottom: "12px" }}>
            Overlay Banjir &amp; Bangunan
          </h3>

          <DonutChart data={[{ label: "Aman", value: 62, color: C.teal }, { label: "Tergenang", value: 38, color: C.blue }]} />

          <div className="space-y-2 mt-3">
            {[{ l: "Aman", v: "62%", c: C.teal }, { l: "Tergenang", v: "38%", c: C.blue }].map((it) => (
              <div key={it.l} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: it.c }} />
                  <span style={{ fontFamily: "var(--font-dm-sans)", color: C.navy }}>{it.l}</span>
                </div>
                <span style={{ fontFamily: "var(--font-garet-bold)", color: C.navy, fontWeight: 700 }}>{it.v}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.35)" }}>
            <p style={{ fontFamily: "var(--font-lora)", fontStyle: "italic", fontSize: "0.82rem", color: C.navy, lineHeight: 1.6 }}>
              &ldquo;Rumah yang dulu menjadi tempat berlindung paling aman, kini tenggelam.&rdquo;
            </p>
          </div>
        </div>
      )}

      {active && (
        <div
          className="absolute bottom-8 right-6 z-10 glass rounded-2xl p-5 anim-fadeInRight"
          style={{ maxWidth: "400px", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
        >
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, lineHeight: 1.75 }}>
            Dengan melakukan overlay luasan banjir di atas data hunian spasial, algoritma mengkalkulasi jumlah bangunan yang tergenang per desa sebagai basis estimasi nyawa yang terdampak.
          </p>
        </div>
      )}
    </section>
  );
}
