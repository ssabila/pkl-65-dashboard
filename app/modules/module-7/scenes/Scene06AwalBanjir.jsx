import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import FaseTimeline from "../components/FaseTimeline";

export default function Scene06AwalBanjir() {
  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Output Luas Banjir (Fase 1)</SectionLabel>

      <MapSection
        geojsonFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.5, 99]}
        zoom={7}
        dotOverlay
      />

      <StatBadgeGroup>
        <StatBadge value={508.38} decimals={2} suffix=" km²" label="Luas" />
      </StatBadgeGroup>

      <StoryCard title="Awal Banjir" className="right-8 bottom-24">
        <p className="italic text-slate-600 mb-2">
          Fase 1 (<span className="text-blue-600 not-italic font-semibold">20–25 November 2025</span>)
        </p>
        <p className="text-base leading-relaxed text-slate-700">
          Pada fase awal, beberapa daerah Utara Sumatera sudah mulai terkena
          dampak dari peningkatan curah hujan. Di fase ini, air mulai merayap
          naik dan mengubah wajah ratusan hektar ruang kehidupan dan mata
          pencaharian menjadi genangan. Aceh Utara dan Pidie mencatat wilayah
          mereka terendam lebih dari 288 km², Sumatera Utara lebih dari 191 km²
          (Labuhan Batu hingga Deli Serdang), sementara Pesisir Selatan di
          Sumatera Barat mulai kemasukan air. Ini adalah fase pertama, dengan
          lebih dari 500 km² tanah Sumatera terhenti sejenak detak kehidupannya.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={0} />
    </div>
  );
}