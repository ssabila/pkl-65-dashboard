import { C } from "../data/constants";

// HALAMAN 2
export default function SectionStory({ active, setRef }) {
  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex items-end justify-center pb-12 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(160deg, rgba(19,28,40,0.85) 0%, rgba(29,45,66,0.85) 100%)" }}
    >
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.85) 100%)" }} />

      {/* Camera crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative" style={{ width: 160, height: 160 }}>
          {[
            ["top-0 left-0", "border-t-2 border-l-2"],
            ["top-0 right-0", "border-t-2 border-r-2"],
            ["bottom-0 left-0", "border-b-2 border-l-2"],
            ["bottom-0 right-0", "border-b-2 border-r-2"],
          ].map(([pos, cls]) => (
            <div key={pos} className={`absolute w-8 h-8 ${pos} ${cls}`} style={{ borderColor: "rgba(244,124,54,0.55)" }} />
          ))}
          <div className="absolute inset-0 m-auto w-2 h-2 rounded-full" style={{ background: C.orange, boxShadow: `0 0 8px ${C.orange}` }} />
        </div>
      </div>

      {/* Narrative box */}
      {active && (
        <div
          className="relative z-10 glass rounded-2xl p-8 mx-6 anim-fadeInUp"
          style={{ maxWidth: "680px", width: "100%" }}
        >
          {/* Live badge */}
          <div
            className="absolute -top-4 right-6 flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: C.gray, border: "1px solid rgba(44,62,80,0.15)" }}
          >
            <span className="live-dot w-2 h-2 rounded-full inline-block" style={{ background: C.red }} />
            <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: C.navy, fontWeight: 500, letterSpacing: "1px" }}>
              DATA REAL-TIME
            </span>
          </div>

          <p style={{ fontFamily: "var(--font-lora)", fontStyle: "italic", fontSize: "1.2rem", color: C.gray, lineHeight: 1.65, marginBottom: "1rem" }}>
            &ldquo;Malam itu, hujan menderas tanpa henti di sebuah desa lereng Bukit Barisan...&rdquo;
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.92rem", color: "rgba(232,235,239,0.78)", lineHeight: 1.75, marginBottom: "1rem" }}>
            Bagi Pak Rasyid, gemuruh dari arah bukit mengubah segalanya dalam hitungan detik. Jalan desa amblas, atap rumah hancur, dan akses keluar tertutup rapat.
          </p>
          <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.05rem", color: C.gray, fontWeight: 700 }}>
            Namun, jika dilihat dari atas, seberapa luas sebenarnya skala kehancuran ini?
          </p>
        </div>
      )}
    </section>
  );
}
