"use client";
import { useEffect, useRef, useState } from "react";
import { wilayahAceh } from "../data/dummyData";

const RISK_COLOR = {
  Rendah:  "#208774",
  Sedang:  "#F4B836",
  Tinggi:  "#F47C36",
  Kritis:  "#D9383A",
};

const PROVINSI_CENTER = {
  "Aceh":           [4.6, 96.5],
  "Sumatera Utara": [2.2, 99.0],
  "Sumatera Barat": [-0.7, 100.4],
};

export default function InteractiveMap({
  provinsi,
  type,        // 'banjir' | 'longsor'
  onSelect,
  selectedWilayah,
}) {
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markersRef   = useRef([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === "undefined") return;
      if (mapInstance.current) return;

      // Dynamic import Leaflet (no SSR)
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!mapRef.current || !isMounted) return;

      const center = PROVINSI_CENTER[provinsi] || [4.6, 96.5];
      const map = L.map(mapRef.current, {
        center,
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Tile layer — CartoDB Positron (clean, light)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CartoDB",
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      setLoaded(true);
    };

    initMap();
    return () => { isMounted = false; };
  }, []);

  // Re-center when provinsi changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const center = PROVINSI_CENTER[provinsi] || [4.6, 96.5];
    mapInstance.current.setView(center, 8, { animate: true });
  }, [provinsi]);

  // Add/update markers
  useEffect(() => {
    if (!loaded || !mapInstance.current) return;
    const L = require("leaflet");

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    wilayahAceh.forEach(w => {
      const riskKey = type === "banjir" ? w.risikoB : w.risikoL;
      const color   = RISK_COLOR[riskKey] || "#6D9DC5";
      const isSelected = selectedWilayah?.nama === w.nama;

      const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 28 : 20}" height="${isSelected ? 28 : 20}" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="${isSelected ? 10 : 8}" fill="${color}" stroke="white" stroke-width="2.5" opacity="${isSelected ? 1 : 0.9}"/>
          ${isSelected ? `<circle cx="12" cy="12" r="5" fill="white" opacity="0.5"/>` : ''}
        </svg>`;

      const icon = L.divIcon({
        html: svgIcon,
        iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
        iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10],
        className: "",
      });

      const marker = L.marker([w.lat, w.lng], { icon });

      // Hover tooltip (glass style via CSS)
      marker.bindTooltip(w.nama, {
        permanent: false,
        direction: "top",
        offset: [0, -12],
        className: "aceh-map-tooltip",
      });

      marker.on("click", () => {
        onSelect(w);
        mapInstance.current.flyTo([w.lat, w.lng], 10, { duration: 0.8 });
      });

      marker.addTo(mapInstance.current);
      markersRef.current.push(marker);
    });
  }, [loaded, type, selectedWilayah, provinsi]);

  return (
    <>
      {/* Inject tooltip CSS */}
      <style>{`
        .aceh-map-tooltip {
          background: rgba(255,255,255,0.88) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255,255,255,0.75) !important;
          border-radius: 10px !important;
          padding: 4px 10px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          color: #2C3E50 !important;
          box-shadow: 0 4px 16px rgba(44,62,80,0.12) !important;
          white-space: nowrap !important;
        }
        .aceh-map-tooltip::before {
          display: none !important;
        }
        .leaflet-container {
          background: #dce8f5;
          border-radius: 12px;
          font-family: inherit;
        }
      `}</style>
      <div ref={mapRef} className="w-full h-full rounded-xl" style={{ minHeight: "260px" }} />
    </>
  );
}
