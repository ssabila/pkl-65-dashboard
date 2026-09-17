"use client";

import FloodExtentSection from "../components/FloodExtentSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import LuasBadge from "../components/LuasBadge";
import FaseTimeline from "../components/FaseTimeline";
import { useCsvMultiple } from "../hooks/useCsv";
import { getTotalLuasPerFase } from "../lib/luasBanjir";

const FASE = "fase3";
const FASE_INDEX = 2;

export default function Scene08SurutBertahap({ isActive, sceneIndex, goToScene }) {
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
      <SectionLabel>Data Output Luas Banjir (Fase 3)</SectionLabel>

      <FloodExtentSection
        boundaryFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.2, 99]}
        zoom={6}
        fase={FASE}
      />

      <LuasBadge value={totalPerFase[FASE]} />

      <StoryCard title="Surut Bertahap" className="right-8 top-8">
        <p className="italic text-slate-600 mb-2">
          Fase 3 (<span className="text-blue-600 not-italic font-semibold">1–10 Desember 2025</span>)
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          Memasuki fase ketiga, debit air perlahan mulai menyusut di ketiga provinsi. Di Aceh,
          genangan luas yang sebelumnya mengepung kini mereda dan menyisakan area terdampak sekitar
          377 km². Ini memberi sedikit ruang bagi masyarakat untuk mulai membersihkan pekarangan dan
          rumah mereka. Harapan serupa turut dirasakan warga Sumatera Utara. Seiring surutnya air di
          kisaran 295 km², langkah-langkah awal untuk memulihkan kembali denyut kehidupan mulai
          terlihat di berbagai sudut desa. Sementara itu di Sumatera Barat, kelegaan yang lebih nyata
          mulai terasa ketika luas area terdampak turun drastis hingga menyentuh angka 36 km². Kondisi
          ini perlahan mengizinkan roda keseharian warga kembali berputar. Fase ini bukan lagi
          menceritakan kepanikan menghindari air bah, melainkan tentang ketabahan dan langkah awal
          untuk bangkit menata kembali kehidupan yang sempat terendam.
        </p>
      </StoryCard>

      <FaseTimeline activeIndex={FASE_INDEX} isActive={isActive} sceneIndex={sceneIndex} goToScene={goToScene} />
    </div>
  );
}