export const KELAS_COLOR = {
  "RENDAH": "#fef08a",
  "MENENGAH": "#fb923c",
  "TINGGI": "#c2410c",
  "SANGAT TINGGI": "#450a0a",
};

export function rainfallColorByKelas(kelas) {
  return KELAS_COLOR[kelas] || "#e2e8f0";
}

export const RAIN_LEGEND = [
  { color: KELAS_COLOR["SANGAT TINGGI"], label: "Sangat Tinggi (>100 mm)" },
  { color: KELAS_COLOR["TINGGI"], label: "Tinggi (60–100 mm)" },
  { color: KELAS_COLOR["MENENGAH"], label: "Menengah (20–60 mm)" },
  { color: KELAS_COLOR["RENDAH"], label: "Rendah (0–20 mm)" },
];