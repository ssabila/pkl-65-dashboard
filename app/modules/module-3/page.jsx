"use client";
import { useState } from "react";
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

  return (
    <div
      className="mod3-root relative min-h-screen overflow-x-hidden"
      style={{
        background: "linear-gradient(180deg, #1F5FA8 0%, #D5AF89 100%)",
      }}
    >

      {/* Konten utama */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          filterProvinsi={filterProvinsi}
          setFilterProvinsi={setFilterProvinsi}
          filterKabupaten={filterKabupaten}
          setFilterKabupaten={setFilterKabupaten}
          filterKecamatan={filterKecamatan}
          setFilterKecamatan={setFilterKecamatan}
        />

        {/* Content row: sidebar | main content (cards/views) | map */}
        <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-8 px-4 sm:px-8 lg:px-12 pb-10 pt-2 w-full max-w-[1800px] mx-auto">
          {/* Sidebar */}
          <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

          {/* Center Main View (Cards / Details) */}
          <div className="flex-1 w-full max-w-[650px] flex flex-col justify-start">
            {activeMenu === "beranda" && <BerandaView />}
            {activeMenu === "banjir" && <BanjirView provinsi={filterProvinsi} kabupaten={filterKabupaten} kecamatan={filterKecamatan} />}
            {activeMenu === "longsor" && <TanahLongsorView provinsi={filterProvinsi} kabupaten={filterKabupaten} kecamatan={filterKecamatan} />}
            {activeMenu === "metadata" && <MetadataView />}
          </div>

          {/* Peta Sumatra (Right Side) */}
          {activeMenu !== "metadata" && (
            <div className="flex-1 w-full flex items-center justify-center">
              <PetaSumatra activeMenu={activeMenu} provinsi={filterProvinsi} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}