"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { rainfallColorByValue } from "../lib/rainfallColor";
import { normalizeToFeatureCollection } from "../lib/geojson";
import FitBounds from "./FitBounds";

export default function RainfallGridLeaflet({ url, boundaryFiles, outlineFiles, center, zoom, periode }) {
  const [gridData, setGridData] = useState(null);
  const [boundaries, setBoundaries] = useState(null);
  const [outlines, setOutlines] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((data) => !cancelled && setGridData(data));
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    if (!boundaryFiles?.length) return;
    let cancelled = false;
    Promise.all(boundaryFiles.map((url) => fetch(url).then((res) => res.json()))).then((raw) => {
      if (!cancelled) setBoundaries(raw.map(normalizeToFeatureCollection));
    });
    return () => { cancelled = true; };
  }, [boundaryFiles]);

  useEffect(() => {
    if (!outlineFiles?.length) return;
    let cancelled = false;
    Promise.all(outlineFiles.map((url) => fetch(url).then((res) => res.json()))).then((raw) => {
      if (!cancelled) setOutlines(raw.map(normalizeToFeatureCollection));
    });
    return () => { cancelled = true; };
  }, [outlineFiles]);

  const gridStyle = (feature) => ({
    fillColor: rainfallColorByValue(feature.properties.Curah_Huja),
    color: "none",
    weight: 0,
    fillOpacity: 0.85,
  });

  const kecamatanStyle = () => ({
    fillOpacity: 0,
    color: "#334155",
    weight: 0.5,
  });

  const kabupatenStyle = () => ({
    fillOpacity: 0,
    color: "#0f172a",
    weight: 1.6,
    interactive: false,
  });

  const filterByPeriode = (feature) => feature.properties.Periode === periode;

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
  {(outlines || boundaries) && <FitBounds data={outlines || boundaries} />}
  {gridData && <GeoJSON key={periode} data={gridData} style={gridStyle} filter={filterByPeriode} />}
  {boundaries?.map((item, i) => (
    <GeoJSON key={`b-${i}`} data={item} style={kecamatanStyle} />
  ))}
  {outlines?.map((item, i) => (
    <GeoJSON key={`o-${i}`} data={item} style={kabupatenStyle} />
  ))}
</MapContainer>
  );
}