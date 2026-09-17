"use client";

import { useState } from "react";
import { useCsvMultiple } from "../hooks/useCsv";
import {
  getUniqueDates,
  getStatsForDate,
  getAffectedKabupaten,
  KEJADIAN_COLOR,
  formatShortDate,
  formatLongDate,
} from "../lib/timeline";
import { KRONOLOGI_NARASI } from "../lib/kronologiNarasi";
import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import StatBadge, { StatBadgeGroup } from "../components/StatBadge";
import Legend from "../components/Legend";
import EventTimeline from "../components/EventTimeline";
import { resolveKabupatenName } from "../lib/kabupatenMapping";

const PROVINSI_FILES = [
  { key: "aceh", url: "/map/aceh.json" },
  { key: "sumut", url: "/map/sumut.json" },
  { key: "sumbar", url: "/map/sumbar.json" },
];

const KABUPATEN_PROPERTY = "WADMKK"; // GANTI sesuai properti nama kabupaten di geojson-mu

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
  const affected = getAffectedKabupaten(kecamatanRows, activeDate);
  const narasi = KRONOLOGI_NARASI[activeDate];

  const getFeatureStyle = (feature, provinsiKey) => {
  const nama = resolveKabupatenName(feature, provinsiKey);
  const type = nama ? affected.get(nama) : null;
  return {
    fillColor: type ? KEJADIAN_COLOR[type] : "#f8fafc",
    color: "#0f172a",
    weight: 1,
    fillOpacity: 1,
  };
};

  return (
    <div className="relative w-full h-full">
      <MapSection
        geojsonFiles={["/map/aceh.json", "/map/sumut.json", "/map/sumbar.json"]}
        fileKeys={["aceh", "sumut", "sumbar"]}
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
          { color: KEJADIAN_COLOR.banjir, label: "Banjir" },
          { color: KEJADIAN_COLOR.longsor, label: "Longsor" },
          { color: KEJADIAN_COLOR.gempa, label: "Gempa" },
          { color: KEJADIAN_COLOR.kombinasi, label: "Kombinasi" },
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