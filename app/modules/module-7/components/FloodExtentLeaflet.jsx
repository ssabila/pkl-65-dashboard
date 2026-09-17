"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, ImageOverlay, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { normalizeToFeatureCollection } from "../lib/geojson";
import { FLOOD_RASTER_BOUNDS, getFloodRasterUrl } from "../lib/floodRasterBounds";

const PROVINSI_KEYS = ["aceh", "sumut", "sumbar"];

export default function FloodExtentLeaflet({ boundaryFiles, center, zoom, fase }) {
  const [boundaries, setBoundaries] = useState(null);

  useEffect(() => {
    if (!boundaryFiles?.length) return;
    Promise.all(boundaryFiles.map((u) => fetch(u).then((r) => r.json()))).then((raw) => {
      setBoundaries(raw.map(normalizeToFeatureCollection));
    });
  }, [boundaryFiles]);

  const boundaryStyle = () => ({ fillOpacity: 0, color: "#334155", weight: 0.8 });

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      dragging={true}
      doubleClickZoom={true}
      touchZoom={true}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
    >
      <ZoomControl position="topright" />

      {boundaries?.map((b, i) => (
        <GeoJSON key={`b-${i}`} data={b} style={boundaryStyle} />
      ))}

      {PROVINSI_KEYS.map((prov) => (
        <ImageOverlay
          key={`${prov}-${fase}`}
          url={getFloodRasterUrl(prov, fase)}
          bounds={FLOOD_RASTER_BOUNDS[prov]}
          opacity={0.9}
        />
      ))}
    </MapContainer>
  );
}