// Real dataset for Module 6 - Prioritas Penanganan
// Loaded directly from public/data/modul6_crs.json
import rawCRSData from "@/public/data/modul6_crs.json";

export const PROVINSI_LIST = [
  { value: "all", label: "Semua Provinsi" },
  { value: "aceh", label: "Aceh" },
  { value: "sumut", label: "Sumatera Utara" },
  { value: "sumbar", label: "Sumatera Barat" },
];

// Komponen tab: Specific provinces (no "all")
export const PROVINSI_LIST_KOMPONEN = [
  { value: "aceh", label: "Aceh" },
  { value: "sumut", label: "Sumatera Utara" },
  { value: "sumbar", label: "Sumatera Barat" },
];

// Real geographic coordinates for all 75 kabupaten/kota across Aceh, Sumut, and Sumbar
export const KABUPATEN_COORDINATES = {
  // Aceh (23 kab/kota)
  "1101": { lat: 3.1667, lng: 97.4167 }, // Kabupaten Aceh Selatan
  "1102": { lat: 3.3667, lng: 97.7000 }, // Kabupaten Aceh Tenggara
  "1103": { lat: 4.6333, lng: 97.6333 }, // Kabupaten Aceh Timur
  "1104": { lat: 4.5333, lng: 96.8500 }, // Kabupaten Aceh Tengah
  "1105": { lat: 4.4500, lng: 96.1667 }, // Kabupaten Aceh Barat
  "1106": { lat: 5.3833, lng: 95.5167 }, // Kabupaten Aceh Besar
  "1107": { lat: 5.1167, lng: 95.9667 }, // Kabupaten Pidie
  "1108": { lat: 4.9833, lng: 97.1500 }, // Kabupaten Aceh Utara
  "1109": { lat: 2.6167, lng: 96.0833 }, // Kabupaten Simeulue
  "1110": { lat: 2.3333, lng: 97.8333 }, // Kabupaten Aceh Singkil
  "1111": { lat: 5.1000, lng: 96.6000 }, // Kabupaten Bireuen
  "1112": { lat: 3.7333, lng: 96.8333 }, // Kabupaten Aceh Barat Daya
  "1113": { lat: 3.9667, lng: 97.3500 }, // Kabupaten Gayo Lues
  "1114": { lat: 4.7200, lng: 95.6400 }, // Kabupaten Aceh Jaya
  "1115": { lat: 4.1667, lng: 96.3500 }, // Kabupaten Nagan Raya
  "1116": { lat: 4.2500, lng: 98.0500 }, // Kabupaten Aceh Tamiang
  "1117": { lat: 4.7333, lng: 96.8667 }, // Kabupaten Bener Meriah
  "1118": { lat: 5.1500, lng: 96.2167 }, // Kabupaten Pidie Jaya
  "1171": { lat: 5.5483, lng: 95.3238 }, // Kota Banda Aceh
  "1172": { lat: 5.8942, lng: 95.3242 }, // Kota Sabang
  "1173": { lat: 5.1804, lng: 97.1407 }, // Kota Lhokseumawe
  "1174": { lat: 4.4720, lng: 97.9654 }, // Kota Langsa
  "1175": { lat: 2.6417, lng: 98.0044 }, // Kota Subulussalam

  // Sumatera Utara (33 kab/kota)
  "1201": { lat: 1.8667, lng: 98.6667 }, // Kabupaten Tapanuli Tengah
  "1202": { lat: 2.0167, lng: 99.0667 }, // Kabupaten Tapanuli Utara
  "1203": { lat: 1.5167, lng: 99.2500 }, // Kabupaten Tapanuli Selatan
  "1204": { lat: 1.1333, lng: 97.6000 }, // Kabupaten Nias
  "1205": { lat: 3.7333, lng: 98.2167 }, // Kabupaten Langkat
  "1206": { lat: 3.1167, lng: 98.5000 }, // Kabupaten Karo
  "1207": { lat: 3.5167, lng: 98.7167 }, // Kabupaten Deli Serdang
  "1208": { lat: 2.9667, lng: 99.0667 }, // Kabupaten Simalungun
  "1209": { lat: 2.9833, lng: 99.6333 }, // Kabupaten Asahan
  "1210": { lat: 2.2500, lng: 100.1000 }, // Kabupaten Labuhanbatu
  "1211": { lat: 2.8667, lng: 98.3000 }, // Kabupaten Dairi
  "1212": { lat: 2.3833, lng: 99.2167 }, // Kabupaten Toba
  "1213": { lat: 0.8667, lng: 99.5500 }, // Kabupaten Mandailing Natal
  "1214": { lat: 0.5500, lng: 97.8500 }, // Kabupaten Nias Selatan
  "1215": { lat: 2.5667, lng: 98.2833 }, // Kabupaten Pakpak Bharat
  "1216": { lat: 2.2667, lng: 98.7000 }, // Kabupaten Humbang Hasundutan
  "1217": { lat: 2.6333, lng: 98.7167 }, // Kabupaten Samosir
  "1218": { lat: 3.3667, lng: 99.1500 }, // Kabupaten Serdang Bedagai
  "1219": { lat: 3.1667, lng: 99.5333 }, // Kabupaten Batu Bara
  "1220": { lat: 1.4667, lng: 99.6667 }, // Kabupaten Padang Lawas Utara
  "1221": { lat: 1.1500, lng: 99.8833 }, // Kabupaten Padang Lawas
  "1222": { lat: 1.8833, lng: 100.0833 }, // Kabupaten Labuhanbatu Selatan
  "1223": { lat: 2.3333, lng: 99.6500 }, // Kabupaten Labuhanbatu Utara
  "1224": { lat: 1.3333, lng: 97.3167 }, // Kabupaten Nias Utara
  "1225": { lat: 1.0500, lng: 97.4500 }, // Kabupaten Nias Barat
  "1271": { lat: 3.5952, lng: 98.6722 }, // Kota Medan
  "1272": { lat: 2.9600, lng: 99.0600 }, // Kota Pematangsiantar
  "1273": { lat: 1.7426, lng: 98.7792 }, // Kota Sibolga
  "1274": { lat: 2.9667, lng: 99.8000 }, // Kota Tanjung Balai
  "1275": { lat: 3.6000, lng: 98.4833 }, // Kota Binjai
  "1276": { lat: 3.3285, lng: 99.1625 }, // Kota Tebing Tinggi
  "1277": { lat: 1.3733, lng: 99.2736 }, // Kota Padang Sidempuan
  "1278": { lat: 1.2833, lng: 97.6167 }, // Kota Gunungsitoli

  // Sumatera Barat (19 kab/kota)
  "1301": { lat: -1.3500, lng: 100.5833 }, // Kabupaten Pesisir Selatan
  "1302": { lat: -0.9667, lng: 100.6500 }, // Kabupaten Solok
  "1303": { lat: -0.6833, lng: 101.3000 }, // Kabupaten Sijunjung
  "1304": { lat: -0.4667, lng: 100.5833 }, // Kabupaten Tanah Datar
  "1305": { lat: -0.6167, lng: 100.2833 }, // Kabupaten Padang Pariaman
  "1306": { lat: -0.2500, lng: 100.1667 }, // Kabupaten Agam
  "1307": { lat: -0.0167, lng: 100.6333 }, // Kabupaten Lima Puluh Kota
  "1308": { lat: 0.3500, lng: 100.0833 }, // Kabupaten Pasaman
  "1309": { lat: -2.1333, lng: 99.5833 }, // Kabupaten Kepulauan Mentawai
  "1310": { lat: -1.0500, lng: 101.6167 }, // Kabupaten Dharmasraya
  "1311": { lat: -1.4833, lng: 101.2500 }, // Kabupaten Solok Selatan
  "1312": { lat: 0.1833, lng: 99.8167 }, // Kabupaten Pasaman Barat
  "1371": { lat: -0.9471, lng: 100.4172 }, // Kota Padang
  "1372": { lat: -0.7989, lng: 100.6588 }, // Kota Solok
  "1373": { lat: -0.6811, lng: 100.7767 }, // Kota Sawahlunto
  "1374": { lat: -0.4647, lng: 100.4003 }, // Kota Padang Panjang
  "1375": { lat: -0.3056, lng: 100.3692 }, // Kota Bukittinggi
  "1376": { lat: -0.2244, lng: 100.6300 }, // Kota Payakumbuh
  "1377": { lat: -0.6264, lng: 100.1208 }, // Kota Pariaman
};

