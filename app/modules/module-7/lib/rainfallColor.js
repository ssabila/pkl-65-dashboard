// Skala warna curah hujan berdasarkan nilai mm aktual (bukan kelas kategorikal BPS),
// supaya variasi intensitas tinggi (data mentah berkisar 0–391 mm) lebih kelihatan di peta.
const RAIN_BANDS = [
  { max: 75, color: "#fef9c3", label: "Rendah (<75 mm)" },
  { max: 100, color: "#fde047", label: "Menengah (75–100 mm)" },
  { max: 150, color: "#fb923c", label: "Tinggi (100–150 mm)" },
  { max: 200, color: "#ea580c", label: "Sangat Tinggi (150–200 mm)" },
  { max: 250, color: "#b91c1c", label: "Ekstrem (200–250 mm)" },
  { max: Infinity, color: "#450a0a", label: "Sangat Ekstrem (>250 mm)" },
];

export function rainfallColorByValue(mm) {
  if (typeof mm !== "number" || Number.isNaN(mm)) return "#e2e8f0";
  const band = RAIN_BANDS.find((b) => mm < b.max);
  return band.color;
}

// Kompatibilitas: sebagian kode lama masih memakai kelas kategorikal BPS.
const KELAS_COLOR = {
  RENDAH: RAIN_BANDS[0].color,
  MENENGAH: RAIN_BANDS[2].color,
  TINGGI: RAIN_BANDS[3].color,
  "SANGAT TINGGI": RAIN_BANDS[5].color,
};

export function rainfallColorByKelas(kelas) {
  return KELAS_COLOR[kelas] || "#e2e8f0";
}

export const RAIN_LEGEND = [...RAIN_BANDS].reverse().map((b) => ({ color: b.color, label: b.label }));
