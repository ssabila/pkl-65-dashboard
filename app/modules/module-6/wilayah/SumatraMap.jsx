"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { PROVINSI_BOUNDS } from "../data";

// Basemap layer options
const BASEMAPS = {
  voyager: {
    name: "Terang (CartoDB)",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  },
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
    maxZoom: 19,
  },
  satellite: {
    name: "Citra Satelit",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18,
  },
};

// Risk color mapping
function getRiskColor(status) {
  switch (status) {
    case "Sangat Tinggi":
      return { fill: "#b91c1c", stroke: "#7f1d1d", glow: "rgba(185, 28, 28, 0.4)" };
    case "Tinggi":
      return { fill: "#dc2626", stroke: "#991b1b", glow: "rgba(220, 38, 38, 0.3)" };
    case "Sedang":
      return { fill: "#d97706", stroke: "#b45309", glow: "rgba(217, 119, 6, 0.3)" };
    case "Rendah":
      return { fill: "#059669", stroke: "#047857", glow: "rgba(5, 150, 105, 0.3)" };
    default:
      return { fill: "#64748b", stroke: "#475569", glow: "rgba(100, 116, 139, 0.2)" };
  }
}

export default function SumatraMap({ data = [], provinsiKey = "all" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [activeBasemap, setActiveBasemap] = useState("voyager");
  const [selectedKab, setSelectedKab] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // Already initialized

      const L = (await import("leaflet")).default;
      if (isCancelled || !mapContainerRef.current) return;

      const defaultBounds = PROVINSI_BOUNDS.all.bounds;

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: PROVINSI_BOUNDS.all.center,
        zoom: PROVINSI_BOUNDS.all.zoom,
        minZoom: 5,
        maxZoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control at bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Attribution control subtle bottom-right
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addTo(map);

      // Add default tile layer
      const cfg = BASEMAPS[activeBasemap] || BASEMAPS.voyager;
      const tileLayer = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || "abc",
        maxZoom: cfg.maxZoom || 19,
      }).addTo(map);

      // Group layer for markers
      const markersLayer = L.layerGroup().addTo(map);

      // Fit default bounds
      map.fitBounds(defaultBounds, { padding: [20, 20] });

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;

      // Invalidate size after layout renders
      setTimeout(() => {
        if (!isCancelled && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          setIsLoaded(true);
        }
      }, 250);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when basemap changes
  useEffect(() => {
    async function updateTile() {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      const cfg = BASEMAPS[activeBasemap];
      if (!cfg) return;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      tileLayerRef.current = L.tileLayer(cfg.url, {
        attribution: cfg.attribution,
        subdomains: cfg.subdomains || "abc",
        maxZoom: cfg.maxZoom || 19,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current.bringToBack();
    }

    if (mapInstanceRef.current) {
      updateTile();
    }
  }, [activeBasemap]);

  // Update Markers when data changes
  useEffect(() => {
    async function renderMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import("leaflet")).default;

      markersLayerRef.current.clearLayers();

      const validItems = data.filter((d) => d.lat && d.lng);

      validItems.forEach((item) => {
        const color = getRiskColor(item.status_crs);
        // Radius scale based on CRS (between 7 and 14)
        const radius = 8 + (item.norm_crs || 0.5) * 6;

        const marker = L.circleMarker([item.lat, item.lng], {
          radius: radius,
          fillColor: color.fill,
          color: "#ffffff",
          weight: 2,
          opacity: 0.95,
          fillOpacity: 0.85,
        });

        // Hover tooltip
        const statusBadgeClass = `m6-map-badge-${item.status_crs.toLowerCase().replace(/\s+/g, "-")}`;
        marker.bindTooltip(
          `
          <div class="m6-l-tooltip">
            <div class="m6-l-tooltip__title">${item.WADMKK}</div>
            <div class="m6-l-tooltip__badge ${statusBadgeClass}">${item.status_crs}</div>
            <div class="m6-l-tooltip__row">
              <span>Skor CRS:</span>
              <b>${(item.norm_crs * 100).toFixed(1)}%</b>
            </div>
          </div>
          `,
          {
            direction: "top",
            offset: [0, -radius],
            className: "m6-leaflet-tooltip-clean",
            opacity: 1,
          }
        );

        // Click popup
        const popupContent = `
          <div class="m6-map-popup">
            <div class="m6-popup-header">
              <span class="m6-popup-prov">${item.WADMPP || "Sumatera"}</span>
              <h4 class="m6-popup-title">${item.WADMKK}</h4>
            </div>
            <div class="m6-popup-status-badge ${statusBadgeClass}">
              Tingkat Risiko: <b>${item.status_crs}</b>
            </div>
            <div class="m6-popup-metrics">
              <div class="m6-popup-metric-item highlight">
                <span class="label">Composite Risk (CRS)</span>
                <span class="val">${(item.norm_crs * 100).toFixed(1)}%</span>
              </div>
              <div class="m6-popup-metric-item">
                <span class="label">Indeks Hazard</span>
                <span class="val">${(item.indeks_hazard * 100).toFixed(1)}%</span>
              </div>
              <div class="m6-popup-metric-item">
                <span class="label">Indeks Exposure</span>
                <span class="val">${(item.indeks_exposure * 100).toFixed(1)}%</span>
              </div>
              <div class="m6-popup-metric-item">
                <span class="label">Indeks Kerentanan</span>
                <span class="val">${(item.indeks_kerentanan * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: "m6-leaflet-popup-clean",
        });

        marker.on("click", () => {
          setSelectedKab(item);
        });

        marker.on("mouseover", () => {
          marker.setStyle({
            weight: 3,
            fillOpacity: 1,
            radius: radius + 2,
          });
        });

        marker.on("mouseout", () => {
          marker.setStyle({
            weight: 2,
            fillOpacity: 0.85,
            radius: radius,
          });
        });

        marker.addTo(markersLayerRef.current);
      });
    }

    if (mapInstanceRef.current && isLoaded) {
      renderMarkers();
    }
  }, [data, isLoaded]);

  // Handle Province Filter Pan/Zoom
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const boundsConfig = PROVINSI_BOUNDS[provinsiKey] || PROVINSI_BOUNDS.all;

    if (boundsConfig && boundsConfig.bounds) {
      mapInstanceRef.current.flyToBounds(boundsConfig.bounds, {
        duration: 1.4,
        easeLinearity: 0.25,
        padding: [25, 25],
      });
    }
  }, [provinsiKey, isLoaded]);

  // Reset view button handler
  function handleResetView() {
    if (!mapInstanceRef.current) return;
    const boundsConfig = PROVINSI_BOUNDS[provinsiKey] || PROVINSI_BOUNDS.all;
    mapInstanceRef.current.flyToBounds(boundsConfig.bounds, {
      duration: 1,
      padding: [25, 25],
    });
  }

  return (
    <div className="m6-map-container" style={{ position: "relative", width: "100%", height: "100%", minHeight: "440px" }}>
      {/* Real Leaflet Map Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "440px",
          borderRadius: "12px",
          zIndex: 1,
        }}
      />

      {/* Floating Basemap Selector */}
      <div className="m6-map-basemap-toggle">
        {Object.entries(BASEMAPS).map(([key, config]) => (
          <button
            key={key}
            type="button"
            className={`m6-basemap-btn ${activeBasemap === key ? "active" : ""}`}
            onClick={() => setActiveBasemap(key)}
            title={`Ganti tampilan ke ${config.name}`}
          >
            {key === "voyager" ? "🗺️ Terang" : key === "osm" ? "🧭 OSM" : "🛰️ Satelit"}
          </button>
        ))}
      </div>

      {/* Floating Reset View Button */}
      <button
        type="button"
        className="m6-map-reset-btn"
        onClick={handleResetView}
        title="Reset zoom ke batas wilayah"
      >
        <span>⟲ Fokus Wilayah</span>
      </button>

      {/* Real-time Region Counter */}
      <div className="m6-map-region-badge">
        <span className="m6-map-region-pulse" />
        <span>{data.length} Titik Kab/Kota</span>
      </div>

      {/* Map Legend */}
      <div className="m6-map-legend-bar">
        <span className="m6-map-legend-title">Tingkat Risiko CRS:</span>
        <div className="m6-map-legend-items">
          {[
            { label: "Rendah", color: "#059669" },
            { label: "Sedang", color: "#d97706" },
            { label: "Tinggi", color: "#dc2626" },
            { label: "Sangat Tinggi", color: "#b91c1c" },
          ].map((item) => (
            <span key={item.label} className="m6-map-legend-item">
              <span
                className="m6-legend-dot"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
