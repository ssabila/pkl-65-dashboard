"use client";

import dynamic from "next/dynamic";
import { KECAMATAN_FILE_LIST, KABUPATEN_FILE_LIST } from "../lib/adminBoundaries";

const RainfallGridLeaflet = dynamic(() => import("./RainfallGridLeaflet"), { ssr: false });

export default function RainfallGridSection({
  url,
  boundaryFiles = KECAMATAN_FILE_LIST,
  outlineFiles = KABUPATEN_FILE_LIST,
  center,
  zoom,
  periode,
}) {
  return (
    <div className="absolute inset-0 z-10">
      <RainfallGridLeaflet
        url={url}
        boundaryFiles={boundaryFiles}
        outlineFiles={outlineFiles}
        center={center}
        zoom={zoom}
        periode={periode}
      />
    </div>
  );
}