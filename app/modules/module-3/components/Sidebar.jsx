"use client";
import { useState } from "react";
import Image from "next/image";

const menus = [
  { id: "beranda", icon: "/module-3/beranda.webp", label: "Beranda" },
  { id: "banjir", icon: "/module-3/banjir.webp", label: "Banjir" },
  { id: "longsor", icon: "/module-3/tanah_longsor.webp", label: "Tanah Longsor" },
  { id: "metadata", icon: "/module-3/catatan_penting.webp", label: "Catatan Penting" },
];

export default function Sidebar({ activeMenu, onMenuChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden min-[1150px]:block relative w-[90px] 2xl:w-[110.85px] h-[540px] 2xl:h-[594.57px] ml-0 mt-0 self-start z-40 flex-shrink-0">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute top-0 left-0 flex flex-col justify-between py-6 2xl:py-8 px-3 2xl:px-4 transition-all duration-300 ease-in-out z-50 overflow-hidden"
          style={{
            background: isHovered
              ? "rgba(249, 249, 249, 0.98)"
              : "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.12) 100%)",
            boxShadow: isHovered
              ? "0px 16px 40px rgba(0,0,0,0.25), inset 0px 2px 4px 0px rgba(255, 255, 255, 0.40), inset 0px -2px 4px 0px rgba(0, 0, 0, 0.20)"
              : "inset 0px 2px 4px 0px rgba(255, 255, 255, 0.40), inset 0px -2px 4px 0px rgba(0, 0, 0, 0.20), 0px 9px 11.2px 0px rgba(0, 0, 0, 0.71)",
            backdropFilter: isHovered ? "none" : "blur(103px)",
            WebkitBackdropFilter: isHovered ? "none" : "blur(103px)",
            border: isHovered ? "2px solid rgba(255,255,255,0.9)" : "5px solid rgba(255, 255, 255, 0.45)",
            borderRadius: isHovered ? "36px" : "70px",
            width: isHovered ? "310px" : "100%",
            height: "100%",
          }}
        >
          {/* Menu Atas (Beranda, Banjir, Tanah Longsor) */}
          <div className="flex flex-col gap-4 2xl:gap-5">
            {menus.slice(0, 3).map((menu) => {
              const isActive = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => onMenuChange(menu.id)}
                  className="flex items-center w-full transition-all duration-200 group"
                  style={{
                    gap: isHovered ? "14px" : "0px",
                    borderRadius: "50px",
                    justifyContent: isHovered ? "flex-start" : "center",
                  }}
                >
                  {/* Icon Circle */}
                  <div
                    className="flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: isHovered
                        ? isActive ? "#4A4545" : "#FFFFFF"
                        : isActive ? "#272525" : "rgba(255,255,255,0.85)",
                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Image
                      src={menu.icon}
                      alt={menu.label}
                      width={34}
                      height={34}
                      className="object-contain"
                      style={{
                        filter: isHovered
                          ? isActive ? "brightness(0) invert(1)" : "brightness(0.15)"
                          : isActive ? "brightness(0) invert(1)" : "brightness(0.2)",
                      }}
                    />
                  </div>

                  {/* Label Text / Pill Capsule */}
                  <div
                    className="whitespace-nowrap transition-all duration-300 overflow-hidden flex items-center justify-center"
                    style={{
                      maxWidth: isHovered ? "210px" : "0px",
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <span
                      className="font-bold text-center block"
                      style={{
                        fontFamily: "var(--font-garet-heavy), sans-serif",
                        fontSize: "16px",
                        color: isActive ? "#FFFFFF" : "#5C5555",
                        background: isActive ? "#605858" : "transparent",
                        borderRadius: "50px",
                        padding: isActive ? "8px 20px" : "4px 8px",
                        boxShadow: isActive ? "0 3px 10px rgba(0,0,0,0.18)" : "none",
                      }}
                    >
                      {menu.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Menu Bawah (Catatan Penting) */}
          <div className="flex flex-col gap-4 2xl:gap-5">
            {menus.slice(3).map((menu) => {
              const isActive = activeMenu === menu.id;
              return (
                <button
                  key={menu.id}
                  type="button"
                  onClick={() => onMenuChange(menu.id)}
                  className="flex items-center w-full transition-all duration-200 group"
                  style={{
                    gap: isHovered ? "14px" : "0px",
                    borderRadius: "50px",
                    justifyContent: isHovered ? "flex-start" : "center",
                  }}
                >
                  {/* Icon Circle */}
                  <div
                    className="flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: isHovered
                        ? isActive ? "#4A4545" : "#FFFFFF"
                        : isActive ? "#272525" : "rgba(255,255,255,0.85)",
                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                  >
                    <Image
                      src={menu.icon}
                      alt={menu.label}
                      width={34}
                      height={34}
                      className="object-contain"
                      style={{
                        filter: isHovered
                          ? isActive ? "brightness(0) invert(1)" : "brightness(0.15)"
                          : isActive ? "brightness(0) invert(1)" : "brightness(0.2)",
                      }}
                    />
                  </div>

                  {/* Label Text / Pill Capsule */}
                  <div
                    className="whitespace-nowrap transition-all duration-300 overflow-hidden flex items-center justify-center"
                    style={{
                      maxWidth: isHovered ? "210px" : "0px",
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <span
                      className="font-bold text-center block"
                      style={{
                        fontFamily: "var(--font-garet-heavy), sans-serif",
                        fontSize: "16px",
                        color: isActive ? "#FFFFFF" : "#5C5555",
                        background: isActive ? "#605858" : "transparent",
                        borderRadius: "50px",
                        padding: isActive ? "8px 20px" : "4px 8px",
                        boxShadow: isActive ? "0 3px 10px rgba(0,0,0,0.18)" : "none",
                      }}
                    >
                      {menu.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ================= MOBILE & TABLET (IPAD AIR & IPAD PRO) HAMBURGER BUTTON ================= */}
      <div className="max-[1149px]:block min-[1150px]:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-[999]">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-white font-bold shadow-[0_8px_20px_rgba(0,0,0,0.3)] border-[2px] border-white/50 backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.15) 100%)",
            boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), 0 8px 20px rgba(0,0,0,0.3)",
          }}
          aria-label="Open Navigation Menu"
        >
          <svg className="w-6 h-6 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="hidden sm:inline-block text-xs font-black tracking-wider uppercase drop-shadow" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
            Menu
          </span>
        </button>
      </div>

      {/* ================= MOBILE & TABLET DRAWER OVERLAY ================= */}
      {isMobileOpen && (
        <div className="min-[1150px]:hidden fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className="relative w-[290px] max-w-[85vw] h-full flex flex-col p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10 transition-transform duration-300 ease-out"
            style={{
              background: "linear-gradient(180deg, rgba(23, 38, 71, 0.97) 0%, rgba(38, 56, 95, 0.98) 100%)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRight: "2.5px solid rgba(255,255,255,0.35)",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/20">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#F7C564] font-black tracking-widest uppercase" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                  PKL 65 Modul 3
                </span>
                <span className="text-xl font-black text-white drop-shadow" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                  Navigasi Utama
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-90 flex items-center justify-center text-white font-bold transition-all border border-white/30"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-3.5 mt-6">
              {menus.map((menu) => {
                const isActive = activeMenu === menu.id;
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => {
                      onMenuChange(menu.id);
                      setIsMobileOpen(false);
                    }}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 text-left ${
                      isActive
                        ? "bg-white/25 border-2 border-[#F7C564] text-white font-black shadow-[0_6px_16px_rgba(0,0,0,0.3)] scale-[1.02]"
                        : "bg-white/10 border border-white/20 text-white/85 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                        isActive ? "bg-[#272525] shadow-md scale-105" : "bg-white/20"
                      }`}
                    >
                      <Image
                        src={menu.icon}
                        alt={menu.label}
                        width={24}
                        height={24}
                        className="object-contain"
                        style={{
                          filter: isActive ? "brightness(0) invert(1)" : "brightness(0) invert(0.9)",
                        }}
                      />
                    </div>
                    <span className="text-[15px] sm:text-[16px] tracking-wide" style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}>
                      {menu.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}