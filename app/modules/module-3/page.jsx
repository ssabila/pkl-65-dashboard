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

        {/* Content row: sidebar | main content wrapper */}
        <main className="flex-1 flex flex-col min-[1150px]:flex-row items-center min-[1150px]:items-start justify-start gap-4 min-[1150px]:gap-5 2xl:gap-8 px-4 sm:px-6 min-[1150px]:px-8 2xl:px-12 pb-10 pt-2 w-full max-w-[1800px] mx-auto">
          {/* Sidebar - Fixed at left for desktop */}
          <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

          {/* Main Content Area */}
          {activeMenu === "metadata" ? (
            <div className="flex-1 w-full flex justify-center">
              <MetadataView />
            </div>
          ) : (
            <div className="flex-1 w-full flex flex-col min-[1150px]:flex-row items-center min-[1150px]:items-start justify-center gap-4 min-[1150px]:gap-5 2xl:gap-8">
              {/* Cards / View details */}
              <div className="w-full min-[1150px]:w-[430px] 2xl:w-[540px] 3xl:w-[620px] flex-shrink-0 flex flex-col justify-start">
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