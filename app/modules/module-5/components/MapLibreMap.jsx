"use client";

import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FLOODED_KECAMATAN_NAMES } from "../data/constants";

export default function MapLibreMap({
  activeSection = 0,
  dashboardFilter = "Semua",
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (mapRef.current) return; // Initialize map only once

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        "version": 8,
        "sources": {
          "osm-tiles": {
            "type": "raster",
            "tiles": [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            "tileSize": 256,
            "attribution": "© OpenStreetMap contributors"
          }
        },
        "layers": [
          {
            "id": "osm-layer",
            "type": "raster",
            "source": "osm-tiles",
            "paint": {
              "raster-saturation": -1,
              "raster-contrast": 0.1,
              "raster-brightness-min": 0.3
            },
            "minzoom": 0,
            "maxzoom": 22
          }
        ]
      },
      center: [101.0, 0.0], // Initial state for Hero (Case 0)
      zoom: 5,
      pitch: 0,
      bearing: 0,
      interactive: false, // Matikan interaksi default agar tidak ganggu scroll
    });

    map.on("load", () => {
      // Menambahkan data GeoJSON batas desa (ditambahkan sebelum kecamatan)
      map.addSource("batas-desa", {
        type: "geojson",
        data: "/data/module-5/batasdesa.json",
        generateId: true
      });// Menambahkan data GeoJSON batas kecamatan yang sudah diringankan
      map.addSource("batas-kecamatan", {
        type: "geojson",
        data: "/data/module-5/kec_sumatra.json"
      });

      // Menambahkan data GeoJSON kerusakan bangunan
      map.addSource("kerusakan-bangunan", {
        type: "geojson",
        data: "/data/module-5/kerusakan_bangunan.json"
      });

      // Layer poligon (fill) data-driven styling untuk area banjir
      map.addLayer({
        id: "kecamatan-fill",
        type: "fill",
        source: "batas-kecamatan",
        paint: {
          "fill-color": [
            "case",
            ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
            "#2980B9", // Biru
            "#27AE60"  // Hijau
          ],
          "fill-opacity": 0.0,
          "fill-opacity-transition": { duration: 1000, delay: 0 },
          "fill-color-transition": { duration: 1000, delay: 0 }
        }
      });

      // Layer poligon (fill) untuk kerusakan bangunan (Kabupaten)
      map.addLayer({
        id: "kerusakan-fill",
        type: "fill",
        source: "kerusakan-bangunan",
        paint: {
          "fill-color": [
            "match",
            ["get", "WADMKK"],
            ["Nias Selatan", "Aceh Selatan", "Pidie"], "#D9383A", // Sangat parah (Merah)
            ["Toba", "Mandailing Natal", "Agam"], "#F47C36", // Parah (Oranye tua)
            ["Pasaman", "Karo", "Simalungun", "Tapanuli Utara"], "#F1C40F", // Sedang (Kuning)
            "rgba(0,0,0,0)"
          ],
          "fill-opacity": 0.0,
          "fill-opacity-transition": { duration: 500, delay: 0 },
          "fill-color-transition": { duration: 500, delay: 0 }
        }
      });

      // Menambahkan data GeoJSON Jalan Provinsi (Sebelum Banjir)
      map.addSource("jalan-pre", {
        type: "geojson",
        data: "/data/module-5/jalanprovsumatera.json",
        tolerance: 1.5, // Wajib untuk optimasi file jalan besar
        generateId: true
      });

      // Menambahkan data GeoJSON Jalan Terdampak (Setelah Banjir)
      map.addSource("jalan-post", {
        type: "geojson",
        data: "/data/module-5/jalanTerdampak.json",
        tolerance: 1.5, // Wajib untuk optimasi file jalan besar
        generateId: true
      });

      // Layer garis batas desa
      map.addLayer({
        id: "desa-line",
        type: "line",
        source: "batas-desa",
        paint: {
          "line-color": "#2C3E50",
          "line-width": 0.3,
          "line-opacity": 0.15
        }
      });

      // Layer poligon desa terisolir (Halaman 6)
      map.addLayer({
        id: "desa-isolated-fill",
        type: "fill",
        source: "batas-desa",
        filter: ["==", ["get", "terisolir"], "Ya"],
        paint: {
          "fill-color": "#111111", // Hitam ke abu-abuan gelap
          "fill-opacity": 0.0,
          "fill-opacity-transition": { duration: 500 }
        }
      });

      // Layer garis batas kecamatan (minimalis)
      map.addLayer({
        id: "kecamatan-line",
        type: "line",
        source: "batas-kecamatan",
        paint: {
          "line-color": "#2C3E50",
          "line-width": 0.8,
          "line-opacity": 0.25
        }
      });

      // Layer Jalan Normal (Ruas Aman / Semua Jalan) - Ditambahkan di atas batas admin
      map.addLayer({
        id: "jalan-pre-layer",
        type: "line",
        source: "jalan-pre",
        minzoom: 5, // Harus lebih kecil dari zoom kamera (5.8)
        paint: {
          "line-color": "#1ABC9C", // Teal (Ruas Aman)
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.5, 12, 2.5],
          "line-opacity": 0.0,
          "line-opacity-transition": { duration: 1000, delay: 0 }
        }
      });

      // Layer Jalan Terdampak (Ruas Terputus) - Ditambahkan paling atas agar menutupi jalan normal
      map.addLayer({
        id: "jalan-post-layer",
        type: "line",
        source: "jalan-post",
        minzoom: 5, // Harus lebih kecil dari zoom kamera (5.8)
        paint: {
          "line-color": "#F39C12", // Orange (Ruas Terputus)
          "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1.2, 12, 3.5], // Dibuat sedikit lebih tebal agar menonjol
          "line-opacity": 0.0,
          "line-opacity-transition": { duration: 1500, delay: 500 } // Muncul sedikit setelah jalan normal
        }
      });
      
      setIsMapLoaded(true);
    });

    mapRef.current = map;
  }, []);

  // Effect untuk scroll scrub animasi kamera (Hero -> Story)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;

    const handleScroll = () => {
      const storyEl = document.getElementById("section-story");
      const floodEl = document.getElementById("section-flood");
      const windowHeight = window.innerHeight;

      // Fungsi helper untuk interpolasi dan jumpTo
      const interpolateCamera = (p, start, end) => {
        // Easing cubic in-out untuk pergerakan yang sangat halus di awal dan akhir
        const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const e = ease(p);

        const lng = start.center[0] + (end.center[0] - start.center[0]) * e;
        const lat = start.center[1] + (end.center[1] - start.center[1]) * e;
        const zoom = start.zoom + (end.zoom - start.zoom) * e;
        const pitch = start.pitch + (end.pitch - start.pitch) * e;
        const bearing = start.bearing + (end.bearing - start.bearing) * e;

        map.jumpTo({ center: [lng, lat], zoom, pitch, bearing });
      };

      // Dekatkan sedikit zoom state agar transisi tidak terlalu melompat jauh
      const HERO_STATE = { center: [101.0, 0.0], zoom: 5.2, pitch: 0, bearing: 0 };
      const STORY_STATE = { center: [100.36, -0.30], zoom: 11.2, pitch: 65, bearing: -25 };
      const FLOOD_STATE = { center: [99.5, 1.5], zoom: 5.8, pitch: 0, bearing: 0 };

      // Cek Section Flood (Story -> Flood) terlebih dahulu (bottom-up)
      if (floodEl) {
        const floodTop = floodEl.getBoundingClientRect().top;
        // Jika floodEl sudah masuk ke viewport
        if (floodTop <= windowHeight) {
          const p2 = Math.max(0, Math.min(1, (windowHeight - floodTop) / windowHeight));
          interpolateCamera(p2, STORY_STATE, FLOOD_STATE);
          return;
        }
      }

      // Cek Section Story (Hero -> Story)
      if (storyEl) {
        const storyTop = storyEl.getBoundingClientRect().top;
        // scrollRange = 2.6x layar agar zoom selesai tepat di akhir SectionStory (260vh)
        const scrollRange = windowHeight * 2.6;
        if (storyTop <= windowHeight) {
          const rawP = Math.max(0, Math.min(1, (windowHeight - storyTop) / scrollRange));
          // Dead zone: 20% pertama scroll kamera tetap diam (user lihat full map)
          // 80% sisanya = zoom gradual yang selesai tepat sebelum Flood masuk
          const deadZone = 0.20;
          const p1 = rawP <= deadZone ? 0 : (rawP - deadZone) / (1 - deadZone);
          interpolateCamera(p1, HERO_STATE, STORY_STATE);
          return;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Jalankan sekali saat mount untuk setup
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMapLoaded]);

  // Effect untuk mengontrol transisi Mapbox berdasarkan activeSection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    // Toggle visibilitas poligon banjir (Halaman 3)
    if (map.getLayer("kecamatan-fill")) {
      if (activeSection === 2) {
        // Halaman 3 (Banjir): Kecamatan kena banjir = Biru, Selain itu = Hijau
        map.setPaintProperty("kecamatan-fill", "fill-color", [
          "case",
          ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
          "#2980B9", // Biru (Kena Banjir)
          "#27AE60"  // Hijau (Selain itu / Aman)
        ]);
        map.setPaintProperty("kecamatan-fill", "fill-opacity", [
          "case",
          ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
          0.65, // Opacity poligon banjir
          0.4   // Opacity poligon hijau
        ]);
      } else if (activeSection === 3) {
        // Halaman 4: Redupkan poligon banjir
        map.setPaintProperty("kecamatan-fill", "fill-color", [
          "case",
          ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
          "#2980B9",
          "rgba(0,0,0,0)"
        ]);
        map.setPaintProperty("kecamatan-fill", "fill-opacity", [
          "case",
          ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
          0.15,
          0.0
        ]);
      } else if (activeSection < 2) {
        // Halaman 1-2: Abu-abu samar fokus area
        map.setPaintProperty("kecamatan-fill", "fill-color", [
          "case",
          ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
          "#95A5A6",
          "rgba(0,0,0,0)"
        ]);
        map.setPaintProperty("kecamatan-fill", "fill-opacity", [
          "case",
          ["in", ["get", "WADMKC"], ["literal", FLOODED_KECAMATAN_NAMES]],
          0.25,
          0.0
        ]);
      } else {
        // Halaman 5 ke atas: sembunyikan poligon banjir
        map.setPaintProperty("kecamatan-fill", "fill-opacity", 0.0);
      }
    }

    // Visibilitas poligon kerusakan sekarang ditangani oleh efek animasi (pulse) terpisah

    // Toggle visibilitas jalan (Halaman 5)
    if (map.getLayer("jalan-pre-layer")) {
      const roadOpacity = activeSection === 4 ? 0.7 : 0.0;
      map.setPaintProperty("jalan-pre-layer", "line-opacity", roadOpacity);
    }
    if (map.getLayer("jalan-post-layer")) {
      const impactedOpacity = activeSection === 4 ? 1.0 : 0.0;
      map.setPaintProperty("jalan-post-layer", "line-opacity", impactedOpacity);
    }

    // Default matikan interaksi agar tidak ganggu scroll halaman
    map.scrollZoom.disable();
    map.dragPan.disable();

    // Logika animasi kamera (flyTo) tetap dipertahankan untuk case >= 3
    switch (activeSection) {
      case 3: // Damage
        // Panning horizontal ringan untuk menggeser fokus
        map.flyTo({ center: [99.7, 1.5], zoom: 5.8, pitch: 0, bearing: 0, speed: 0.2, curve: 1 });
        break;

      case 4: // Roads
        map.flyTo({ center: [99.5, 1.5], zoom: 5.8, pitch: 0, bearing: 0, speed: 0.4, curve: 1 });
        break;

      case 5: // Isolation (Maximum zoom out)
        map.flyTo({ center: [100.5, 1.0], zoom: 4.8, pitch: 0, bearing: 0, speed: 0.8 });
        break;

      case 6: // IKG Table
        break;

      case 7: // Night Lights (Top down view)
        map.flyTo({ center: [99.0, 2.0], zoom: 6, pitch: 0, speed: 0.8 });
        break;

      case 8: // Dashboard Interactive
        map.flyTo({ center: [99.0, 2.0], zoom: 6, pitch: 0, speed: 0.8 });
        // Izinkan interaksi untuk dasbor
        map.dragPan.enable();
        map.scrollZoom.enable();
        break;
      
      default:
        break;
    }
  }, [activeSection]);

  // Effect untuk animasi denyut (pulse) pada poligon kerusakan
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !map.getLayer("kerusakan-fill")) return;

    let animationFrameId;
    let startTime;

    const animatePulse = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // Animasi denyut berulang tiap 1.5 detik
      // Math.sin bernilai -1 sampai 1
      const sine = Math.sin((progress / 1500) * Math.PI * 2);
      // Rentang opacity dari 0.4 sampai 0.8
      const opacity = 0.6 + (sine * 0.2);

      map.setPaintProperty("kerusakan-fill", "fill-opacity", opacity);
      animationFrameId = requestAnimationFrame(animatePulse);
    };

    if (activeSection === 3 || (activeSection === 8 && (dashboardFilter === "Semua" || dashboardFilter === "Bangunan"))) {
      // Hilangkan transisi sementara saat requestAnimationFrame jalan agar tidak berkedip
      map.setPaintProperty("kerusakan-fill", "fill-opacity-transition", { duration: 0 });
      animationFrameId = requestAnimationFrame(animatePulse);
    } else {
      // Kembalikan ke 0 dengan transisi
      map.setPaintProperty("kerusakan-fill", "fill-opacity-transition", { duration: 500 });
      map.setPaintProperty("kerusakan-fill", "fill-opacity", 0.0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activeSection, isMapLoaded, dashboardFilter]);

  // Effect untuk animasi denyut desa terisolir (Halaman 6)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !map.getLayer("desa-isolated-fill")) return;

    let animationFrameId;
    let startTime;

    const animatePulse = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // Animasi denyut berulang tiap 2 detik
      const sine = Math.sin((progress / 2000) * Math.PI * 2);
      // Rentang opacity dari 0.3 sampai 0.7
      const opacity = 0.5 + (sine * 0.2);

      map.setPaintProperty("desa-isolated-fill", "fill-opacity", opacity);
      animationFrameId = requestAnimationFrame(animatePulse);
    };

    if (activeSection === 5 || (activeSection === 8 && (dashboardFilter === "Semua" || dashboardFilter === "Isolasi"))) {
      map.setPaintProperty("desa-isolated-fill", "fill-opacity-transition", { duration: 0 });
      animationFrameId = requestAnimationFrame(animatePulse);
    } else {
      map.setPaintProperty("desa-isolated-fill", "fill-opacity-transition", { duration: 500 });
      map.setPaintProperty("desa-isolated-fill", "fill-opacity", 0.0);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [activeSection, isMapLoaded, dashboardFilter]);

  // Effect to handle dashboard filter layer toggling
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || activeSection !== 8) return;

    // Helper function to set opacity for a layer if it exists
    const setOpacity = (layerId, prop, value) => {
      if (map.getLayer(layerId)) {
        map.setPaintProperty(layerId, prop, value);
      }
    };

    // Flood (Kecamatan)
    setOpacity("kecamatan-fill", "fill-opacity", (dashboardFilter === "Semua" || dashboardFilter === "Cahaya Malam") ? 0.3 : 0.0);
    
    // Roads (Jalan)
    setOpacity("jalan-pre-layer", "line-opacity", (dashboardFilter === "Semua" || dashboardFilter === "Jalan") ? 0.7 : 0.0);
    setOpacity("jalan-post-layer", "line-opacity", (dashboardFilter === "Semua" || dashboardFilter === "Jalan") ? 1.0 : 0.0);
    
    // Note: desa-isolated-fill and kerusakan-fill are handled by their own requestAnimationFrame pulses.
    // I should update the pulse effects to depend on dashboardFilter as well.
  }, [activeSection, dashboardFilter, isMapLoaded]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        zIndex: 0, // Di belakang konten
        pointerEvents: activeSection === 8 ? "auto" : "none", // Agar tidak memblokir scroll halaman
        backgroundColor: "#E8EBEF",
        opacity: activeSection >= 7 ? 0 : 1, // Sembunyikan mulai NightLights (7) ke bawah
        visibility: activeSection >= 7 ? "hidden" : "visible",
        transition: "opacity 0.5s ease, visibility 0.5s ease",
      }}
    />
  );
}
