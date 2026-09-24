import { C } from "../data/constants";

// HALAMAN 6
export default function SectionBridges({ active, setRef }) {
  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex items-center overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(135deg, rgba(212,224,236,0.4) 0%, rgba(232,235,239,0.4) 100%)" }}
    >
      {/* Warning banner */}
      {active && (
        <div className="absolute top-8 right-0 z-10 anim-slideInRight">
          <div
            className="pl-8 pr-10 py-5 rounded-l-2xl"
            style={{
              background: "rgba(217,56,58,0.12)",
              backdropFilter: "blur(20px)",
              borderLeft: `4px solid ${C.red}`,
              borderTop: `1px solid rgba(217,56,58,0.25)`,
              borderBottom: `1px solid rgba(217,56,58,0.25)`,
            }}
          >
            <div className="flex items-center gap-3 mb-1">
              <span className="tilt-el text-2xl">⚠️</span>
              <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.4rem", color: C.red, fontWeight: 700 }}>
                247 Jembatan Lumpuh
              </p>
            </div>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.85rem", color: C.navy, opacity: 0.75 }}>
              dan Terancam Putus
            </p>
          </div>
        </div>
      )}

      {/* Left narrative */}
      {active && (
        <div
          className="absolute bottom-8 left-8 z-10 glass rounded-2xl p-6 anim-fadeInLeft"
          style={{ maxWidth: "420px", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}
        >
          <p className="mb-3" style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1rem", color: C.red }}>
            247 Jembatan Lumpuh dan Terancam
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, lineHeight: 1.75 }}>
            Kondisi makin fatal di pegunungan. Titik-titik jembatan yang ditelan luapan sungai atau hancur adalah penyebab utama terisolasinya suatu wilayah secara absolut.
          </p>
        </div>
      )}
    </section>
  );
}
