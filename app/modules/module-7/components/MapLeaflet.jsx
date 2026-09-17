// components/MapLeaflet.jsx
"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, ZoomControl  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { normalizeToFeatureCollection } from "../lib/geojson";
import FitBounds from "./FitBounds";

export default function MapLeaflet({ geojsonFiles, fileKeys, outlineFiles, center, zoom, getFeatureStyle, fileStyles }) {
  const [geoData, setGeoData] = useState(null);
  const [outlineData, setOutlineData] = useState(null);

  useEffect(() => {
    if (!geojsonFiles?.length) return;
    let cancelled = false;
    Promise.all(geojsonFiles.map((url) => fetch(url).then((res) => res.json()))).then((raw) => {
    if (!cancelled) setGeoData(raw.map(normalizeToFeatureCollection));
    });
    return () => { cancelled = true; };
  }, [geojsonFiles]);

  useEffect(() => {
    if (!outlineFiles?.length) return;
    let cancelled = false;
    Promise.all(outlineFiles.map((url) => fetch(url).then((res) => res.json()))).then((raw) => {
      if (!cancelled) setOutlineData(raw.map(normalizeToFeatureCollection));
    });
    return () => { cancelled = true; };
  }, [outlineFiles]);

  const kabupatenOutlineStyle = () => ({
    fillOpacity: 0,
    color: "#1e293b",
    weight: 2,
    interactive: false,
  });

  const defaultStyle = () => ({
    fillColor: "#f8fafc",
    color: "#0f172a",
    weight: 0.6,
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
  zoomSnap={0.5}
  zoomDelta={0.5}
  minZoom={zoom - 2}
  maxZoom={12}
  dragging={true}
  doubleClickZoom={true}
  touchZoom={true}
  scrollWheelZoom={false}
  boxZoom={false}
  keyboard={false}
  zoomControl={false}
  attributionControl={false}
  className="w-full h-full map-canvas"
>
  <ZoomControl position="topright" />
  {(outlineData || geoData) && <FitBounds data={outlineData || geoData} />}
  {geoData?.map((item, index) => (
    <GeoJSON key={`${index}-${JSON.stringify(fileStyles?.[index])}`} data={item} style={styleForFile(index)} />
  ))}
  {outlineData?.map((item, index) => (
    <GeoJSON key={`outline-${index}`} data={item} style={kabupatenOutlineStyle} />
  ))}
</MapContainer>
  );
}