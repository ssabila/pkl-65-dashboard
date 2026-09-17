"use client";

import dynamic from "next/dynamic";
import Legend from "./Legend";
import { KECAMATAN_FILE_LIST, KABUPATEN_FILE_LIST } from "../lib/adminBoundaries";

const FloodExtentLeaflet = dynamic(() => import("./FloodExtentLeaflet"), { ssr: false });

const RASTER_LEGEND_ITEMS = [
  { color: "#2563eb", label: "Area tergenang banjir" },
  { type: "line", weight: 2, color: "#1e293b", label: "Batas kabupaten/kota" },
  { type: "line", weight: 1, color: "#94a3b8", label: "Batas kecamatan" },
];

export default function FloodExtentSection({
  boundaryFiles = KECAMATAN_FILE_LIST,
  outlineFiles = KABUPATEN_FILE_LIST,
  center,
  zoom,
  fase,
}) {
  return (
    <div className="absolute inset-0 z-10">
      <FloodExtentLeaflet
        boundaryFiles={boundaryFiles}
        outlineFiles={outlineFiles}
        center={center}
        zoom={zoom}
        fase={fase}
      />
      <Legend items={RASTER_LEGEND_ITEMS} className="left-8 bottom-8" />
    </div>
  );
}