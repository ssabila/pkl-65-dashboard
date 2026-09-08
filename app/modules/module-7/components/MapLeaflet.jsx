// components/MapLeaflet.jsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapLeaflet({ geojsonFiles, center, zoom, getFeatureStyle }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    if (!geojsonFiles?.length) return;
    let cancelled = false;

    Promise.all(geojsonFiles.map((url) => fetch(url).then((res) => res.json()))).then(
      (data) => {
        if (!cancelled) setGeoData(data);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [geojsonFiles]);

  const defaultStyle = () => ({
    fillColor: "#f8fafc",
    color: "#0f172a",
    weight: 1,
    fillOpacity: 1,
  });

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
    >
      {geoData?.map((item, index) => (
        <GeoJSON
          key={index}
          data={item}
          style={getFeatureStyle || defaultStyle}
        />
      ))}
    </MapContainer>
  );
}