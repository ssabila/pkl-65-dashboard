"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { normalizeToFeatureCollection } from "../modules/module-7/lib/geojson";

const COLORS = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee", "#60a5fa", "#a78bfa", "#f472b6"];

export default function GeoIndexInspector({ url, center, zoom }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then((raw) => setData(normalizeToFeatureCollection(raw)));
  }, [url]);

  return (
    <MapContainer center={center} zoom={zoom} className="w-full h-full">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {data && (
        <GeoJSON
          data={data}
          style={(feature) => ({
            color: "#000",
            weight: 1,
            fillColor: COLORS[feature.properties.index % COLORS.length],
            fillOpacity: 0.5,
          })}
          onEachFeature={(feature, layer) => {
            layer.bindTooltip(String(feature.properties.index), {
              permanent: true,
              direction: "center",
            });
          }}
        />
      )}
    </MapContainer>
  );
}