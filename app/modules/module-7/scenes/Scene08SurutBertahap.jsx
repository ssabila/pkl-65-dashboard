import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import FaseTimeline from "../components/FaseTimeline";

export default function Scene08SurutBertahap() {
  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Output Luas Banjir (Fase 3)</SectionLabel>

      <MapSection
        geojsonFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.5, 99]}
        zoom={7}
        dotOverlay
      />

      <StatBadgeGroup>
        <StatBadge value={710.12} decimals={2} suffix=" km²" label="Luas" />
      </StatBadgeGroup>

      <StoryCard title="Surut Bertahap" className="right-8 bottom-24">
        <p className="italic text-slate-600 mb-2">
          Fase 3 (<span className="text-blue-600 not-italic font-semibold">1–10 Desember 2025</span>)
        </p>
        <p className="text-base leading-relaxed text-slate-700">
          Memasuki fase ketiga, debit air perlahan mulai menyusut di ketiga
          provinsi. Di Aceh, genangan luas kini mereda dan menyisakan area
          terdampak sekitar 377 km². Sumatera Utara surut ke kisaran 295 km²,
          langkah awal pemulihan mulai terlihat di berbagai sudut desa.
          Sumatera Barat turun drastis hingga menyentuh angka 36 km². Fase ini
          bukan lagi tentang menghindari air bah, melainkan tentang ketabahan
          dan langkah awal untuk bangkit.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={2} />
    </div>
  );
}