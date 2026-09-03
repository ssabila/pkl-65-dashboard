import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { C, KECAMATAN_TABLE } from "../data/constants";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// HALAMAN 10 
export default function SectionDashboard({ active, setRef, filterActive, setFilterActive }) {
  const [downloadHover, setDownloadHover] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedKec, setSelectedKec] = useState(null);
  const [desaData, setDesaData] = useState([]);

  useEffect(() => {
    fetch("/data/module-5/batasdesa.json")
      .then(res => res.json())
      .then(data => {
        if (data && data.features) setDesaData(data.features.map(f => f.properties));
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!active || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        "version": 8,
        "sources": {
          "osm": {
            "type": "raster",
            "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256,
            "attribution": "© OpenStreetMap contributors"
          }
        },
        "layers": [
          {
            "id": "osm-layer",
            "type": "raster",
            "source": "osm",
            "paint": {
              "raster-saturation": -1,
              "raster-contrast": 0.1,
              "raster-brightness-min": 0.3
            }
          }
        ]
      },
      center: [99.0, 2.0], // Sumatera Utara roughly
      zoom: 6,
      interactive: true
    });

    map.on("load", () => {
      map.addSource("batas-kecamatan", {
        type: "geojson",
        data: "/data/module-5/kec_sumatra.json",
        generateId: true
      });

      map.addLayer({
        id: "kecamatan-fill",
        type: "fill",
        source: "batas-kecamatan",
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            "rgba(217,56,58,0.5)", // C.red
            ["boolean", ["feature-state", "hover"], false],
            "rgba(44,62,80,0.3)", // C.navy hover
            "rgba(0,0,0,0)"
          ],
          "fill-outline-color": "#2C3E50"
        }
      });

      map.addLayer({
        id: "kecamatan-line",
        type: "line",
        source: "batas-kecamatan",
        paint: {
          "line-color": "#2C3E50",
          "line-width": 0.8,
          "line-opacity": 0.3
        }
      });

      let hoveredStateId = null;
      let selectedStateId = null;

      map.on("mousemove", "kecamatan-fill", (e) => {
        if (e.features.length > 0) {
          map.getCanvas().style.cursor = "pointer";
          const newHoverId = e.features[0].id;
          
          if (hoveredStateId !== null && hoveredStateId !== newHoverId && hoveredStateId !== selectedStateId) {
            map.setFeatureState({ source: "batas-kecamatan", id: hoveredStateId }, { hover: false });
          }
          
          hoveredStateId = newHoverId;
          if (hoveredStateId !== selectedStateId) {
             map.setFeatureState({ source: "batas-kecamatan", id: hoveredStateId }, { hover: true });
          }
        }
      });

      map.on("mouseleave", "kecamatan-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredStateId !== null && hoveredStateId !== selectedStateId) {
          map.setFeatureState({ source: "batas-kecamatan", id: hoveredStateId }, { hover: false });
        }
        hoveredStateId = null;
      });

      map.on("click", "kecamatan-fill", (e) => {
        if (e.features.length > 0) {
          const feature = e.features[0];
          
          if (selectedStateId !== null) {
            map.setFeatureState({ source: "batas-kecamatan", id: selectedStateId }, { selected: false });
          }
          
          selectedStateId = feature.id;
          map.setFeatureState({ source: "batas-kecamatan", id: selectedStateId }, { selected: true, hover: false });
          
          setSelectedKec(feature.properties);
        }
      });
      
      map.resetSelection = () => {
        if (selectedStateId !== null) {
          map.setFeatureState({ source: "batas-kecamatan", id: selectedStateId }, { selected: false });
          selectedStateId = null;
          setSelectedKec(null);
        }
        map.flyTo({ center: [99.0, 2.0], zoom: 6, pitch: 0, bearing: 0 });
      };
    });

    mapRef.current = map;
  }, [active]);

  const displayRows = selectedKec ? 
    desaData
      .filter(d => d.WADMKC === selectedKec.WADMKC)
      .map((d, index) => {
        const ikgAwal = parseFloat(d["IKG Baseli"]) || 0;
        const ikgKrisis = parseFloat(d["IKG Pasca"]) || 0;
        const status = d.Klasifikas || (ikgKrisis > 80 ? "Sangat Kritis" : "Kritis");
        return {
          id: index,
          desa: d.NAMOBJ,
          kec: d.WADMKC,
          ikgAwal: ikgAwal.toFixed(1),
          ikgKrisis: ikgKrisis.toFixed(1),
          status: status
        };
      })
    : KECAMATAN_TABLE;

  const tableHeaders = selectedKec 
    ? ["Desa", "Kecamatan", "IKG Awal", "IKG Krisis", "Status"]
    : ["Kecamatan", "Kabupaten", "Bangunan Tergenang", "Jalan Putus (km)", "Status Logistik"];

  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (selectedKec) {
      csvContent += "Desa,Kecamatan,IKG Awal,IKG Krisis,Status\n"
        + displayRows.map(e => `"${e.desa}","${e.kec}",${e.ikgAwal},${e.ikgKrisis},${e.status}`).join("\n");
    } else {
      csvContent += "Kecamatan,Kabupaten,Bangunan Tergenang,Jalan Putus (km),Status Logistik\n"
        + displayRows.map(e => `${e.kec},${e.kab},"${e.bangunan}","${e.jalan}",${e.status}`).join("\n");
    }
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", selectedKec ? `data_desa_kec_${selectedKec.WADMKC.replace(/\s+/g, '_')}.csv` : "data_kerusakan_top5.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section
      ref={setRef}
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(140deg, #A8C4D8 0%, #E8EBEF 45%, #F2C4A4 100%)" }}
    >
      <div className="absolute inset-0 topo-bg" />

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 style={{ fontFamily: "var(--font-garet-bold)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: C.navy, fontWeight: 700, lineHeight: 1.15 }}>
              EKSPLORASI DATA DAMPAK &amp; LOGISTIK
            </h2>
            <p className="mt-1" style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.88rem", color: C.navy, opacity: 0.65, maxWidth: "540px", lineHeight: 1.65 }}>
              Di balik setiap data spasial, terdapat nyawa dan kehidupan yang harus dipulihkan. Gunakan alat interaktif di bawah ini untuk melihat rincian kerusakan hingga tingkat kecamatan.
            </p>
          </div>
          <Link href="/" className="px-4 py-2 rounded-full text-sm flex-shrink-0" style={{ background: "rgba(44,62,80,0.12)", color: C.navy, fontFamily: "var(--font-dm-sans)", backdropFilter: "blur(10px)", border: "1px solid rgba(44,62,80,0.15)" }}>
            ← Beranda
          </Link>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["Semua", "Bangunan", "Jalan", "Jembatan", "Isolasi", "Cahaya Malam", "IKG", "Logistik"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.8rem",
                padding: "6px 14px",
                borderRadius: "999px",
                border: "1px solid rgba(44,62,80,0.2)",
                background: filterActive === f ? C.navy : "rgba(255,255,255,0.6)",
                color: filterActive === f ? C.gray : C.navy,
                backdropFilter: "blur(10px)",
                cursor: "pointer",
                transition: "all 0.25s ease",
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 240px" }}>
          {/* Map */}
          <div className="glass rounded-2xl overflow-hidden relative" style={{ height: "430px" }}>
            {/* Peta Mapbox spesifik untuk dashboard */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

            {/* Tooltip Dinamis */}
            <div className="absolute top-4 left-4 px-4 py-3 rounded-xl text-xs z-10" style={{ background: "rgba(44,62,80,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)", color: C.gray, fontFamily: "var(--font-dm-sans)", minWidth: "180px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              {selectedKec ? (
                <>
                  <p className="font-semibold text-sm mb-1" style={{ color: "white" }}>Kec. {selectedKec.WADMKC}</p>
                  <p style={{ opacity: 0.8, marginBottom: "4px" }}>{selectedKec.WADMKK}</p>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "8px 0" }} />
                  <p style={{ opacity: 0.9 }}>Provinsi: {selectedKec.WADMPR}</p>
                  <p style={{ opacity: 0.9, color: C.orange, marginTop: "4px", fontWeight: 600 }}>Klik untuk mengunduh laporan</p>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-2 opacity-80 text-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "6px", opacity: 0.9 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  <p>Klik area peta</p>
                  <p>untuk melihat detail</p>
                </div>
              )}
            </div>

            {/* Reset button */}
            <button
              className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-base z-10 hover:bg-opacity-100"
              style={{ background: "rgba(44,62,80,0.85)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.2s" }}
              title="Reset tampilan peta"
              onClick={() => mapRef.current?.resetSelection?.()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
            </button>
          </div>

          {/* Stat cards */}
          <div className="flex flex-col gap-3">
            {[
              { l: "Bangunan Terdampak", v: "247.832", u: "unit", c: C.red },
              { l: "Jalan Terputus", v: "1.847", u: "km", c: C.orange },
              { l: "Jembatan Lumpuh", v: "247", u: "titik", c: C.red },
              { l: "Desa Terisolir", v: "2.570", u: "desa", c: C.orange },
            ].map((m) => (
              <div key={m.l} className="glass rounded-xl p-4">
                <p className="text-xs mb-0.5" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.6 }}>{m.l}</p>
                <p style={{ fontFamily: "var(--font-garet-bold)", fontSize: "1.7rem", color: m.c, lineHeight: 1.1 }}>{m.v}</p>
                <p className="text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: C.navy, opacity: 0.5 }}>{m.u}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom data table */}
        <div className="mt-4 glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.25)" }}>
            <h3 style={{ fontFamily: "var(--font-dm-sans)", fontWeight: 600, color: C.navy, fontSize: "0.92rem" }}>
              {selectedKec ? `Data Desa - Kec. ${selectedKec.WADMKC}` : "Data Spasial Detail per Kecamatan"}
            </h3>
            <button
              onMouseEnter={() => setDownloadHover(true)}
              onMouseLeave={() => setDownloadHover(false)}
              onClick={handleDownload}
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.82rem",
                padding: "8px 18px",
                borderRadius: "999px",
                border: "none",
                background: downloadHover ? C.teal : C.navy,
                color: C.gray,
                cursor: "pointer",
                transition: "background 0.3s ease",
                display: "flex",
                alignItems: "center"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "6px" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Unduh Data
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                {tableHeaders.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs" style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(44,62,80,0.55)", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, i) => (
                <tr
                  key={row.id || row.kec + i}
                  className="data-row hover:bg-white/10"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "default" }}
                >
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.navy }}>{selectedKec ? row.desa : row.kec}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.navy, opacity: 0.75 }}>{selectedKec ? row.kec : row.kab}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.blue }}>{selectedKec ? row.ikgAwal : row.bangunan}</span></td>
                  <td className="px-4 py-3"><span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "0.875rem", color: C.orange }}>{selectedKec ? row.ikgKrisis : row.jalan}</span></td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        background: (row.status === "Terisolir" || row.status === "Sangat Kritis" || row.status === "Sangat Tinggi") ? "rgba(217,56,58,0.15)" : (row.status === "Kritis" || row.status === "Tinggi") ? "rgba(244,124,54,0.15)" : "rgba(32,135,116,0.15)",
                        color: (row.status === "Terisolir" || row.status === "Sangat Kritis" || row.status === "Sangat Tinggi") ? C.red : (row.status === "Kritis" || row.status === "Tinggi") ? C.orange : C.teal,
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      {row.status === "Sangat Tinggi" ? "Sangat Kritis" : row.status === "Tinggi" ? "Kritis" : row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
