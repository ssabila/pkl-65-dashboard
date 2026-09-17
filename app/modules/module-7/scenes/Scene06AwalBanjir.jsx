"use client";

import { useCsvMultiple } from "../hooks/useCsv";
import { getTotalLuasPerFase } from "../lib/luasBanjir";
import FloodExtentSection from "../components/FloodExtentSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import LuasBadge from "../components/LuasBadge";
import FaseTimeline from "../components/FaseTimeline";

const FASE = "fase1";
const FASE_INDEX = 0;

export default function Scene06AwalBanjir({ isActive, sceneIndex, goToScene }) {
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
      <SectionLabel>Data Output Luas Banjir (Fase 1)</SectionLabel>

      <FloodExtentSection
        boundaryFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.2, 99]}
        zoom={6}
        fase={FASE}
      />

      <LuasBadge value={totalPerFase[FASE]} />

      <StoryCard title="Awal Banjir" className="right-8 top-[35%]">
        <p className="italic text-slate-600 mb-2">
          Fase 1 (<span className="text-blue-600 not-italic font-semibold">20–25 November 2025</span>)
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          Pada fase awal, beberapa daerah Utara Sumatera sudah mulai terkena dampak dari peningkatan
          curah hujan. Di fase ini, air mulai merayap naik dan mengubah wajah ratusan hektar ruang
          kehidupan dan mata pencaharian menjadi genangan. Di ujung pulau, warga Aceh Utara dan Pidie
          harus menatap nanar ketika daerah mereka mendadak terendam oleh air yang menyapu lebih dari
          288 km². Kecemasan serupa turut menyelimuti saudara-saudara kita di Sumatera Utara. Saat air
          bah menelan lebih dari 191 km², warga di Labuhan Batu hingga Deli Serdang terpaksa untuk
          bergegas menyelamatkan keluarga serta sisa harapan di tengah genangan yang terus meninggi.
          Sementara itu, di Sumatera Barat, raut kekhawatiran mulai tergambar jelas di wajah warga
          Pesisir Selatan saat air mulai memasuki batas-batas rumah mereka. Ini adalah fase pertama,
          sebuah titik awal dengan lebih dari 500 km² tanah Sumatera terhenti sejenak detak
          kehidupannya dan hanya menyisakan ketegaran dan doa para warga yang berjuang bertahan di
          kepungan air.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={FASE_INDEX} isActive={isActive} sceneIndex={sceneIndex} goToScene={goToScene} />
    </div>
  );
}