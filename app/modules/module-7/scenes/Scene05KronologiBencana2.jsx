import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import Legend from "../components/Legend";

const LEGEND_ITEMS = [
  { color: "#7ea6d8", label: "Banjir" },
  { color: "#f2810b", label: "Gempa" },
  { color: "#1e293b", label: "Banjir & Gempa" },
];

export default function Scene05KronologiBencana2() {
  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Timeline Per 30 Nov (Banjir Dominan)</SectionLabel>

      <MapSection
        geojsonFiles={["/map/aceh.json"]}
        center={[4.8, 96.5]}
        zoom={8}
      />

      <StoryCard title="Kronologi Bencana" className="right-8 top-20">
        <p className="text-base leading-relaxed text-slate-700 mb-4">
          Terlihat bahwa pada tanggal{" "}
          <span className="text-blue-500 font-semibold">30 November 2025</span>{" "}
          kondisi semakin memburuk. Terdapat{" "}
          <span className="text-blue-500 font-semibold">485</span> kecamatan
          yang terendam banjir.{" "}
          <span className="text-blue-500 font-semibold">Dua</span> kecamatan
          diantaranya disertai gempa bumi dan{" "}
          <span className="text-red-500 font-semibold">17 kecamatan</span>{" "}
          terkena longsor.
        </p>
        <Legend items={LEGEND_ITEMS} className="static shadow-none p-0" />
      </StoryCard>
    </div>
  );
}