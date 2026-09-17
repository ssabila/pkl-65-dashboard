"use client";

import dynamic from "next/dynamic";

const RainfallGridLeaflet = dynamic(() => import("./RainfallGridLeaflet"), { ssr: false });

export default function RainfallGridSection({ url, boundaryFiles, center, zoom, periode }) {
  return (
    <div className="absolute inset-0 z-10">
      <RainfallGridLeaflet
        url={url}
        boundaryFiles={boundaryFiles}
        center={center}
        zoom={zoom}
        periode={periode}
      />
    </div>
  );
}