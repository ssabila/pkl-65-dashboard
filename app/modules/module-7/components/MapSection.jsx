// components/MapSection.jsx
"use client";

import dynamic from "next/dynamic";

const MapLeaflet = dynamic(() => import("./MapLeaflet"), { ssr: false });

// components/MapSection.jsx — teruskan fileKeys
export default function MapSection({ geojsonFiles, fileKeys, outlineFiles, center, zoom, getFeatureStyle, fileStyles }) {
  return (
    <div className="absolute inset-0 z-10">
      <MapLeaflet
        geojsonFiles={geojsonFiles}
        fileKeys={fileKeys}
        outlineFiles={outlineFiles}
        center={center}
        zoom={zoom}
        getFeatureStyle={getFeatureStyle}
        fileStyles={fileStyles}
      />
    </div>
  );
}