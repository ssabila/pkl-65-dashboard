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
      className={`relative overflow-hidden flex flex-col items-center justify-between p-4 sm:p-5 lg:p-6 rounded-[21px] border-[3.5px] sm:border-[4px] lg:border-[5px] border-[rgba(255,255,255,0.45)] transition-all duration-300 hover:scale-[1.02] ${
        isCarousel ? "w-full h-full" : "w-full min-h-[201.5px] sm:min-h-[220px] lg:min-h-[230px]"
      }`}
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
        {/* Title Figma */}
        <p
          className="text-[18px] sm:text-[20px] lg:text-[21px] font-[850] text-center leading-[30px] text-white [-webkit-text-stroke:1px_rgba(44,44,44,0.63)] [text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]"
          style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
        >
          {item.titleLine1}
          <br />
          {item.titleLine2}
        </p>

        {/* Stat Number Figma */}
        <div className="flex items-baseline justify-center gap-2 my-0.5">
          <span
            className="text-[34px] sm:text-[38px] lg:text-[41px] font-[850] leading-[59px] tracking-normal text-center"
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

        {/* Subtitle Figma */}
        <p
          className="text-[14px] sm:text-[16px] lg:text-[17px] font-[850] text-center leading-[25px] text-[#FFFAFA] [-webkit-text-stroke:0.8px_#000000] [text-shadow:0px_2px_4px_rgba(0,0,0,0.4)]"
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
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % CARDS_DATA.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + CARDS_DATA.length) % CARDS_DATA.length);
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextCard();
    } else if (isRightSwipe) {
      prevCard();
    }
  };

  return (
    <div className="w-full max-w-[640px] mx-auto mt-2 xl:mt-[40px] 2xl:mt-[56px] select-none">
      {/* Grid Layout for Desktop & Tablet (screens >= 640px) */}
      <div className="hidden sm:grid grid-cols-2 gap-4 lg:gap-5 beranda-desktop-only">
        {CARDS_DATA.map((item) => (
          <StatCard key={item.id} item={item} />
        ))}
      </div>

      {/* Mobile 3D Side-Stacked / Coverflow Carousel Layout (< 640px) */}
      <div className="sm:hidden flex flex-col items-center w-full px-1">
        <div
          className="relative w-full max-w-[420px] h-[255px] flex items-center justify-center pt-2 overflow-hidden touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Left Navigation Arrow */}
          <button
            type="button"
            onClick={prevCard}
            className="absolute left-1 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/45 backdrop-blur-md border-[2px] border-white/70 shadow-[0_6px_16px_rgba(0,0,0,0.3)] flex items-center justify-center text-white text-xl sm:text-2xl font-bold transition-all duration-200 hover:bg-white/65 active:scale-90"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            aria-label="Previous card"
          >
            ‹
          </button>

          {/* 3D Side-Stacked Container */}
          <div className="relative w-[68%] h-[215px] flex items-center justify-center">
            {CARDS_DATA.map((item, idx) => {
              const total = CARDS_DATA.length;
              let diff = idx - activeIndex;

              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isCenter = diff === 0;
              const isLeft = diff === -1;
              const isRight = diff === 1;

              let transformStyle = "translate3d(0, 0, 0) scale(1)";
              let zIndex = 30;
              let opacity = 1;
              let filter = "none";

              if (isLeft) {
                transformStyle = "translate3d(-62%, 0, -20px) scale(0.82) rotateY(15deg)";
                zIndex = 20;
                opacity = 0.70;
                filter = "brightness(0.9) blur(0.5px)";
              } else if (isRight) {
                transformStyle = "translate3d(62%, 0, -20px) scale(0.82) rotateY(-15deg)";
                zIndex = 20;
                opacity = 0.70;
                filter = "brightness(0.9) blur(0.5px)";
              } else if (!isCenter) {
                transformStyle = `translate3d(${diff * 80}%, 0, -50px) scale(0.65)`;
                zIndex = 10;
                opacity = 0;
                filter = "blur(4px)";
              }

              return (
                <div
                  key={item.id}
                  className="absolute inset-0 transition-all duration-500 cubic-bezier(0.34, 1.25, 0.64, 1) pointer-events-auto cursor-pointer rounded-[21px]"
                  style={{
                    transform: transformStyle,
                    zIndex,
                    opacity,
                    filter,
                    transformOrigin: "center center",
                    boxShadow: isCenter ? "0 14px 32px rgba(0,0,0,0.35)" : "0 6px 16px rgba(0,0,0,0.2)",
                  }}
                  onClick={() => {
                    if (!isCenter) setActiveIndex(idx);
                  }}
                >
                  <StatCard item={item} isCarousel={true} />
                </div>
              );
            })}
          </div>

          {/* Right Navigation Arrow */}
          <button
            type="button"
            onClick={nextCard}
            className="absolute right-1 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/45 backdrop-blur-md border-[2px] border-white/70 shadow-[0_6px_16px_rgba(0,0,0,0.3)] flex items-center justify-center text-white text-xl sm:text-2xl font-bold transition-all duration-200 hover:bg-white/65 active:scale-90"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            aria-label="Next card"
          >
            ›
          </button>
        </div>

        {/* Carousel Indicators / Dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {CARDS_DATA.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-7 h-2.5 bg-[#F7C564] shadow-[0_2px_8px_rgba(247,197,100,0.6)]"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
