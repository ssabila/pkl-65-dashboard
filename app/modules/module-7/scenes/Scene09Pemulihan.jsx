"use client";

import FloodExtentSection from "../components/FloodExtentSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import LuasBadge from "../components/LuasBadge";
import FaseTimeline from "../components/FaseTimeline";
import { useCsvMultiple } from "../hooks/useCsv";
import { getTotalLuasPerFase } from "../lib/luasBanjir";

const FASE = "fase4";
const FASE_INDEX = 3;

export default function Scene09Pemulihan({ isActive, sceneIndex, goToScene }) {
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
      <SectionLabel>Data Output Luas Banjir (Fase 4)</SectionLabel>

      <FloodExtentSection
        boundaryFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.2, 99]}
        zoom={6}
        fase={FASE}
      />

      <LuasBadge value={totalPerFase[FASE]} />

      <StoryCard title="Pemulihan" className="left-8 top-8">
        <p className="italic text-slate-600 mb-2">
          Fase 4 (<span className="text-blue-600 not-italic font-semibold">11–20 Desember 2025</span>)
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          Di fase keempat, Sumatera Utara dan Sumatera Barat mulai membaik — genangan Sumut menyusut
          ke 261 km², sementara Sumbar tinggal menyisakan 28 km². Warga di kedua provinsi ini sudah
          mulai membersihkan rumah dan memulihkan keseharian. Namun, Aceh belum ikut bernapas lega.
          Air yang sempat surut justru kembali naik ke 446 km², lebih luas dari fase sebelumnya. Hujan
          susulan memaksa warga Aceh Utara dan sekitarnya kembali berjibaku dengan genangan yang belum
          juga benar-benar pergi — dan inilah yang mendorong total luas Fase 4 sedikit lebih tinggi
          dari Fase 3. Fase ini menjadi pengingat bahwa pemulihan pascabencana tidak pernah seragam —
          satu wilayah bisa bersorak lega sementara wilayah lain masih berdiri di tepi genangan.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={FASE_INDEX} isActive={isActive} sceneIndex={sceneIndex} goToScene={goToScene} />
    </div>
  );
}