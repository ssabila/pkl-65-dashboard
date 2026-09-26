"use client";
import { useState, useEffect } from "react";
import "./module3.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PetaSumatra from "./components/PetaSumatra";
import BerandaView from "./components/BerandaView";
import BanjirView from "./components/BanjirView";
import TanahLongsorView from "./components/TanahLongsorView";
import MetadataView from "./components/MetadataView";

export default function Modul3Page() {
  const [activeMenu, setActiveMenu] = useState("beranda");
  const [filterProvinsi, setFilterProvinsi] = useState("");
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");

  const [scale, setScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);
  const [supportsZoom, setSupportsZoom] = useState(true);

  useEffect(() => {
    // Deteksi dukungan native CSS zoom
    const testZoom = typeof CSS !== "undefined" && CSS.supports && CSS.supports("zoom", "1");
    setSupportsZoom(Boolean(testZoom));

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Di bawah 1024px (ponsel / tablet potret) gunakan responsive layout mobile biasa
      if (w < 1024) {
        setIsDesktop(false);
        setScale(1);
        return;
      }

      setIsDesktop(true);

      // Kanvas acuan desktop: 1536px (standar layar laptop desktop 100%)
      const scaleX = w / 1536;
      const scaleY = (h - 20) / 840;

      // Hitung skala agar pas secara visual di berbagai resolusi & level zoom
      const targetScale = Math.min(scaleX, Math.max(0.70, scaleY));
      const finalScale = Math.min(1.15, Math.max(0.70, targetScale));
      setScale(finalScale);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="mod3-root relative min-h-screen overflow-x-hidden"
      style={{
        background: "linear-gradient(180deg, #1F5FA8 0%, #D5AF89 100%)",
      }}
    >

      {/* Konten utama dengan Auto-Scaling agar tampak sama di semua persentase zoom/skala laptop */}
      <div
        className="relative z-10 flex flex-col min-h-screen"
        style={
          isDesktop && scale !== 1
            ? supportsZoom
              ? { zoom: scale }
              : {
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  width: `${100 / scale}%`,
                }
            : {}
        }
      >
        <Header
          filterProvinsi={filterProvinsi}
          setFilterProvinsi={setFilterProvinsi}
          filterKabupaten={filterKabupaten}
          setFilterKabupaten={setFilterKabupaten}
          filterKecamatan={filterKecamatan}
          setFilterKecamatan={setFilterKecamatan}
        />

        {/* Content row: sidebar | main content wrapper */}
        <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-5 2xl:gap-8 px-4 sm:px-6 lg:px-8 2xl:px-12 pb-10 pt-2 w-full max-w-[1800px] mx-auto">
          {/* Sidebar - Fixed at left for desktop */}
          <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

          {/* Main Content Area */}
          {activeMenu === "metadata" ? (
            <div className="flex-1 w-full flex justify-center">
              <MetadataView />
            </div>
          ) : (
            <div className="flex-1 w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-5 2xl:gap-8">
              {/* Cards / View details */}
              <div className="w-full lg:w-[460px] 2xl:w-[540px] 3xl:w-[620px] flex-shrink-0 flex flex-col justify-start">
                {activeMenu === "beranda" && <BerandaView />}
                {activeMenu === "banjir" && <BanjirView provinsi={filterProvinsi} kabupaten={filterKabupaten} kecamatan={filterKecamatan} />}
                {activeMenu === "longsor" && <TanahLongsorView provinsi={filterProvinsi} kabupaten={filterKabupaten} kecamatan={filterKecamatan} />}
              </div>

              {/* Peta Sumatra */}
              <div className="flex-1 w-full min-w-0 flex items-center justify-center">
                <PetaSumatra
                  activeMenu={activeMenu}
                  provinsi={filterProvinsi}
                  setProvinsi={setFilterProvinsi}
                  kabupaten={filterKabupaten}
                  setKabupaten={setFilterKabupaten}
                  kecamatan={filterKecamatan}
                  setKecamatan={setFilterKecamatan}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}