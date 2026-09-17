"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Menyesuaikan zoom/center peta otomatis supaya seluruh data (mis. 3 provinsi) pas di layar,
// alih-alih mengandalkan center/zoom tebakan manual yang gampang meleset dan menyisakan area kosong.
export default function FitBounds({ data, padding = 24 }) {
  const map = useMap();

  useEffect(() => {
    if (!data?.length) return;
    const bounds = L.featureGroup(data.map((fc) => L.geoJSON(fc))).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [padding, padding] });
    }
  }, [data, map, padding]);

  return null;
}
