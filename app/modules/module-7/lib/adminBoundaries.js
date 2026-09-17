// Sumber: Administrasi_Kecamatan (BPS, 2019), difilter ke Aceh/Sumut/Sumbar dan disederhanakan untuk web.
export const PROVINSI_KEYS = ["aceh", "sumut", "sumbar"];

export const KABUPATEN_FILES = {
  aceh: "/map/aceh.json",
  sumut: "/map/sumut.json",
  sumbar: "/map/sumbar.json",
};

export const KECAMATAN_FILES = {
  aceh: "/map/aceh_kecamatan.geojson",
  sumut: "/map/sumut_kecamatan.geojson",
  sumbar: "/map/sumbar_kecamatan.geojson",
};

export const KABUPATEN_FILE_LIST = PROVINSI_KEYS.map((key) => KABUPATEN_FILES[key]);
export const KECAMATAN_FILE_LIST = PROVINSI_KEYS.map((key) => KECAMATAN_FILES[key]);
