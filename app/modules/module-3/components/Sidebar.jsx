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
      <aside className="hidden lg:block relative w-[110.85px] h-[594.57px] ml-0 lg:ml-0 mt-0 self-start z-40">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="absolute top-0 left-0 flex flex-col justify-between py-8 px-4 transition-all duration-300 ease-in-out z-50 overflow-hidden"
          style={{
            background: isHovered
              ? "rgba(249, 249, 249, 0.98)"
              : "linear-gradient(180deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.12) 100%)",
            boxShadow: isHovered
              ? "0px 16px 40px rgba(0,0,0,0.25), inset 0px 2px 4px 0px rgba(255, 255, 255, 0.40), inset 0px -2px 4px 0px rgba(0, 0, 0, 0.20)"
              : "inset 0px 2px 4px 0px rgba(255, 255, 255, 0.40), inset 0px -2px 4px 0px rgba(0, 0, 0, 0.20), 0px 9px 11.2px 0px rgba(0, 0, 0, 0.71)",
            backdropFilter: isHovered ? "none" : "blur(103px)",
            WebkitBackdropFilter: isHovered ? "none" : "blur(103px)",
            border: isHovered ? "2px solid rgba(255,255,255,0.9)" : "3.5px solid rgba(255,255,255,0.75)",
            borderRadius: isHovered ? "36px" : "70px",
            width: isHovered ? "330px" : "110.85px",
            height: "594.57px",
          }}
        >
          {/* Menu Atas (Beranda, Banjir, Tanah Longsor) */}
          <div className="flex flex-col gap-5">
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
                      width: "70px",
                      height: "70px",
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
                      width={40}
                      height={40}
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
                      maxWidth: isHovered ? "220px" : "0px",
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <span
                      className="font-bold text-center block"
                      style={{
                        fontFamily: "var(--font-garet-heavy), sans-serif",
                        fontSize: "17px",
                        color: isActive ? "#FFFFFF" : "#5C5555",
                        background: isActive ? "#605858" : "transparent",
                        borderRadius: "50px",
                        padding: isActive ? "8px 24px" : "4px 8px",
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
          <div className="flex flex-col gap-5">
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
                      width: "70px",
                      height: "70px",
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
                      width={40}
                      height={40}
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
                      maxWidth: isHovered ? "220px" : "0px",
                      opacity: isHovered ? 1 : 0,
                    }}
                  >
                    <span
                      className="font-bold text-center block"
                      style={{
                        fontFamily: "var(--font-garet-heavy), sans-serif",
                        fontSize: "17px",
                        color: isActive ? "#FFFFFF" : "#5C5555",
                        background: isActive ? "#605858" : "transparent",
                        borderRadius: "50px",
                        padding: isActive ? "8px 24px" : "4px 8px",
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

      {/* ================= MOBILE HAMBURGER BUTTON ================= */}
      <div className="lg:hidden fixed top-4 left-4 z-[999]">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="
            flex items-center justify-center
            w-11 h-11 rounded-2xl
            text-white font-bold
            shadow-lg border border-white/40
            backdrop-blur-xl transition-transform active:scale-95
          "
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 100%)",
          }}
          aria-label="Open Navigation Menu"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className="
              relative w-[280px] max-w-[85vw] h-full
              flex flex-col p-6
              shadow-2xl z-10
            "
            style={{
              background: "linear-gradient(180deg, rgba(28, 45, 36, 0.96) 0%, rgba(15, 24, 20, 0.98) 100%)",
              backdropFilter: "blur(40px)",
              borderRight: "1.5px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-xs text-amber-400 font-bold tracking-wider uppercase">PKL 65 Modul 3</span>
                <span className="text-lg font-black text-white" style={{ fontFamily: "var(--font-garet-heavy)" }}>
                  Navigasi Utama
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-3 mt-6">
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
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-left
                      ${isActive ? "bg-white/20 border border-amber-400/80 text-white font-black" : "bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"}
                    `}
                  >
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={menu.icon}
                        alt={menu.label}
                        width={22}
                        height={22}
                        className="object-contain filter brightness-0 invert"
                      />
                    </div>
                    <span className="text-base" style={{ fontFamily: "var(--font-garet-heavy)" }}>
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