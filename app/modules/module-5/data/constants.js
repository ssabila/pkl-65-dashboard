/* ─────────────────────────────────────────
   COLOR PALETTE & MOCK DATA
   Shared across all Module 5 components
───────────────────────────────────────── */

export const C = {
  navy: "#2C3E50",
  blue: "#6D9DC5",
  gray: "#E8EBEF",
  orange: "#F47C36",
  teal: "#208774",
  red: "#D9383A",
};

export const IKG_DATA = [
  { kabupaten: "Kab. Nias Selatan", ikgAwal: 58.9, ikgKrisis: 95.2, status: "Sangat Kritis" },
  { kabupaten: "Kab. Aceh Selatan", ikgAwal: 51.3, ikgKrisis: 91.8, status: "Sangat Kritis" },
  { kabupaten: "Kab. Toba Samosir", ikgAwal: 42.1, ikgKrisis: 89.4, status: "Sangat Kritis" },
  { kabupaten: "Kab. Mandailing Natal", ikgAwal: 45.2, ikgKrisis: 83.7, status: "Sangat Kritis" },
  { kabupaten: "Kab. Pasaman", ikgAwal: 44.7, ikgKrisis: 78.9, status: "Kritis" },
  { kabupaten: "Kab. Pidie", ikgAwal: 38.5, ikgKrisis: 76.2, status: "Kritis" },
  { kabupaten: "Kab. Agam", ikgAwal: 35.8, ikgKrisis: 71.5, status: "Kritis" },
  { kabupaten: "Kab. Karo", ikgAwal: 33.4, ikgKrisis: 69.1, status: "Kritis" },
];

export const TOP_KABUPATEN = [
  { name: "Nias Selatan", value: 78 },
  { name: "Aceh Selatan", value: 71 },
  { name: "Toba Samosir", value: 65 },
  { name: "Mandailing Natal", value: 61 },
  { name: "Pidie", value: 58 },
  { name: "Agam", value: 52 },
  { name: "Pasaman", value: 47 },
  { name: "Karo", value: 43 },
  { name: "Simalungun", value: 38 },
  { name: "Tapanuli Utara", value: 35 },
];

export const BUBBLES = [
  { id: 1, x: 28, y: 18, r: 70, label: "Kab. Pidie", count: 127 },
  { id: 2, x: 42, y: 32, r: 55, label: "Kab. Aceh Selatan", count: 89 },
  { id: 3, x: 55, y: 45, r: 88, label: "Kab. Toba", count: 156 },
  { id: 4, x: 68, y: 55, r: 65, label: "Kab. Mandailing", count: 112 },
  { id: 5, x: 38, y: 60, r: 52, label: "Kab. Pasaman", count: 78 },
  { id: 6, x: 74, y: 28, r: 45, label: "Kab. Simalungun", count: 65 },
  { id: 7, x: 20, y: 52, r: 60, label: "Kab. Nias", count: 94 },
  { id: 8, x: 62, y: 70, r: 82, label: "Kab. Agam", count: 143 },
  { id: 9, x: 48, y: 22, r: 48, label: "Kab. Karo", count: 72 },
  { id: 10, x: 33, y: 74, r: 72, label: "Kab. Pasaman Barat", count: 118 },
];

export const BRIDGES = [
  { id: 1, cx: 52, cy: 38, label: "Jbt. Aek Godang" },
  { id: 2, cx: 44, cy: 50, label: "Jbt. Batang Palupuh" },
  { id: 3, cx: 65, cy: 56, label: "Jbt. Sungai Merangin" },
  { id: 4, cx: 37, cy: 64, label: "Jbt. Krueng Singkil" },
  { id: 5, cx: 74, cy: 42, label: "Jbt. Sungai Wampu" },
];

export const KECAMATAN_TABLE = [
  { kec: "Sipirok", kab: "Tapanuli Selatan", bangunan: "1.247", jalan: "23,4", status: "Kritis" },
  { kec: "Batang Toru", kab: "Tapanuli Selatan", bangunan: "892", jalan: "18,7", status: "Terisolir" },
  { kec: "Padangsidimpuan Utara", kab: "Padangsidimpuan", bangunan: "2.341", jalan: "45,2", status: "Kritis" },
  { kec: "Muara Tiga", kab: "Pidie", bangunan: "567", jalan: "12,1", status: "Terisolir" },
  { kec: "Tebo Ilir", kab: "Mandailing Natal", bangunan: "1.892", jalan: "34,8", status: "Waspada" },
];

/* ── Deterministic generator functions ── */
function makeBuildings(n = 65) {
  return Array.from({ length: n }, (_, i) => {
    const r = ((i * 7919 + 1337) % 1000) / 1000;
    const r2 = ((i * 6271 + 9001) % 1000) / 1000;
    return {
      id: i,
      cx: 12 + r * 78,
      cy: 8 + r2 * 84,
      damaged: i < n * 0.42,
      flooded: i < n * 0.33,
    };
  });
}

function makeParticles(n = 28) {
  return Array.from({ length: n }, (_, i) => {
    const r = ((i * 4931 + 17) % 1000) / 1000;
    const r2 = ((i * 3571 + 83) % 1000) / 1000;
    const r3 = ((i * 2137 + 49) % 1000) / 1000;
    return {
      id: i,
      x: r * 100,
      size: 3 + r2 * 5,
      color: i % 3 === 0 ? C.orange : C.blue,
      duration: 10 + r3 * 12,
      delay: -(r * 18),
    };
  });
}

function makeStars(n) {
  return Array.from({ length: n }, (_, i) => {
    const r = ((i * 6337 + 11) % 1000) / 1000;
    const r2 = ((i * 5417 + 97) % 1000) / 1000;
    const r3 = ((i * 3049 + 23) % 1000) / 1000;
    return {
      id: i,
      x: r * 100,
      y: r2 * 100,
      s: 1 + r3 * 3,
      b: 0.2 + r * 0.8,
    };
  });
}

export const BUILDINGS = makeBuildings();
export const PARTICLES = makeParticles();
export const STARS_BEFORE = makeStars(80);
export const STARS_AFTER = makeStars(30);
