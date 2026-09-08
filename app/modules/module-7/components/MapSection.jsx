// components/MapSection.jsx
"use client";

import dynamic from "next/dynamic";

const MapLeaflet = dynamic(() => import("./MapLeaflet"), { ssr: false });

export default function MapSection({ geojsonFiles, center, zoom, getFeatureStyle, dotOverlay = false }) {
  return (
    <div className="absolute inset-0 z-10">
      <MapLeaflet
        geojsonFiles={geojsonFiles}
        center={center}
        zoom={zoom}
        getFeatureStyle={getFeatureStyle}
      />
      {dotOverlay && <div className="absolute inset-0 dot-flood-overlay pointer-events-none" />}
    </div>
  );
}