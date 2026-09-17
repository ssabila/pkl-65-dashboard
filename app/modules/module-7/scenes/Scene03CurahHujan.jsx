"use client";

import { useState } from "react";
import RainfallGridSection from "../components/RainfallGridSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import Legend from "../components/Legend";
import DateScrubber from "../components/DateScrubber";
import { sortPeriods, formatPeriode } from "../lib/curahHujanGrid";
import { RAIN_LEGEND } from "../lib/rainfallColor";

const PERIODS = sortPeriods(["10Nov", "22Nov", "28Nov", "04Des", "10Des", "16Des", "22Des", "28Des"]);

export default function Scene03CurahHujan() {
  const [index, setIndex] = useState(2); // default: 28 Nov — puncak cerita

  const periode = PERIODS[index];

  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Curah Hujan — {formatPeriode(periode)}</SectionLabel>

      <RainfallGridSection
        url="/map/curah-hujan-grid.geojson"
        boundaryFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        center={[2.5, 99]}
        zoom={6}
        periode={periode}
      />

      <StoryCard title="Intensitas Hujan" className="left-8 bottom-24">
        <p className="text-base leading-relaxed text-slate-700">
          Curah hujan tinggi melanda{" "}
          <span className="text-blue-500 font-semibold">Utara Sumatera</span>,
          dengan sejumlah wilayah mencatat intensitas hingga kategori{" "}
          <span className="text-blue-500 font-semibold">Sangat Tinggi</span>{" "}
          (&gt;100 mm). Kondisi ini meningkatkan risiko banjir, terutama di
          daerah dengan daya serap tanah yang sudah menurun.
        </p>
      </StoryCard>

      <Legend items={RAIN_LEGEND} className="right-8 bottom-24" />

      <DateScrubber dates={PERIODS} index={index} setIndex={setIndex} formatLabel={formatPeriode} />
    </div>
  );
}