// Province bounding boxes & centers for Leaflet map navigation
export const PROVINSI_BOUNDS = {
  all: {
    center: [2.5, 98.8],
    zoom: 6,
    bounds: [
      [-2.5, 95.0],
      [6.2, 102.5],
    ],
  },
  aceh: {
    center: [4.2, 96.8],
    zoom: 7,
    bounds: [
      [2.0, 95.0],
      [6.0, 98.5],
    ],
  },
  sumut: {
    center: [2.5, 99.0],
    zoom: 7,
    bounds: [
      [0.5, 97.0],
      [4.2, 100.8],
    ],
  },
  sumbar: {
    center: [-0.65, 100.8],
    zoom: 8,
    bounds: [
      [-2.3, 99.5],
      [0.6, 102.0],
    ],
  },
};

// Helper to determine province key
function getProvinsiKey(kd_prov, provinsiName) {
  if (kd_prov === "11" || (provinsiName && provinsiName.toLowerCase().includes("aceh"))) {
    return "aceh";
  }
  if (kd_prov === "12" || (provinsiName && provinsiName.toLowerCase().includes("utara"))) {
    return "sumut";
  }
  if (kd_prov === "13" || (provinsiName && provinsiName.toLowerCase().includes("barat"))) {
    return "sumbar";
  }
  return "all";
}

