"use client";

import { useState, useEffect } from "react";
import GenericDropdown from "../components/GenericDropdown";
import KomponenPieCard from "./KomponenPieCard";
import {
  PROVINSI_LIST_KOMPONEN,
  getKabupatenList,
  getWilayahByKDPKAB,
} from "../data";
import "./komponen.css";

/**
 * Komponen tab — shows CRS/Hazard/Exposure/Vulnerability indices
 * and pie chart breakdowns for a selected kabupaten.
 */
export default function KomponenTab() {
  const [kompProvinsi, setKompProvinsi] = useState("aceh");
  const [kompKabupaten, setKompKabupaten] = useState("");

  const kabupatenList = getKabupatenList(kompProvinsi);

  // Auto-select first kabupaten when province changes
  useEffect(() => {
    const list = getKabupatenList(kompProvinsi);
    if (list.length > 0) {
      setKompKabupaten(list[0].value);
    } else {
      setKompKabupaten("");
    }
  }, [kompProvinsi]);

  const selectedWilayah = getWilayahByKDPKAB(kompKabupaten);

  // Build component data for pie charts
  const hazardComponents = selectedWilayah
    ? [
        { key: "hujan", label: "Curah Hujan", value: selectedWilayah.hazard_components.hujan_norm },
        { key: "slope", label: "Kemiringan Lereng", value: selectedWilayah.hazard_components.slope_norm },
        { key: "elevasi", label: "Elevasi", value: selectedWilayah.hazard_components.elevasi_norm },
        { key: "ndbi", label: "NDBI", value: selectedWilayah.hazard_components.ndbi_norm },
        { key: "ndvi", label: "NDVI", value: selectedWilayah.hazard_components.ndvi_norm },
        { key: "ndwi", label: "NDWI", value: selectedWilayah.hazard_components.ndwi_norm },
        { key: "soil_risk", label: "Risiko Tanah", value: selectedWilayah.hazard_components.soil_risk_norm },
        { key: "soil_div", label: "Diversitas Tanah", value: selectedWilayah.hazard_components.soil_div_norm },
      ]
    : [];

  const exposureComponents = selectedWilayah
    ? [
        { key: "use", label: "Penggunaan Bangunan", value: selectedWilayah.exposure_components.norm_use },
        { key: "jumlah", label: "Jumlah Bangunan", value: selectedWilayah.exposure_components.norm_jumlah },
        { key: "ndbi", label: "NDBI", value: selectedWilayah.exposure_components.norm_ndbi },
      ]
    : [];

  const vulnerabilityComponents = selectedWilayah
    ? [
        { key: "keterpaparan", label: "Keterpaparan", value: selectedWilayah.vulnerability_components.indeks_keterpaparan },
        { key: "sensitivitas", label: "Sensitivitas", value: selectedWilayah.vulnerability_components.indeks_sensitivitas },
        { key: "adaptasi", label: "Kapasitas Adaptasi", value: selectedWilayah.vulnerability_components.indeks_adaptasi },
      ]
    : [];

  return (
    <>
      {/* Controls: dropdowns + summary card */}
      <div className="m6-komp-controls">
        <div className="m6-komp-controls__dropdowns">
          <GenericDropdown
            id="m6-komp-provinsi"
            value={kompProvinsi}
            onChange={setKompProvinsi}
            options={PROVINSI_LIST_KOMPONEN}
            placeholder="Provinsi"
          />
          <GenericDropdown
            id="m6-komp-kabupaten"
            value={kompKabupaten}
            onChange={setKompKabupaten}
            options={kabupatenList}
            placeholder="Kabupaten"
          />
        </div>

        {selectedWilayah ? (
          <div className="m6-komp-summary" id="m6-komp-summary">
            <h3 className="m6-komp-summary__title">{selectedWilayah.WADMKK}</h3>
            <div className="m6-komp-summary__indices">
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">CRS</span>
                <span className="m6-komp-index__box">
                  {(selectedWilayah.norm_crs * 100).toFixed(1)}
                </span>
              </div>
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">Hazard</span>
                <span className="m6-komp-index__box">
                  {(selectedWilayah.indeks_hazard * 100).toFixed(1)}
                </span>
              </div>
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">Vulnerability</span>
                <span className="m6-komp-index__box">
                  {(selectedWilayah.indeks_kerentanan * 100).toFixed(1)}
                </span>
              </div>
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">Exposure</span>
                <span className="m6-komp-index__box">
                  {(selectedWilayah.indeks_exposure * 100).toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="m6-komp-summary" id="m6-komp-summary">
            <h3 className="m6-komp-summary__title">Pilih Kabupaten</h3>
            <div className="m6-komp-summary__indices">
              {["CRS", "Hazard", "Vulnerability", "Exposure"].map((l) => (
                <div className="m6-komp-index" key={l}>
                  <span className="m6-komp-index__label">{l}</span>
                  <span className="m6-komp-index__box">—</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pie chart cards */}
      {selectedWilayah ? (
        <div className="m6-komp-cards">
          <KomponenPieCard
            title="Hazard"
            mainLabel="Komponen Utama"
            components={hazardComponents}
          />
          <KomponenPieCard
            title="Exposure"
            mainLabel="Komponen Utama"
            components={exposureComponents}
          />
          <KomponenPieCard
            title="Vulnerability"
            mainLabel="Komponen Utama"
            components={vulnerabilityComponents}
          />
        </div>
      ) : (
        <div className="m6-komp-empty">
          <div className="m6-komp-empty__icon">📊</div>
          <div className="m6-komp-empty__text">
            Pilih provinsi dan kabupaten untuk melihat komponen
          </div>
          <div className="m6-komp-empty__sub">
            Data komposisi Hazard, Exposure, dan Vulnerability akan ditampilkan
          </div>
        </div>
      )}
    </>
  );
}
