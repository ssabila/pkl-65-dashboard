export function classifyKejadian(kejadian = "") {
  const k = kejadian.toUpperCase();
  const banjir = k.includes("BANJIR");
  const gempa = k.includes("GEMPA");
  const longsor = k.includes("LONGSOR");

  const count = [banjir, gempa, longsor].filter(Boolean).length;
  if (count > 1) return "kombinasi";
  if (gempa) return "gempa";
  if (longsor) return "longsor";
  if (banjir) return "banjir";
  return "lainnya";
}

export const KEJADIAN_COLOR = {
  banjir: "#3b82f6",     // biru
  longsor: "#92400e",    // coklat
  gempa: "#dc2626",      // merah
  kombinasi: "#1e293b",  // gelap, untuk kejadian gabungan
  lainnya: "#94a3b8",
};

export function getUniqueDates(kecamatanRows) {
  const set = new Set(kecamatanRows.map((r) => r.tanggal).filter(Boolean));
  return Array.from(set).sort();
}

export function getStatsForDate(kecamatanRows, agregatRows, targetDate) {
  const kejadianHariIni = kecamatanRows.filter((r) => r.tanggal === targetDate).length;
  const kumulatif = kecamatanRows.filter((r) => r.tanggal <= targetDate).length;
  const meninggalHariIni = agregatRows
    .filter((r) => r.tanggal === targetDate)
    .reduce((sum, r) => sum + (Number(r.meninggal) || 0), 0);

  return { kejadianHariIni, kumulatif, meninggalHariIni };
}

export function getAffectedKabupaten(kecamatanRows, targetDate) {
  const rows = kecamatanRows.filter((r) => r.tanggal === targetDate);
  const map = new Map();
  rows.forEach((r) => {
    const type = classifyKejadian(r.kejadian);
    const prev = map.get(r.kabupaten);
    if (!prev) map.set(r.kabupaten, type);
    else if (prev !== type) map.set(r.kabupaten, "kombinasi");
  });
  return map;
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function formatLongDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}