"use client";
import { useState } from "react";
import Image from "next/image";

const menus = [
    { id: "beranda", icon: "/module-3/beranda.webp", label: "Beranda" },
    { id: "banjir", icon: "/module-3/banjir.webp", label: "Banjir" },
    { id: "longsor", icon: "/module-3/tanah_longsor.webp", label: "Tanah Longsor" },
    { id: "metadata", icon: "/module-3/catatan_penting.webp", label: "Catatan Penting" },
];

const menuAtas = menus.slice(0, 3);
const menuBawah = menus.slice(3);

export default function Sidebar({ activeMenu, onMenuChange }) {
    const [isHovered, setIsHovered] = useState(false);

    const renderButton = (menu) => {
        const isActive = activeMenu === menu.id;

        return (
            <button
                key={menu.id}
                onClick={() => onMenuChange(menu.id)}
                className="flex items-center w-full transition-all duration-200"
                style={{
                    gap: isHovered ? "10px" : "0px",
                    background: "transparent",
                    borderRadius: "50px",
                    padding: "5px",
                    minHeight: "48px",
                    justifyContent: isHovered ? "flex-start" : "center",
                }}
            >
                <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: isHovered
                            ? isActive ? "rgba(50,50,50,0.9)" : "transparent"
                            : isActive ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.82)",
                    }}
                >
                    <Image
                        src={menu.icon}
                        alt={menu.label}
                        width={35}
                        height={35}
                        className="object-contain"
                        style={{
                            filter: isActive
                                ? "brightness(0) invert(1)"
                                : "brightness(0)",
                        }}
                    />
                </div>

                <span
                    className="font-bold whitespace-nowrap transition-all duration-300 overflow-hidden"
                    style={{
                        fontFamily: "var(--font-garet-heavy)",
                        fontSize: "15px",
                        color: isActive ? "#FFFFFF" : "#5a5a5a",
                        maxWidth: isHovered ? "160px" : "0px",
                        opacity: isHovered ? 1 : 0,
                        background: isHovered && isActive ? "rgba(75,75,75,0.85)" : "transparent",
                        borderRadius: "50px",
                        padding: isHovered ? "10px" : "0px",
                        minWidth: isHovered ? "140px" : "auto",
                        textAlign: "center"
                    }}
                >
                    {menu.label}
                </span>
            </button>
        );
    };

    return (
        <aside className="flex flex-col py-3 px-2 ml-15 mt-[45px] self-start">
            <div
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="flex flex-col py-5 px-2 transition-all duration-300 ease-in-out"
                style={{
                    /* Nilai persis dari Figma:
                       - Atas: 33% putih
                       - Bawah: 0% putih (transparan penuh → warna background terlihat) */
                    background: isHovered
                        ? "rgba(255, 255, 255, 0.93)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0) 100%)",

                    boxShadow: isHovered
                        ? "0px 0px 20px rgba(0,0,0,0.12)"
                        : "inset 0px -2px 4px rgba(0,0,0,0.2), inset 0px 2px 4px rgba(255,255,255,0.4)",

                    /* blur 51.5px sesuai Figma — cukup besar untuk efek glass nyata */
                    backdropFilter: isHovered ? "none" : "blur(51.5px)",

                    border: isHovered
                        ? "none"
                        : "4px solid rgba(255,255,255,0.70)",

                    borderRadius: isHovered ? "24px" : "71px",
                    width: isHovered ? "240px" : "84px",
                    minHeight: "544px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <div className="flex flex-col gap-3">
                    {menuAtas.map(renderButton)}
                </div>
                <div className="flex flex-col gap-3">
                    {menuBawah.map(renderButton)}
                </div>
            </div>
        </aside>
    );
}