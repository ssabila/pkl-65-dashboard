"use client";
import { useState } from "react";
import OpeningPage       from "./components/OpeningPage";
import DashboardLayout   from "./components/DashboardLayout";
import DataHistorisPage  from "./components/DataHistorisPage";
import FaktorBanjirPage  from "./components/FaktorBanjirPage";
import FaktorLongsorPage from "./components/FaktorLongsorPage";

export default function Modul2Page() {
  const [currentPage, setCurrentPage] = useState("opening");
  const [provinsi,    setProvinsi]    = useState("Aceh");
  // dark dikelola di DashboardLayout (persist localStorage),
  // tapi kita perlu state-nya di sini agar page children bisa menerima prop dark.
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("m2-dark") === "1";
  });

  if (currentPage === "opening") {
    return <OpeningPage onNavigate={setCurrentPage} />;
  }

  return (
    <DashboardLayout
      activePage={currentPage}
      onNavigate={setCurrentPage}
      provinsi={provinsi}
      onProvinsiChange={setProvinsi}
      onDarkChange={setDark}
    >
      {currentPage === "data-historis"  && <DataHistorisPage  provinsi={provinsi} dark={dark} />}
      {currentPage === "faktor-banjir"  && <FaktorBanjirPage  provinsi={provinsi} dark={dark} />}
      {currentPage === "faktor-longsor" && <FaktorLongsorPage provinsi={provinsi} dark={dark} />}
    </DashboardLayout>
  );
}