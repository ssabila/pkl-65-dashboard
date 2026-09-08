import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import Legend from "../components/Legend";
import EventTimeline from "../components/EventTimeline";

const LEGEND_ITEMS = [
  { color: "#7ea6d8", label: "Banjir" },
  { color: "#f2810b", label: "Gempa dan Longsor" },
  { color: "#1e293b", label: "Banjir, Gempa, dan Longsor" },
];

const DATES = ["22 Nov", "24 Nov", "25 Nov", "...", "01 Jan"];

export default function Scene04KronologiBencana1() {
  return (
    <div className="relative w-full h-full">
      <MapSection
        geojsonFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[4.2, 97]}
        zoom={7}
      />

      <StoryCard title="Kronologi Bencana" className="left-8 top-20">
        <p className="text-base leading-relaxed text-slate-700">
          Pengungsian masif di Tapanuli Tengah; Bireuen, Tanah Datar, dan Agam ikut
          terendam. Banjir meluas ke Bireuen (Aceh), Tanah Datar, dan Agam
          (Sumatera Barat), serta Tapanuli Tengah (Sumatera Utara). Hari ini
          mencatat lebih dari 9.000 warga luka-luka — angka tertinggi dalam
          periode bencana ini.
        </p>
      </StoryCard>

      <StatBadgeGroup>
        <StatBadge value={55} label="Kejadian hari ini" delay={0} />
        <StatBadge value={270} label="Meninggal hari ini" delay={120} />
        <StatBadge value={136} label="Kejadian kumulatif" delay={240} />
      </StatBadgeGroup>

      <Legend items={LEGEND_ITEMS} className="right-8 bottom-32" />
      <EventTimeline dates={DATES} activeIndex={1} />
    </div>
  );
}