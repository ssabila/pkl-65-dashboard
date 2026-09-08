import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import FaseTimeline from "../components/FaseTimeline";

export default function Scene09Pemulihan() {
  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Output Luas Banjir (Fase 4)</SectionLabel>

      <MapSection
        geojsonFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.5, 99]}
        zoom={7}
        dotOverlay
      />

      <StatBadgeGroup>
        <StatBadge value={735.86} decimals={2} suffix=" km²" label="Luas" />
      </StatBadgeGroup>

      <StoryCard title="Pemulihan" className="left-8 top-16">
        <p className="italic text-slate-600 mb-2">
          Fase 4 (<span className="text-blue-600 not-italic font-semibold">11–20 Desember 2025</span>)
        </p>
        <p className="text-base leading-relaxed text-slate-700">
          Di fase keempat, Sumatera Utara dan Sumatera Barat mulai membaik —
          genangan Sumut menyusut ke 261 km², Sumbar tinggal 28 km². Namun,
          Aceh belum ikut bernapas lega. Air yang sempat surut justru kembali
          naik ke 446 km² akibat hujan susulan. Fase ini menjadi pengingat
          bahwa pemulihan pascabencana tidak pernah seragam — satu wilayah
          bisa bersorak lega sementara wilayah lain masih berdiri di tepi
          genangan.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={3} />
    </div>
  );
}