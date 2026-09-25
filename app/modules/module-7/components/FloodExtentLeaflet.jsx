"use client";

import { useEffect, useState } from "react";
import { MapContainer, GeoJSON, ImageOverlay, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { normalizeToFeatureCollection } from "../lib/geojson";
import { FLOOD_RASTER_BOUNDS, getFloodRasterUrl } from "../lib/floodRasterBounds";
import FitBounds from "./FitBounds";

const PROVINSI_KEYS = ["aceh", "sumut", "sumbar"];

export default function FloodExtentLeaflet({ boundaryFiles, outlineFiles, center, zoom, fase }) {
  const [boundaries, setBoundaries] = useState(null);
  const [outlines, setOutlines] = useState(null);
  const [dimmed, setDimmed] = useState(false);

  useEffect(() => {
    if (!boundaryFiles?.length) return;
    Promise.all(boundaryFiles.map((u) => fetch(u).then((r) => r.json()))).then((raw) => {
      setBoundaries(raw.map(normalizeToFeatureCollection));
    });
  }, [boundaryFiles]);

  useEffect(() => {
    if (!outlineFiles?.length) return;
    Promise.all(outlineFiles.map((u) => fetch(u).then((r) => r.json()))).then((raw) => {
      setOutlines(raw.map(normalizeToFeatureCollection));
    });
  }, [outlineFiles]);

  // Redam sejenak lalu kembalikan opacity saat fase berganti, supaya raster tidak "meloncat" mentah.
  useEffect(() => {
    const dip = setTimeout(() => setDimmed(true), 0);
    const restore = setTimeout(() => setDimmed(false), 260);
    return () => {
      clearTimeout(dip);
      clearTimeout(restore);
    };
  }, [fase]);

  const kecamatanStyle = () => ({ fillOpacity: 0, color: "#64748b", weight: 0.5 });
  const kabupatenStyle = () => ({ fillOpacity: 0, color: "#1e293b", weight: 1.6, interactive: false });

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

      {PROVINSI_KEYS.map((prov) => (
        <ImageOverlay
          key={prov}
          url={getFloodRasterUrl(prov, fase)}
          bounds={FLOOD_RASTER_BOUNDS[prov]}
          opacity={dimmed ? 0.15 : 0.85}
        />
      ))}

      {boundaries?.map((b, i) => (
        <GeoJSON key={`b-${i}`} data={b} style={kecamatanStyle} />
      ))}

      {outlines?.map((o, i) => (
        <GeoJSON key={`o-${i}`} data={o} style={kabupatenStyle} />
      ))}
    </MapContainer>
  );
}