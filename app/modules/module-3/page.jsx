"use client";
import { useState } from "react";
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
      className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/module-3/bg-module-3.webp')" }}
    >
      {/* Gradient hijau gelap ATAS */}
      <div className="absolute inset-x-0 top-0 pointer-events-none z-0" style={{
        height: "200px",
        background: "linear-gradient(180deg, rgba(35,71,42,0.65) 0%, rgba(86,116,97,0.3) 60%, transparent 100%)"
      }} />

      {/* Gradient hijau gelap BAWAH */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none z-0" style={{
        height: "100px",
        background: "linear-gradient(0deg, rgba(15,88,31,0.65) 0%, rgba(43,109,62,0.3) 50%, transparent 100%)"
      }} />

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

        {/* Content row: sidebar | cards | map */}
        <div className="flex flex-1 items-start gap-2 px-2 pb-4 pt-2">
          <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} className="mt-[750px]" />

          {/* Cards (fixed width) */}
          <div className="flex-none mt-[60px] ml-[50px]">
            {activeMenu === "beranda" && <BerandaView />}
            {activeMenu === "banjir" && <BanjirView provinsi={filterProvinsi} kabupaten={filterKabupaten} kecamatan={filterKecamatan} />}
            {activeMenu === "longsor" && <TanahLongsorView provinsi={filterProvinsi} kabupaten={filterKabupaten} kecamatan={filterKecamatan} />}
            {activeMenu === "metadata" && <MetadataView />}
          </div>

          {/* Peta (flex-1: ambil sisa ruang) */}
          {activeMenu !== "metadata" && (
            <div className="flex-1 flex items-center justify-center h-full pr-4">
              <PetaSumatra activeMenu={activeMenu} provinsi={filterProvinsi} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}