// Format full official name (e.g. Kabupaten Aceh Selatan or Kota Banda Aceh)
function formatWADMKK(nm) {
  if (!nm) return "";
  if (nm.startsWith("Kota ") || nm.startsWith("Kabupaten ")) {
    return nm;
  }
  return `Kabupaten ${nm}`;
}

// Process and enrich real data from modul6_crs.json
export const WILAYAH_DATA = (rawCRSData || []).map((item) => {
  const provKey = getProvinsiKey(item.kd_prov, item.provinsi);
  const wadmkk = formatWADMKK(item.nm_kabupaten);
  const coords = KABUPATEN_COORDINATES[item.id_kab] || { lat: 0, lng: 0 };

  return {
    ...item,
    KDPKAB: item.id_kab,
    WADMKK: wadmkk,
    WADMPP: item.provinsi,
    provinsi_key: provKey,
    norm_crs: Number(item.crs?.norm_crs ?? 0),
    indeks_crs: Number(item.crs?.indeks_crs ?? 0),
    status_crs: item.crs?.status || "Sedang",
    indeks_hazard: Number(item.hazard?.indeks_hazard ?? 0),
    indeks_hazard_raw: Number(item.hazard?.indeks_hazard_raw ?? 0),
    status_hazard: item.hazard?.status || "Sedang",
    indeks_exposure: Number(item.exposure?.indeks_exposure ?? 0),
    indeks_exposure_raw: Number(item.exposure?.indeks_exposure_raw ?? 0),
    status_exposure: item.exposure?.status || "Sedang",
    indeks_kerentanan: Number(item.vulnerability?.indeks_kerentanan ?? 0),
    indeks_kerentanan_raw: Number(item.vulnerability?.indeks_kerentanan_raw ?? 0),
    status_vulnerability: item.vulnerability?.status || "Sedang",
    latitude: coords.lat,
    longitude: coords.lng,
    lat: coords.lat,
    lng: coords.lng,
    // Real sub-component breakdown from methodology
    hazard_components: {
      banjir: Number(item.hazard?.skor_banjir ?? 0),
      longsor: Number(item.hazard?.skor_longsor ?? 0),
    },
    exposure_components: {
      landuse: Number(item.exposure?.norm_landuse ?? 0),
      penduduk: Number(item.exposure?.norm_penduduk ?? 0),
      ndbi: Number(item.exposure?.norm_ndbi ?? 0),
    },
    vulnerability_components: {
      keterpaparan: Number(item.vulnerability?.indeks_keterpaparan ?? 0),
      sensitivitas: Number(item.vulnerability?.indeks_sensitivitas ?? 0),
      adaptasi: Number(item.vulnerability?.indeks_adaptasi ?? 0),
    },
  };
});

// Helper functions
export function getFilteredData(provinsiKey) {
  if (!provinsiKey || provinsiKey === "all") return WILAYAH_DATA;
  return WILAYAH_DATA.filter((d) => d.provinsi_key === provinsiKey);
}

export function getStats(data) {
  const total = data.length;
  const sangatTinggi = data.filter((d) => d.status_crs === "Sangat Tinggi").length;
  const tinggi = data.filter(
    (d) => d.status_crs === "Tinggi" || d.status_crs === "Sangat Tinggi"
  ).length;
  const sedang = data.filter((d) => d.status_crs === "Sedang").length;
  const rendah = data.filter((d) => d.status_crs === "Rendah").length;
  return { total, sangatTinggi, tinggi, sedang, rendah };
}

export function getTopCRS(data, limit = 10) {
  return [...data].sort((a, b) => b.norm_crs - a.norm_crs).slice(0, limit);
}

export function getKabupatenList(provinsiKey) {
  if (!provinsiKey) return [];
  return WILAYAH_DATA.filter((d) => d.provinsi_key === provinsiKey)
    .map((d) => ({ value: d.KDPKAB, label: d.WADMKK }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getWilayahByKDPKAB(kdpkab) {
  return WILAYAH_DATA.find((d) => d.KDPKAB === kdpkab) || null;
}
