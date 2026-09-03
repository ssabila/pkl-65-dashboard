"use client";
import Image from "next/image";

const PROVINSI_CONFIG = {
  "Aceh": {
    src: "/module-3/aceh.webp",
    style: { top: "0%", left: "5%", width: "42%", opacity: 1 },
  },
  "Sumatera Utara": {
    src: "/module-3/sumut.webp",
    style: { top: "25%", left: "28%", width: "46%", opacity: 1 },
  },
  "Sumatera Barat": {
    src: "/module-3/sumbar.webp",
    style: { top: "50%", left: "40%", width: "42%", opacity: 1 },
  },
};

const JUDUL_PETA = {
  beranda: "Peta Wilayah Bencana Sumatra",
  banjir: "Peta Banjir Sumatra",
  longsor: "Peta Tanah Longsor Sumatra",
};

export default function PetaSumatra({ activeMenu, provinsi }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[840px] mx-auto">
      {/* Label Glass Pill Button — Sesuai Referensi Gambar */}
      <div
        className="
          flex items-center justify-center
          px-6 sm:px-10 lg:px-14 py-2 sm:py-3
          rounded-[40px] sm:rounded-[50px]
          transition-all duration-300
        "
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.12) 100%)",
          boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "3.5px solid rgba(255,255,255,0.75)",
        }}
      >
        <span
          className="
            font-black text-white text-center
            text-[18px] sm:text-[24px] md:text-[28px] lg:text-[30px]
            [text-shadow:0_4px_6px_rgba(0,0,0,0.6)]
            whitespace-nowrap
            [-webkit-text-stroke:1px_rgba(44,44,44,0.4)]
          "
          style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
        >
          {JUDUL_PETA[activeMenu] ?? "Peta Wilayah Bencana Sumatra"}
        </span>
      </div>

      {/* Responsive Map Glass Card Container */}
      <div
        className="
          relative w-full
          h-[320px] sm:h-[450px] lg:h-[520px]
          rounded-[28px] sm:rounded-[34px]
          overflow-hidden
          flex items-center justify-center
          p-4 sm:p-6
        "
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.18) 100%)",
          boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.25), 0px 16px 40px rgba(0,0,0,0.2)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "3.5px solid rgba(255, 255, 255, 0.75)",
        }}
      >
        <div className="relative w-full h-full max-w-[700px] max-h-[500px]">
          {Object.entries(PROVINSI_CONFIG).map(([nama, config]) => {
            const isSelected = provinsi === nama;
            const isAnySelected = provinsi !== "";
            const opacity = isAnySelected && !isSelected ? 0.3 : 1;

            return (
              <div
                key={nama}
                className="absolute transition-all duration-500 hover:scale-105"
                style={{
                  ...config.style,
                  opacity,
                  filter: isSelected ? "drop-shadow(0 0 16px rgba(255,255,255,0.8))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
                }}
              >
                <Image
                  src={config.src}
                  alt={`Peta ${nama}`}
                  width={380}
                  height={380}
                  className="w-full h-auto object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}