"use client";
import { useState } from "react";
import OpeningPage      from "./components/OpeningPage";
import DashboardLayout  from "./components/DashboardLayout";
import DataHistorisPage from "./components/DataHistorisPage";
import FaktorBanjirPage from "./components/FaktorBanjirPage";
import FaktorLongsorPage from "./components/FaktorLongsorPage";

export default function Modul2Page() {
  const [currentPage, setCurrentPage] = useState("opening");
  const [provinsi,    setProvinsi]    = useState("Aceh");

  if (currentPage === "opening") {
    return <OpeningPage onNavigate={setCurrentPage} />;
  }

  return (
    <DashboardLayout
      activePage={currentPage}
      onNavigate={setCurrentPage}
      provinsi={provinsi}
      onProvinsiChange={setProvinsi}
    >
      {currentPage === "data-historis"  && <DataHistorisPage  provinsi={provinsi} />}
      {currentPage === "faktor-banjir"  && <FaktorBanjirPage  provinsi={provinsi} />}
      {currentPage === "faktor-longsor" && <FaktorLongsorPage provinsi={provinsi} />}
    </DashboardLayout>
  );
}
