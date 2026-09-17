export const ACEH_KABUPATEN_BY_INDEX = [
  "Aceh Selatan",        // 0
  "Aceh Tenggara",       // 1
  "Aceh Timur",          // 2
  "Aceh Tengah",         // 3
  "Aceh Barat",          // 4
  "Aceh Besar",          // 5
  "Pidie",               // 6
  "Aceh Utara",          // 7
  "Simeulue",            // 8
  "Aceh Singkil",        // 9
  "Bireuen",             // 10
  "Aceh Barat Daya",     // 11
  "Gayo Lues",           // 12
  "Aceh Jaya",           // 13
  "Nagan Raya",          // 14
  "Aceh Tamiang",        // 15
  "Bener Meriah",        // 16
  "Pidie Jaya",          // 17
  "Kota Banda Aceh",     // 18
  "Kota Sabang",         // 19
  "Kota Lhokseumawe",    // 20
  "Kota Langsa",         // 21
  "Kota Subulussalam",   // 22
];

export const SUMUT_KABUPATEN_BY_INDEX = [
  null,                       // 0 — pulau kecil tak teridentifikasi, tidak pernah muncul di data
  "Tapanuli Tengah",          // 1
  "Tapanuli Utara",           // 2
  "Tapanuli Selatan",         // 3
  "Nias",                     // 4
  "Langkat",                  // 5
  "Karo",                     // 6
  "Deli Serdang",             // 7
  "Simalungun",               // 8
  "Asahan",                   // 9
  "Labuhanbatu",              // 10
  "Dairi",                    // 11
  "Toba",                     // 12
  "Mandailing Natal",         // 13
  "Nias Selatan",             // 14
  "Pakpak Bharat",            // 15
  "Humbang Hasundutan",       // 16
  "Samosir",                  // 17
  "Serdang Bedagai",          // 18
  "Batu Bara",                // 19
  "Padang Lawas Utara",       // 20
  "Padang Lawas",             // 21
  "Labuhanbatu Selatan",      // 22
  "Labuhanbatu Utara",        // 23
  "Nias Utara",               // 24
  "Nias Barat",               // 25
  "Kota Medan",               // 26
  "Kota Pematangsiantar",     // 27
  "Kota Sibolga",             // 28
  "Kota Tanjung Balai",       // 29
  "Kota Binjai",              // 30
  "Kota Tebing Tinggi",       // 31
  "Kota Padang Sidempuan",    // 32
  "Kota Gunungsitoli",        // 33
];

export const SUMBAR_KABUPATEN_BY_INDEX = [
  null,                       // 0 — pulau kecil di samping Pulau Bintanggor, tidak muncul di data
  null,                       // 1 — Pulau Bintanggor itu sendiri, tidak muncul di data
  "Pesisir Selatan",          // 2
  "Solok",                    // 3
  "Sijunjung",                // 4
  "Tanah Datar",              // 5
  "Padang Pariaman",          // 6
  "Agam",                     // 7
  "Lima Puluh Kota",          // 8
  "Pasaman",                  // 9
  "Kepulauan Mentawai",       // 10
  "Dharmasraya",              // 11
  "Solok Selatan",            // 12
  "Pasaman Barat",            // 13
  "Kota Padang",              // 14
  "Kota Solok",               // 15
  "Kota Sawahlunto",          // 16
  "Kota Padang Panjang",      // 17
  "Kota Bukittinggi",         // 18
  "Kota Payakumbuh",          // 19
  "Kota Pariaman",            // 20
];

export const KABUPATEN_BY_PROVINSI = {
  aceh: ACEH_KABUPATEN_BY_INDEX,
  sumut: SUMUT_KABUPATEN_BY_INDEX,
  sumbar: SUMBAR_KABUPATEN_BY_INDEX,
};

// Helper: dari feature geojson (properties.index) + kunci provinsi -> nama kabupaten
export function resolveKabupatenName(feature, provinsiKey) {
  if (feature?.properties?.WADMKK) return feature.properties.WADMKK;
  const list = KABUPATEN_BY_PROVINSI[provinsiKey];
  return list?.[feature?.properties?.index] ?? null;
}