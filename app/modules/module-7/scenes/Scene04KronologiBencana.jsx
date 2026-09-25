"use client";

import { useState } from "react";
import { useCsvMultiple } from "../hooks/useCsv";
import {
  getUniqueDates,
  getStatsForDate,
  getAffectedKecamatan,
  kecamatanKey,
  KEJADIAN_COLOR,
  KEJADIAN_LABEL,
  formatShortDate,
  formatLongDate,
} from "../lib/timeline";
import { KRONOLOGI_NARASI } from "../lib/kronologiNarasi";
import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import Legend from "../components/Legend";
import EventTimeline from "../components/EventTimeline";
import { KECAMATAN_FILE_LIST, KABUPATEN_FILE_LIST } from "../lib/adminBoundaries";

export default function Scene04KronologiBencana() {
  const { data, loading } = useCsvMultiple([
    "/data/timeline/kejadian_kecamatan.csv",
    "/data/timeline/kejadian_agregat.csv",
  ]);

  const [dateIndex, setDateIndex] = useState(1); // default: 23 Nov

  if (loading || !data) return <div className="w-full h-full bg-slate-100" />;

  const [kecamatanRows, agregatRows] = data;
  const dates = getUniqueDates(kecamatanRows); // otomatis 13 titik sesuai data
  const activeDate = dates[dateIndex];

  const { kejadianHariIni, kumulatif, meninggalHariIni } = getStatsForDate(
    kecamatanRows,
    agregatRows,
    activeDate
  );
  const affected = getAffectedKecamatan(kecamatanRows, activeDate);
  const narasi = KRONOLOGI_NARASI[activeDate];

  const getFeatureStyle = (feature) => {
    const key = kecamatanKey(feature?.properties?.nmkab, feature?.properties?.nmkec);
    const type = affected.get(key);
    return {
      fillColor: type ? KEJADIAN_COLOR[type] : "#f8fafc",
      color: "#0f172a",
      weight: 0.4,
      fillOpacity: 1,
    };
  };

  return (
    <div className="relative w-full h-full">
      <MapSection
        geojsonFiles={KECAMATAN_FILE_LIST}
        outlineFiles={KABUPATEN_FILE_LIST}
        center={[3.2, 98]}
        zoom={7}
        getFeatureStyle={getFeatureStyle}
      />

      <StoryCard title="Kronologi Bencana" className="left-8 top-16">
        <p className="text-sm text-blue-600 font-semibold mb-2">{formatLongDate(activeDate)}</p>
        {narasi ? (
          <>
            <p className="font-semibold text-slate-900 mb-2">{narasi.title}</p>
            <p className="text-sm leading-relaxed text-slate-700">{narasi.desc}</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">Belum ada narasi untuk tanggal ini.</p>
        )}
      </StoryCard>

      <StatBadgeGroup>
        <StatBadge value={kejadianHariIni} label="Kejadian hari ini" delay={0} />
        <StatBadge value={meninggalHariIni} label="Meninggal hari ini" delay={120} />
        <StatBadge value={kumulatif} label="Kejadian kumulatif" delay={240} />
      </StatBadgeGroup>

      <Legend
        items={[
          { color: KEJADIAN_COLOR.banjir, label: KEJADIAN_LABEL.banjir },
          { color: KEJADIAN_COLOR.gempaLongsor, label: KEJADIAN_LABEL.gempaLongsor },
          { color: KEJADIAN_COLOR.kombinasi, label: KEJADIAN_LABEL.kombinasi },
        ]}
        className="right-8 bottom-28"
      />

      <EventTimeline
        dates={dates}
        activeIndex={dateIndex}
        onSelect={setDateIndex}
        formatLabel={formatShortDate}
      />
    </div>
  );
}