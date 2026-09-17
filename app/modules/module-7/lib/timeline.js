export function classifyKejadian(kejadian = "") {
  const k = kejadian.toUpperCase();
  const banjir = k.includes("BANJIR");
  const gempa = k.includes("GEMPA");
  const longsor = k.includes("LONGSOR");

  if (banjir && (gempa || longsor)) return "kombinasi";
  if (gempa || longsor) return "gempaLongsor";
  if (banjir) return "banjir";
  return "lainnya";
}

export const KEJADIAN_COLOR = {
  banjir: "#3b82f6",       // biru
  gempaLongsor: "#c2410c", // coklat-jingga, untuk gempa dan/atau longsor
  kombinasi: "#1e293b",    // gelap, untuk banjir + gempa/longsor
  lainnya: "#94a3b8",
};

export const KEJADIAN_LABEL = {
  banjir: "Banjir",
  gempaLongsor: "Gempa dan Longsor",
  kombinasi: "Banjir, Gempa, dan Longsor",
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

// Nama wilayah di data kejadian & di batas administrasi (BPS) kadang beda ejaan tipis
// (kapitalisasi, tanda titik di akhir, prefiks "Kota"/"Kabupaten"). Normalisasi supaya
// pencocokan lebih akurat.
export function normalizeWilayahName(name = "") {
  return name
    .trim()
    .replace(/\.+$/, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/^(kota|kabupaten)\s+/, "");
}

export function kecamatanKey(kabupaten, kecamatan) {
  return `${normalizeWilayahName(kabupaten)}|${normalizeWilayahName(kecamatan)}`;
}

// Sama seperti getAffectedKabupaten, tapi granularitas kecamatan (kabupaten+kecamatan sebagai kunci
// komposit, karena nama kecamatan bisa berulang di kabupaten berbeda).
export function getAffectedKecamatan(kecamatanRows, targetDate) {
  const rows = kecamatanRows.filter((r) => r.tanggal === targetDate);
  const map = new Map();
  rows.forEach((r) => {
    const type = classifyKejadian(r.kejadian);
    const key = kecamatanKey(r.kabupaten, r.kecamatan);
    const prev = map.get(key);
    if (!prev) map.set(key, type);
    else if (prev !== type) map.set(key, "kombinasi");
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