"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GenericDropdown from "../components/GenericDropdown";
import StatCard from "../components/StatCard";
import CRSBarChart from "./CRSBarChart";
import { PROVINSI_LIST, getFilteredData, getStats } from "../data";
import "./wilayah.css";

// Dynamic client-side import for Leaflet to prevent SSR window reference errors
const SumatraMap = dynamic(() => import("./SumatraMap"), {
  ssr: false,
  loading: () => (
    <div className="m6-map-loading-container">
      <div className="m6-map-loading-spinner" />
      <span className="m6-map-loading-text">Memuat Peta Real Sumatera (Leaflet)...</span>
    </div>
  ),
});

/**
 * Wilayah tab — the primary view of Module 6.
 * Shows a choropleth map, CRS bar chart, stat cards, and province filter.
 */
export default function WilayahTab() {
  const [provinsi, setProvinsi] = useState("all");

  const filteredData = getFilteredData(provinsi);
  const stats = getStats(filteredData);

  return (
    <>
      {/* Controls row */}
      <div className="m6-controls">
        <GenericDropdown
          id="m6-provinsi-dropdown"
          value={provinsi}
          onChange={setProvinsi}
          options={PROVINSI_LIST}
          placeholder="Provinsi"
        />

        <div className="m6-stats">
          <StatCard label="Total Kabupaten" value={stats.total} />
          <StatCard
            label="Risiko Tinggi"
            value={stats.tinggi}
            variant="tinggi"
          />
          <StatCard
            label="Risiko Sedang"
            value={stats.sedang}
            variant="sedang"
          />
          <StatCard
            label="Risiko Rendah"
            value={stats.rendah}
            variant="rendah"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="m6-main">
        {/* Map */}
        <div className="m6-map-panel" id="m6-map-panel">
          <SumatraMap data={filteredData} provinsiKey={provinsi} />
        </div>

        {/* Chart */}
        <div className="m6-chart-panel" id="m6-chart-panel">
          <h3 className="m6-chart-panel__title">
            Top {Math.min(10, filteredData.length)} Kabupaten/Kota — CRS
            Tertinggi
          </h3>
          <div className="m6-chart-container">
            <CRSBarChart data={filteredData} />
          </div>
          <div className="m6-chart-legend">
            <span className="m6-chart-legend__item">
              <span className="m6-chart-legend__dot m6-chart-legend__dot--wilayah" />
              Nama Wilayah
            </span>
            <span className="m6-chart-legend__item">
              <span className="m6-chart-legend__dot m6-chart-legend__dot--crs" />
              CRS
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
