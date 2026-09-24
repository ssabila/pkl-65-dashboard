"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const GeoIndexInspector = dynamic(() => import("./GeoIndexInspector"), { ssr: false });

const CONFIG = {
  aceh: { url: "/map/aceh.json", center: [4.5, 96.5], zoom: 7 },
  sumut: { url: "/map/sumut.json", center: [2.5, 99], zoom: 7 },
  sumbar: { url: "/map/sumbar.json", center: [-0.8, 100.5], zoom: 7 },
};

export default function GeoInspectPage() {
  const params = useSearchParams();
  const prov = params.get("prov") || "aceh";
  const cfg = CONFIG[prov] || CONFIG.aceh;

  return (
    <div className="w-screen h-screen">
      <div className="absolute top-2 left-2 z-[1000] bg-white rounded-lg shadow px-3 py-2 text-sm font-semibold">
        Provinsi: {prov} — ganti lewat ?prov=aceh / ?prov=sumut / ?prov=sumbar
      </div>
      <GeoIndexInspector url={cfg.url} center={cfg.center} zoom={cfg.zoom} />
    </div>
  );
}