import { C, BUBBLES } from "../data/constants";

// HALAMAN 7
export default function SectionIsolation({ active, setRef }) {
  return (
    <section
      ref={setRef}
      className="relative min-h-screen flex flex-col items-center justify-end pb-12 overflow-hidden pointer-events-none"
      style={{ background: "linear-gradient(160deg, rgba(13,21,32,0.65) 0%, rgba(30,45,66,0.65) 100%)" }}
    >
      {/* Black overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />

      {/* Bubble map */}
      {active && (
        <div className="absolute inset-0 pointer-events-none">
          {BUBBLES.map((b, i) => (
            <div
              key={b.id}
              className="absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%,-50%)" }}
            >
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className="radar-ring"
                  style={{
                    width: `${b.r * 1.8}px`,
                    height: `${b.r * 1.8}px`,
                    left: "50%", top: "50%",
                    transform: "translate(-50%,-50%)",
                    border: `1px solid rgba(244,124,54,0.35)`,
                    animationDuration: `${3 + ring * 0.6}s`,
                    animationDelay: `${ring * 0.5 + i * 0.05}s`,
                  }}
                />
              ))}
              <div
                className="breathe-el rounded-full flex items-center justify-center"
                style={{
                  width: `${b.r}px`,
                  height: `${b.r}px`,
                  background: "rgba(244,124,54,0.5)",
                  border: "1px solid rgba(244,124,54,0.65)",
                  animationDuration: `${3 + i * 0.15}s`,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: `${Math.max(9, b.r * 0.18)}px`, color: "#fff", fontWeight: 600 }}>
                  {b.count}
                </span>
              </div>
              {/* Vertical dashed line */}
              <div
                className="absolute"
                style={{
                  left: "50%", top: `-${b.r * 0.6 + 20}px`,
                  width: "1px", height: "20px",
                  borderLeft: "1px dashed rgba(244,124,54,0.4)",
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Isolation card */}
      {active && (
        <div className="relative z-10 glass-dark rounded-2xl p-8 mx-6 text-center anim-fadeInUp" style={{ maxWidth: "540px" }}>
          <p className="mb-3" style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.5rem", color: C.gray, fontWeight: 700, letterSpacing: "0.04em" }}>
            TERISOLASI DARI DUNIA LUAR
          </p>
          <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: "rgba(232,235,239,0.78)", lineHeight: 1.78 }}>
            Melalui algoritma perutean (routing), sistem menganalisis keterjangkauan dari posko utama. Apabila seluruh jalur masuk mengharuskan relawan melewati jalan putus, desa tersebut resmi dilabeli terisolir. Mereka menanti evakuasi jalur udara.
          </p>
        </div>
      )}
    </section>
  );
}
