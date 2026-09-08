import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import FaseTimeline from "../components/FaseTimeline";

export default function Scene07PuncakBanjir() {
  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Output Luas Banjir (Fase 2)</SectionLabel>

      <MapSection
        geojsonFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.5, 99]}
        zoom={7}
        dotOverlay
      />

      <StatBadgeGroup>
        <StatBadge value={1471.34} decimals={2} suffix=" km²" label="Luas" />
      </StatBadgeGroup>

      <StoryCard title="Puncak Banjir" className="left-8 top-16">
        <p className="italic text-slate-600 mb-2">
          Fase 2 (<span className="text-blue-600 not-italic font-semibold">26–30 November 2025</span>)
        </p>
        <p className="text-base leading-relaxed text-slate-700">
          Pada fase 2, banjir mencapai titik krusial. Di Aceh, genangan melonjak
          drastis hingga menelan lebih dari 900 km² ruang hidup warga — Aceh
          Utara jadi wilayah terberat. Sumatera Utara di kawasan Serdang
          Bedagai hingga Deli Serdang mencatat lebih dari 460 km² lahan
          keseharian tertutup air bah. Sementara warga Sumatera Barat di
          sekitar Agam dan Pasaman Barat berhadapan dengan luapan hampir 100
          km². Ini fase paling menantang bagi ketiga provinsi.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={1} />
    </div>
  );
}