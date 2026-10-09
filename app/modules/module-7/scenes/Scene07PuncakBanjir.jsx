"use client";

import FloodExtentSection from "../components/FloodExtentSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import LuasBadge from "../components/LuasBadge";
import FaseTimeline from "../components/FaseTimeline";
import { useCsvMultiple } from "../hooks/useCsv";
import { getTotalLuasPerFase } from "../lib/luasBanjir";

const FASE = "fase2";
const FASE_INDEX = 1;

export default function Scene07PuncakBanjir({ isActive, sceneIndex, goToScene }) {
  const { data, loading } = useCsvMultiple([
    "/data/luas-banjir/ringkasan_aceh.csv",
    "/data/luas-banjir/ringkasan_sumut.csv",
    "/data/luas-banjir/ringkasan_sumbar.csv",
  ]);

  if (loading || !data) return <div className="w-full h-full bg-slate-100" />;

  const [rAceh, rSumut, rSumbar] = data;
  const totalPerFase = getTotalLuasPerFase(rAceh, rSumut, rSumbar);

  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Output Luas Banjir (Fase 2)</SectionLabel>

      <FloodExtentSection center={[2.2, 99]} zoom={6} fase={FASE} />

      <LuasBadge value={totalPerFase[FASE]} />

      <StoryCard title="Puncak Banjir" className="left-8 top-8">
        <p className="italic text-slate-600 mb-2">
          Fase 2 (<span className="text-blue-600 not-italic font-semibold">26–30 November 2025</span>)
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          Pada fase 2, banjir mencapai fase krusial. Air tak lagi sekadar singgah, melainkan meluas
          dan mencapai titik puncaknya. Di Aceh, hamparan genangan melonjak drastis hingga menelan
          lebih dari 900 km² ruang hidup warga. Banjir menjadikan wilayah seperti Aceh Utara sebagai
          titik terberat. Ujian yang sama memaksa masyarakat Sumatera Utara di kawasan Serdang
          Bedagai hingga Deli Serdang untuk saling bahu-membahu karena lebih dari 460 km² lahan
          keseharian mereka kini tertutup air bah. Sementara itu, warga Sumatera Barat di sekitar Agam
          dan Pasaman Barat juga harus berhadapan dengan luapan tertinggi yang menyentuh angka hampir
          100 km². Ini adalah fase paling menantang bagi ketiga provinsi. Sebuah momen di mana
          aktivitas harian memang dipaksa berhenti oleh alam, namun ketangguhan warga untuk saling
          menjaga justru semakin benderang.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={FASE_INDEX} isActive={isActive} sceneIndex={sceneIndex} goToScene={goToScene} />
    </div>
  );
}