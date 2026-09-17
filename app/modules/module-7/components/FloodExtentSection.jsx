"use client";

import dynamic from "next/dynamic";

const FloodExtentLeaflet = dynamic(() => import("./FloodExtentLeaflet"), { ssr: false });

export default function FloodExtentSection({ boundaryFiles, center, zoom, fase }) {
  return (
    <div className="absolute inset-0 z-10">
      <FloodExtentLeaflet boundaryFiles={boundaryFiles} center={center} zoom={zoom} fase={fase} />
    </div>
  );
}