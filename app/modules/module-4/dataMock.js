// Module 4: Primary Data Source derived from public/data/modul4_sosek.json
// Source: Data Sosek Bencana (Aceh, Sumatera Utara, dan Sumatera Barat 2025)

import sosekData from "../../../public/data/modul4_sosek.json";

// Helper function to format camelCase/unspaced regency names into clean human readable names
export function formatKabupatenName(name) {
  if (!name) return "";
  const nameMap = {
    "AcehSingkil": "Aceh Singkil",
    "AcehSelatan": "Aceh Selatan",
    "AcehTenggara": "Aceh Tenggara",
    "AcehTimur": "Aceh Timur",
    "AcehTengah": "Aceh Tengah",
    "AcehBarat": "Aceh Barat",
    "AcehBesar": "Aceh Besar",
    "AcehUtara": "Aceh Utara",
    "AcehBaratDaya": "Aceh Barat Daya",
    "GayoLues": "Gayo Lues",
    "AcehTamiang": "Aceh Tamiang",
    "NaganRaya": "Nagan Raya",
    "AcehJaya": "Aceh Jaya",
    "BenerMeriah": "Bener Meriah",
    "PidieJaya": "Pidie Jaya",
    "BandaAceh": "Kota Banda Aceh",
    "MandailingNatal": "Mandailing Natal",
    "TapanuliSelatan": "Tapanuli Selatan",
    "TapanuliTengah": "Tapanuli Tengah",
    "TapanuliUtara": "Tapanuli Utara",
    "TobaSamosir": "Toba Samosir",
    "DeliSerdang": "Deli Serdang",
    "NiasSelatan": "Nias Selatan",
    "HumbangHasundutan": "Humbang Hasundutan",
    "PakpakBarat": "Pakpak Barat",
    "SerdangBedagai": "Serdang Bedagai",
    "BatuBara": "Batu Bara",
    "PadangLawasUtara": "Padang Lawas Utara",
    "PadangLawas": "Padang Lawas",
    "LabuhanbatuSelatan": "Labuhanbatu Selatan",
    "LabuhanbatuUtara": "Labuhanbatu Utara",
    "NiasUtara": "Nias Utara",
    "NiasBarat": "Nias Barat",
    "KotaTanjungbalai": "Kota Tanjungbalai",
    "Tebingtinggi": "Kota Tebing Tinggi",
    "KotaMedan": "Kota Medan",
    "KotaBinjai": "Kota Binjai",
    "Padangsidimpuan": "Kota Padangsidimpuan",
    "Gunungsitoli": "Kota Gunungsitoli",
    "KepulauanMentawai": "Kepulauan Mentawai",
    "PesisirSelatan": "Pesisir Selatan",
    "TanahDatar": "Tanah Datar",
    "PadangPariaman": "Padang Pariaman",
    "LimaPuluhKota": "Lima Puluh Kota",
    "SolokSelatan": "Solok Selatan",
    "PasamanBarat": "Pasaman Barat",
    "Padang": "Kota Padang",
    "KotaSolok": "Kota Solok",
    "PadangPanjang": "Kota Padang Panjang",
    "Bukittinggi": "Kota Bukittinggi",
    "Payakumbuh": "Kota Payakumbuh",
    "Pariaman": "Kota Pariaman"
  };
  return nameMap[name] || name.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export const dataOverview = {
  "Aceh": {
    korbanJiwa: 564,
    rumahRusak: 147438,
    banjirPct: 0.9,
    longsorPct: 2.4
  },
  "Sumatera Utara": {
    korbanJiwa: 376,
    rumahRusak: 20284,
    banjirPct: 0.2,
    longsorPct: 0.0
  },
  "Sumatera Barat": {
    korbanJiwa: 267,
    rumahRusak: 2848,
    banjirPct: 0.1,
    longsorPct: 2.0
  }
};

// Transform all regencies from public/data/modul4_sosek.json into standard dataKerentanan array
export const dataKerentanan = sosekData.map((item) => ({
  id_kab: item.id_kab,
  kd_prov: item.kd_prov,
  provinsi: item.provinsi,
  kabupaten: formatKabupatenName(item.nm_kabupaten),
  rawKabupaten: item.nm_kabupaten,
  tahun: item.tahun,
  banjir: item.kejadian_banjir,
  longsor: item.kejadian_longsor,
  miskinPct: item.pct_penduduk_miskin,
  kepadatan: item.kepadatan_penduduk,
  balitaLansia: item.jumlah_balita_lansia,
  tanpaAirLayak: item.pct_tanpa_air_layak,
  faskes: item.jumlah_faskes,
  aksesListrik: item.pct_akses_listrik,
  sinyalLte: item.pct_desa_sinyal_lte,
  indeks: item.indeks_kerentanan,
  status: item.status_kerentanan
}));
