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

  // Build component data for pie charts from real dataset
  const hazardComponents = selectedWilayah
    ? [
        {
          key: "banjir",
          label: "Bahaya Banjir",
          value:
            selectedWilayah.hazard_components?.banjir ??
            selectedWilayah.hazard?.skor_banjir ??
            0,
        },
        {
          key: "longsor",
          label: "Bahaya Longsor",
          value:
            selectedWilayah.hazard_components?.longsor ??
            selectedWilayah.hazard?.skor_longsor ??
            0,
        },
      ]
    : [];

  const exposureComponents = selectedWilayah
    ? [
        {
          key: "landuse",
          label: "Tutupan Lahan",
          value:
            selectedWilayah.exposure_components?.landuse ??
            selectedWilayah.exposure?.norm_landuse ??
            0,
        },
        {
          key: "penduduk",
          label: "Kepadatan Penduduk",
          value:
            selectedWilayah.exposure_components?.penduduk ??
            selectedWilayah.exposure?.norm_penduduk ??
            0,
        },
        {
          key: "ndbi",
          label: "Kerapatan Bangunan (NDBI)",
          value:
            selectedWilayah.exposure_components?.ndbi ??
            selectedWilayah.exposure?.norm_ndbi ??
            0,
        },
      ]
    : [];

  const vulnerabilityComponents = selectedWilayah
    ? [
        {
          key: "keterpaparan",
          label: "Keterpaparan",
          value:
            selectedWilayah.vulnerability_components?.keterpaparan ??
            selectedWilayah.vulnerability?.indeks_keterpaparan ??
            0,
        },
        {
          key: "sensitivitas",
          label: "Sensitivitas",
          value:
            selectedWilayah.vulnerability_components?.sensitivitas ??
            selectedWilayah.vulnerability?.indeks_sensitivitas ??
            0,
        },
        {
          key: "adaptasi",
          label: "Kapasitas Adaptasi",
          value:
            selectedWilayah.vulnerability_components?.adaptasi ??
            selectedWilayah.vulnerability?.indeks_adaptasi ??
            0,
        },
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
            <h3 className="m6-komp-summary__title">
              {selectedWilayah.WADMKK} ({selectedWilayah.WADMPP})
            </h3>
            <div className="m6-komp-summary__indices">
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">CRS (Indeks / Norm)</span>
                <span
                  className="m6-komp-index__box"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    padding: "4px 8px",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                    {selectedWilayah.indeks_crs.toFixed(4)}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", opacity: 0.8 }}>
                    ({(selectedWilayah.norm_crs * 100).toFixed(1)}%)
                  </span>
                </span>
                <span
                  className={`m6-komp-badge m6-komp-badge--${(
                    selectedWilayah.status_crs || ""
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {selectedWilayah.status_crs}
                </span>
              </div>
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">Hazard</span>
                <span
                  className="m6-komp-index__box"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    padding: "4px 8px",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                    {selectedWilayah.indeks_hazard.toFixed(4)}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", opacity: 0.8 }}>
                    ({(selectedWilayah.indeks_hazard * 100).toFixed(1)}%)
                  </span>
                </span>
                <span
                  className={`m6-komp-badge m6-komp-badge--${(
                    selectedWilayah.status_hazard || ""
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {selectedWilayah.status_hazard}
                </span>
              </div>
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">Vulnerability</span>
                <span
                  className="m6-komp-index__box"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    padding: "4px 8px",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                    {selectedWilayah.indeks_kerentanan.toFixed(4)}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", opacity: 0.8 }}>
                    ({(selectedWilayah.indeks_kerentanan * 100).toFixed(1)}%)
                  </span>
                </span>
                <span
                  className={`m6-komp-badge m6-komp-badge--${(
                    selectedWilayah.status_vulnerability || ""
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {selectedWilayah.status_vulnerability}
                </span>
              </div>
              <div className="m6-komp-index">
                <span className="m6-komp-index__label">Exposure</span>
                <span
                  className="m6-komp-index__box"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    padding: "4px 8px",
                  }}
                >
                  <span style={{ fontSize: "1.05rem", fontWeight: "700" }}>
                    {selectedWilayah.indeks_exposure.toFixed(4)}
                  </span>
                  <span style={{ fontSize: "0.75rem", fontWeight: "600", opacity: 0.8 }}>
                    ({(selectedWilayah.indeks_exposure * 100).toFixed(1)}%)
                  </span>
                </span>
                <span
                  className={`m6-komp-badge m6-komp-badge--${(
                    selectedWilayah.status_exposure || ""
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {selectedWilayah.status_exposure}
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
