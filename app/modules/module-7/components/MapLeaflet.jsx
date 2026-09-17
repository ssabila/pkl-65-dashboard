// components/MapLeaflet.jsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, ZoomControl  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { normalizeToFeatureCollection } from "../lib/geojson";

export default function MapLeaflet({ geojsonFiles, fileKeys, center, zoom, getFeatureStyle, fileStyles }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    if (!geojsonFiles?.length) return;
    let cancelled = false;
    Promise.all(geojsonFiles.map((url) => fetch(url).then((res) => res.json()))).then((raw) => {
    if (!cancelled) setGeoData(raw.map(normalizeToFeatureCollection));
    });
    return () => { cancelled = true; };
  }, [geojsonFiles]);

  const defaultStyle = () => ({
    fillColor: "#f8fafc",
    color: "#0f172a",
    weight: 1,
    fillOpacity: 1,
  });

  const styleForFile = (index) => {
    if (fileStyles?.[index]) return () => fileStyles[index];
    if (getFeatureStyle) {
      return (feature) => getFeatureStyle(feature, fileKeys?.[index]);
    }
    return defaultStyle;
  };

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
  {geoData?.map((item, index) => (
    <GeoJSON key={`${index}-${JSON.stringify(fileStyles?.[index])}`} data={item} style={styleForFile(index)} />
  ))}
</MapContainer>
  );
}