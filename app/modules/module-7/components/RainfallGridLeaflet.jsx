"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { rainfallColorByKelas } from "../lib/rainfallColor";
import { normalizeToFeatureCollection } from "../lib/geojson";

export default function RainfallGridLeaflet({ url, boundaryFiles, center, zoom, periode }) {
  const [gridData, setGridData] = useState(null);
  const [boundaries, setBoundaries] = useState(null);

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

  const gridStyle = (feature) => ({
    fillColor: rainfallColorByKelas(feature.properties.Kelas),
    color: "none",
    weight: 0,
    fillOpacity: 0.85,
  });

  const outlineStyle = () => ({
    fillOpacity: 0,
    color: "#0f172a",
    weight: 1,
  });

  const filterByPeriode = (feature) => feature.properties.Periode === periode;

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
  {boundaries?.map((item, i) => (
    <GeoJSON key={`b-${i}`} data={item} style={outlineStyle} />
  ))}
  {gridData && <GeoJSON key={periode} data={gridData} style={gridStyle} filter={filterByPeriode} />}
</MapContainer>
  );
}