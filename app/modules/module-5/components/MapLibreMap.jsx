"use client";

import { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapLibreMap({
  activeSection = 0,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        "version": 8,
        "sources": {
          "carto-dark": {
            "type": "raster",
            "tiles": [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png"
            ],
            "tileSize": 256
          }
        },
        "layers": [
          {
            "id": "carto-dark-layer",
            "type": "raster",
            "source": "carto-dark",
            "minzoom": 0,
            "maxzoom": 22
          }
        ]
      },
      center: [99.0, 2.0], // Koordinat tengah Sumatera (contoh)
      zoom: 5.5,
      pitch: 0,
      bearing: 0,
      interactive: false, // Matikan interaksi default agar tidak ganggu scroll
    });

    map.on("load", () => {
      // DATA DIHAPUS SEMENTARA AGAR RINGAN SESUAI PERMINTAAN USER
    });

    mapRef.current = map;
  }, []);

  // Effect untuk mengontrol transisi Mapbox berdasarkan activeSection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Default matikan interaksi agar tidak ganggu scroll halaman
    map.scrollZoom.disable();
    map.dragPan.disable();

    // Logika animasi kamera (flyTo) tetap dipertahankan
    switch (activeSection) {
      case 0: // Hero
      case 1: // Story
        map.flyTo({ center: [99.0, 2.0], zoom: 5.5, pitch: 0, speed: 0.8 });
        break;
      
      case 2: // Flood (Kecamatan overview)
      case 3: // Damage
      case 4: // Roads
      case 5: // Bridges
        map.flyTo({ center: [99.0, 2.0], zoom: 6, pitch: 45, speed: 0.8 });
        break;

      case 6: // Isolation (Zoom in to villages)
      case 7: // IKG Table
        map.flyTo({ center: [99.5, 1.5], zoom: 7.5, pitch: 60, speed: 0.8 });
        break;

      case 8: // Night Lights (Top down view)
        map.flyTo({ center: [99.0, 2.0], zoom: 6, pitch: 0, speed: 0.8 });
        break;

      case 9: // Dashboard Interactive
        map.flyTo({ center: [99.0, 2.0], zoom: 6, pitch: 0, speed: 0.8 });
        // Izinkan interaksi untuk dasbor
        map.dragPan.enable();
        map.scrollZoom.enable();
        break;
      
      default:
        break;
    }
  }, [activeSection]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0, // Di belakang konten
        pointerEvents: activeSection === 9 ? "auto" : "none", // Agar tidak memblokir scroll halaman
      }}
    />
  );
}
