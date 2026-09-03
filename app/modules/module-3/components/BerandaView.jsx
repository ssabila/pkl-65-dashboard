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

// Data cards beranda
const CARDS_DATA = [
  {
    id: 1,
    titleLine1: "Total Luas Area",
    titleLine2: "Banjir (Ha)",
    value: formatAngka(STATS.totalLuasBanjir),
    subtitle: "15% dari total wilayah",
  },
  {
    id: 2,
    titleLine1: "Jumlah Kota",
    titleLine2: "Terdampak",
    value: STATS.jumlahKotaTerdampak,
    subtitle: "dari 30 kab/kota",
  },
  {
    id: 3,
    titleLine1: "Jumlah Kecamatan",
    titleLine2: "Terdampak",
    value: STATS.jumlahKecamatanTerdampak,
    subtitle: "dari 30 kecamatan",
  },
  {
    id: 4,
    titleLine1: "Total Luas Area",
    titleLine2: "Longsor (Ha)",
    value: formatAngka(STATS.totalLuasLongsor),
    subtitle: "15% dari total wilayah",
  },
];

// Single Card Component
function StatCard({ item, isCarousel = false }) {
  return (
    <div
      className={`
        flex flex-col items-center justify-between
        p-4 sm:p-5 lg:p-6
        rounded-[28px] sm:rounded-[32px]
        transition-all duration-300
        hover:scale-[1.02]
        ${isCarousel ? "w-full h-full" : "w-full min-h-[220px] sm:min-h-[240px] lg:min-h-[250px]"}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.22) 100%)",
        boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.25), 0px 12px 36px rgba(0,0,0,0.18)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: "3.5px solid rgba(255, 255, 255, 0.75)",
      }}
    >
      {/* Title */}
      <p
        className="
          text-[17px] sm:text-[20px] lg:text-[22px]
          font-[850]
          text-center
          leading-tight
          text-white
          [-webkit-text-stroke:1px_rgba(44,44,44,0.63)]
          [text-shadow:0_3px_6px_rgba(0,0,0,0.35)]
        "
        style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
      >
        {item.titleLine1}
        <br />
        {item.titleLine2}
      </p>

      {/* Divider */}
      <div
        className="w-full h-[2px] my-1 opacity-80"
        style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #E0C9C9 100%)" }}
      />

      {/* Figma Stat Number (Font 850 Heavy 41px, Gradient #F3BB99 -> #F43E3E -> #E50707, Drop Shadow 0 4px 4px 84%) */}
      <div className="flex items-baseline justify-center gap-2 my-1">
        <span
          className="
            text-[34px] sm:text-[38px] lg:text-[41px]
            font-[850]
            leading-none
            tracking-normal
            text-center
          "
          style={{
            fontFamily: "var(--font-garet-heavy), 'Garet-Heavy', sans-serif",
            background: "linear-gradient(180deg, #F3BB99 0%, #F43E3E 50%, #E50707 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.84))",
          }}
        >
          {item.value}
        </span>
      </div>

      {/* Subtitle */}
      <p
        className="
          text-[14px] sm:text-[16px] lg:text-[18px]
          font-[850]
          text-center
          text-[#FFF4F4]
          [text-shadow:0_2px_4px_rgba(0,0,0,0.4)]
        "
        style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
      >
        {item.subtitle}
      </p>
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
    <div className="w-full max-w-[640px] mx-auto lg:mt-6">
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

