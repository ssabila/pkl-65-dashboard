"use client";
import { useState } from "react";

const STATS = {
  totalLuasBanjir: 100000,
  jumlahKotaTerdampak: 10,
  jumlahKecamatanTerdampak: 10,
  totalLuasLongsor: 100000,
};

function formatAngka(num) {
  return num.toLocaleString("id-ID");
}

// Data cards beranda dengan pendaran elips radial-gradient + 75px ultra blur (100% mulus sesuai gambar figma)
const CARDS_DATA = [
  {
    id: 1,
    titleLine1: "Total Luas Area",
    titleLine2: "Banjir (ha)",
    value: formatAngka(STATS.totalLuasBanjir),
    subtitle: "15% dari total wilayah",
    // Kartu 1 (Kiri Atas): Glow Oranye/Peach di Sisi Kanan Bawah
    ellipseStyle: {
      width: "220px",
      height: "240px",
      background: "radial-gradient(ellipse at center, #EB8B68 0%, rgba(235, 139, 104, 0.75) 40%, transparent 75%)",
      right: "-40px",
      bottom: "-40px",
      borderRadius: "50%",
      filter: "blur(65px)",
      opacity: 0.95,
    },
  },
  {
    id: 2,
    titleLine1: "Jumlah Kota",
    titleLine2: "Terdampak",
    value: STATS.jumlahKotaTerdampak,
    subtitle: "dari 30 kab/kota",
    // Kartu 2 (Kanan Atas): Glow Oranye/Peach di Sisi Kanan Atas
    ellipseStyle: {
      width: "220px",
      height: "240px",
      background: "radial-gradient(ellipse at center, #EB8B68 0%, rgba(235, 139, 104, 0.75) 40%, transparent 75%)",
      right: "-40px",
      top: "-40px",
      borderRadius: "50%",
      filter: "blur(65px)",
      opacity: 0.95,
    },
  },
  {
    id: 3,
    titleLine1: "Jumlah Kecamatan",
    titleLine2: "Terdampak",
    value: STATS.jumlahKecamatanTerdampak,
    subtitle: "dari 30 kecamatan",
    // Kartu 3 (Kiri Bawah): Glow Oranye/Peach di Sisi Kiri Bawah
    ellipseStyle: {
      width: "220px",
      height: "240px",
      background: "radial-gradient(ellipse at center, #EB8B68 0%, rgba(235, 139, 104, 0.75) 40%, transparent 75%)",
      left: "-40px",
      bottom: "-40px",
      borderRadius: "50%",
      filter: "blur(65px)",
      opacity: 0.95,
    },
  },
  {
    id: 4,
    titleLine1: "Total Luas Area",
    titleLine2: "Longsor (ha)",
    value: formatAngka(STATS.totalLuasLongsor),
    subtitle: "15% dari total wilayah",
    // Kartu 4 (Kanan Bawah): Glow Oranye/Peach di Sisi Kiri Bawah
    ellipseStyle: {
      width: "220px",
      height: "240px",
      background: "radial-gradient(ellipse at center, #EB8B68 0%, rgba(235, 139, 104, 0.75) 40%, transparent 75%)",
      left: "-40px",
      bottom: "-40px",
      borderRadius: "50%",
      filter: "blur(65px)",
      opacity: 0.95,
    },
  },
];

// Single Card Component - Sesuai Figma CSS dengan Frosted Glass Effect & Responsive 5px Border
function StatCard({ item, isCarousel = false }) {
  return (
    <div
      className={`
        relative overflow-hidden
        flex flex-col items-center justify-between
        p-4 sm:p-5 lg:p-6
        rounded-[21px]
        border-[3.5px] sm:border-[4px] lg:border-[5px]
        border-[rgba(255,255,255,0.45)]
        transition-all duration-300
        hover:scale-[1.02]
        ${isCarousel ? "w-full h-full" : "w-full min-h-[201.5px] sm:min-h-[220px] lg:min-h-[230px]"}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.20) 100%)",
        boxShadow: "0px 9px 11.2px rgba(0, 0, 0, 0.24), inset 0px -2px 4px rgba(0, 0, 0, 0.2), inset 0px 2px 4px rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(51.5px)",
        WebkitBackdropFilter: "blur(51.5px)",
        borderRadius: "21px",
      }}
    >
      {/* Ellipse 4 Figma (#EB8B68 dengan filter blur 32px) */}
      <div
        className="absolute pointer-events-none z-0"
        style={item.ellipseStyle}
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-between w-full h-full gap-1">
        {/* Title Figma (Garet 850 21px / 30px line-height #FFFFFF) */}
        <p
          className="
            text-[18px] sm:text-[20px] lg:text-[21px]
            font-[850]
            text-center
            leading-[30px]
            text-white
            [-webkit-text-stroke:1px_rgba(44,44,44,0.63)]
            [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]
          "
          style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
        >
          {item.titleLine1}
          <br />
          {item.titleLine2}
        </p>

        {/* Stat Number Figma (Garet 850 41px, 90deg Linear Gradient #F3BB99 -> #F43E3E 54.33% -> #E50707) */}
        <div className="flex items-baseline justify-center gap-2 my-0.5">
          <span
            className="
              text-[34px] sm:text-[38px] lg:text-[41px]
              font-[850]
              leading-[59px]
              tracking-normal
              text-center
            "
            style={{
              fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
              background: "linear-gradient(90deg, #F3BB99 0%, #F43E3E 54.33%, #E50707 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.84))",
            }}
          >
            {item.value}
          </span>
        </div>

        {/* Subtitle Figma (Garet 850 17px / 25px line-height #FFFAFA) */}
        <p
          className="
            text-[14px] sm:text-[16px] lg:text-[17px]
            font-[850]
            text-center
            leading-[25px]
            text-[#FFFAFA]
            [-webkit-text-stroke:0.8px_#000000]
            [text-shadow:0px_2px_4px_rgba(0,0,0,0.4)]
          "
          style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
        >
          {item.subtitle}
        </p>
      </div>
    </div>
  );
}

export default function BerandaView() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % CARDS_DATA.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + CARDS_DATA.length) % CARDS_DATA.length);
  };

  return (
    <div className="w-full max-w-[640px] mx-auto mt-2 lg:mt-[56px]">
      {/* Grid Layout for Desktop & Tablet */}
      <div className="hidden sm:grid grid-cols-2 gap-4 lg:gap-5 beranda-desktop-only">
        {CARDS_DATA.map((item) => (
          <StatCard key={item.id} item={item} />
        ))}
      </div>

      {/* Mobile Slider / Deck Layout */}
      <div className="sm:hidden flex flex-col items-center w-full px-2">
        <div className="relative w-full max-w-[340px] h-[220px] flex items-center justify-center">
          {/* Arrow Left */}
          <button
            type="button"
            onClick={prevCard}
            className="hstack-outer-arrow hstack-outer-arrow-left"
            aria-label="Previous card"
          >
            ‹
          </button>

          {/* Active Card Only for crystal clear mobile rendering */}
          <div className="w-[82%] h-full">
            <StatCard item={CARDS_DATA[activeIndex]} isCarousel={true} />
          </div>

          {/* Arrow Right */}
          <button
            type="button"
            onClick={nextCard}
            className="hstack-outer-arrow hstack-outer-arrow-right"
            aria-label="Next card"
          >
            ›
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="carousel-dots-standalone flex items-center justify-center gap-2 mt-3">
          {CARDS_DATA.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`carousel-dot-bare ${idx === activeIndex ? "active" : ""}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

