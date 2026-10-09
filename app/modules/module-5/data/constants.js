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


export const FLOODED_KECAMATAN_NAMES = [
  "Sungai Rumbai","Koto Parik Gadang Diateh","Sungai Pagu","Johan Pahlawan","Lembah Gumanti",
  "Muara Dua","Kaway Xvi","Kaway XVI","Tanjung Morawa","Linggo Sari Baganti","Medan Deli",
  "Medan Petisah","Sijunjung","Kubung","Tangan-Tangan","Darussalam","Glumpang Tiga",
  "Tanjung Emas","Lintau Buo","Pantai Cermin","Seunuddon","Gandapura","Juli","Muara Satu",
  "Percut Sei Tuan","Koto Besar","Koto Salak","Ingin Jaya","Kamang Baru","Sangir",
  "Medan Helvetia","Tanjung Harapan","Bukit Sundi","Medan Denai","Darul Imarah","Setia",
  "Lareh Sago Halaban","Tanjung Gadang","Kuta Baro","Lubuk Sikarah","Harau","Medan Marelan",
  "Glumpang Baro","Baktiya Barat","T. Jambo Aye","Labuhan Deli","Mutiara Timur","Darul Kamal",
  "Pidie","Delima","Medan Johor","Medan Amplas","Koto Baru","Pauh Duo","Lembang Jaya",
  "Sungayang","Sungai Tarab","Medan Baru","Sitiung","Peureulak","Medan Barat","Seulimeum",
  "Manduamas","Kualuh Leidong","Medan Sunggal","Kuta Blang","Langsa Kota","Dewantara",
  "Air Batu","Peukan Bada","Guguak","Panton Reu","Batee","Indrajaya","Susoh","Lhoksukon",
  "Matangkuli","Padang Tualang","Medan Area","Koto Vii","X Koto Diatas","Padang Ganting",
  "Payakumbuh Timur","Wih Pesam","Payakumbuh Utara","Manggeng","Badiri","Jeunieb","Peudada",
  "Sidikalang","Kualuh Hilir","Medan Maimun","Deli Tua","Pulau Punjung","Pante Ceureumen",
  "Iv Nagari","Muara Batu","Medan Selayang","Sakti","Hamparan Perak","Lintau Buo Utara",
  "Muara Batang Toru","Babalan","Kampung Rakyat","Medan Labuhan","Madat","Kuta Cot Glie",
  "Simeulue Timur","Bandar Baru","Sirandorung","Sunggal","X Koto Singkarak","Simpang Mamplam",
  "Stabat","Torgamba","Payakumbuh Barat","Blangpidie","Panai Tengah","Lengayang","Airpura",
  "Nisam","Jeumpa","Hiliran Gumanti","Lubuak Tarok","Indrapuri","Bendahara","Medan Timur",
  "Peureulak Barat","Bukit","Meureubo","Baitussalam","Kuala Batee","Blang Mangat","Idi Rayeuk",
  "Lhoknga","Kembang Tanjong","Baktiya","Lapang","Selesai","Medan Perjuangan","Sei Bamban",
  "Sangir Jujuan","Batang Anai","Tiumang","Talawi","Simpang Tiga","Mutiara","Peukan Baro",
  "Pancung Soal","Samudera","Bandar","Tukka","Pancur Batu","Sangir Balai Janggo","Nurussalam",
  "Jaya","Andam Dewi","Tanjung Balai","Bilah Hilir","Luak","Sukamakmur","Keumala",
  "Muara Batang Gadis","Payakumbuh","Batang Kuis","Kota Kisaran Timur","Padang Laweh",
  "Peulimbang","Banda Sakti","Secanggang","Bilah Hulu","Palipi","Sutera","Sumpur Kudus",
  "Barangin","Linge","Tanah Luas","Sei Bingai","Lima Puluh Pesisir","Medan Kota",
  "Medan Belawan","Basa Ampek Balai Tapan","Sawang","Kolang","Panai Hilir","Dolok Sanggul",
  "Kotarih","Sangir Batang Hari","Ranah Pesisir","Blang Bintang","Grong-grong","Grong-Grong",
  "Syamtalira Aron","Lumban Julu","Salimpaung","Pante Bidari","Kota Jantho","Padang Tiji",
  "Simpang Tiga","Teupah Selatan","Suka Makmue","Trienggadeng","Langsa Barat","Air Putih",
  "Lahewa","Payung Sekaki","Tiro/Truseb","Bawolato","Beringin","Ulakan Tapakih",
  "Asam Jujuhan","Danau Kembar","Kuala","Lumut","Patumbak","Perbaungan","Simangambat",
  "Kotapinang","Medan Tembung","Situjuah Limo Nagari","Payakumbuh Selatan","Ketol","Langkahan",
  "Seunagan","Gebang","Medan Polonia","Teluk Nibung","Silaut","Lamposi Tigo Nagori","Woyla",
  "Makmur","Seunagan Timur","Sibabangun","Siborong-Borong","Pantai Labu","Mungka","Timpeh",
  "Kuta Malaka","Titeue","Indra Jaya","Meranti","Sei Balai","Bukik Barisan","Suliki","Julok",
  "Mila","Babah Rot","Karang Baru","Pangkalan Susu","Teluk Dalam","Fanayama","Lima Kaum",
  "Koto Tangah","Simpang Ulim","Krueng Barona Jaya","Tanah Pasir","Lembah Sabil","Panteraja",
  "Tebing Tinggi","Padang Hulu","Ranah Ampek Hulu Tapan","Akabiluru","Kota Juang","Teunom",
  "Kuala Pesisir","Langsa Timur","Pandan","Tano Tombangan Angkola","Sei Lepan","Bangun Purba",
  "Pollung","Sei Suka","Datuk Tanah Datar","Pariaman Selatan","Ranto Peureulak","Montasik",
  "Muara Tiga","Nibong","Peusangan Selatan","Darul Makmur","Angkola Sangkunur","Galang",
  "Simpang Empat","Panai Hulu","Siabu","Tanjung Beringin","Lubuk Barumun",
  "Peusangan Siblah Krueng","Pinangsori","Batang Toru","Hinai","Rawang Panca Arga",
  "Rantau Utara","Onolalu","Geumpang","Timang Gajah","Parmonangan","Sipirok","Onan Ganjang",
  "Padang Bolak Tenggara","Siantar Barat","Lunang","Kupitan","Pangkalan Koto Baru","Pauh",
  "Idi Tunong","Banda Alam","Peureulak Timur","Samatiga","Seruway","Bandar Dua","Pagaran",
  "Arse","Silimakuta","Sitinjo","Medan Tuntungan","Binjai Kota","Binjai Timur","Bajenis",
  "Bayang","Darul Aman","Paya Bakong","Nisam Antara","Simeulue Barat","Beutong","Banda Mulia",
  "Pangaribuan","Binjai","Tanjung Pura","Laubaleng","Namo Rambe","Lubuk Pakam","Balige",
  "Panyabungan","Maniamolo","Luahagundre Maniamolo","Simanindo","Batang Kapas",
  "Ix Koto Sungai Lasi","Lubuk Alung","Sembilan Koto","Permata","Ulim","Langsa Baro","Merek",
  "Sibolangit","Kota Kisaran Barat","Batahan","Teluk Dalam","Sijamapolang","Nainggolan",
  "Padang Bolak","Halongonan Timur","Nan Sabaris","Pegasing","Lembah Seulawah","Peusangan",
  "Rantau","Sipoholon","Simangumban","Kabanjahe","Juhar","Air Joman","Sumbul",
  "Lintong Nihuta","Nibung Hangus","Portibi","Kualuh Selatan","Lotu","Mandrehe Barat",
  "Tebing Tinggi Kota","Tigo Lurah","Rambatan","Jagong Jeget","Arongan Lambalek","Jeumpa",
  "Pasie Raya","Barus","Sosorgadong","Tarutung","Purba Tua","Angkola Timur","Bandar",
  "Rahuning","Amandraya","Hilimegai","Pantai Cermin","Na IX - X","Mandrehe",
  "Siantar Sitalasari","Binjai Barat","Padangsidimpuan Tenggara","Sintuak Toboh Gadang",
  "Kuranji","Labuhan Haji Timur","Labuhan Haji Barat","Idi Timur","Tangse","Kuta Makmur",
  "Meurah Mulia","Syamtalira Bayu","Teluk Dalam","Jangka Buya","Ulee Kareng","Wampu",
  "Berandan Barat","Sirapit","Mardingding","Merdeka","Gunung Malela","Bosar Maligas",
  "Sidamanik","Haranggaol Horisan","Sei Kepayang","Silau Laut","Pangkatan","Gunung Sitember",
  "Natal","Tanah Masa","Harian","Pangururan","Hutaraja Tinggi","Sitolu Ori","Sibolga Utara",
  "Pariangan","Kamang Magek","Bukik Barisan","Labuhanhaji","Darul Ihsan","Darul Falah",
  "Rusip Antara","Lhoong","Salang","Alafan","Samalanga","Pandrah","Jangka","Kuala",
  "Teripe Jaya","Tripa Makmur","Manyak Payed","Langsa Lama","Pasaribu Tobing",
  "Saipar Dolok Hole","Berastagi","Simpang Empat","Pamatang Sidamanik","Purba",
  "Rantau Selatan","Tanah Pinem","Lae Parira","Parmaksian","Lingga Bayu","Mazino","Pakkat",
  "Sitio-Tio","Teluk Mengkudu","Bandar Khalipah","Pegajahan","Sosa Timur","Aek Kuo",
  "Ulu Moro'O","Siantar Timur","Batipuah Selatan","Ampek Angkek","Pintu Rime Gayo","Bintang",
  "Teupah Barat","Teupah Tengah","Syiah Kuala","Banda Raya","Sukajaya","Adian Koting",
  "Bahorok","Kuala","Sawit Seberang","Tigapanah","Tigabinanga","Pagar Merbau","Tanah Jawa",
  "Pamatang Silima Huta","Pulau Rakyat","Sei Kepayang Barat","Porsea","Sigumpar",
  "Panyabungan Selatan","Ranto Baek","Puncak Sorik Marapi","Naga Juang","Sidua'Ori",
  "Sitelu Tali Urang Jehe","Sitelu Tali Urang Julu","Parlilitan","Medang Deras",
  "Alasa Talumuzoi","Afulu","Lolofitu Moi","Siantar Utara","Siantar Marimbun","Binjai Selatan",
  "Padangsidimpuan Hutaimbaru","Sipora Utara","Lubuk Begalung","Nanggalo","Lembah Segar",
  "Rantau Selamat","Peudawa","Silih Nara","Bebesen","Kute Panang","Laut Tawar","Bubon",
  "Woyla Barat","Mesjid Raya","Mane","Pirak Timur","Geuredong Pase","Banda Baro","Panga",
  "Beutong Ateuh Banggalang","Sekerak","Bener Kelipah","Meurah Dua","Sarudik",
  "Angkola Selatan","Ulugawo","Munte","Payung","Kutalimbaru","Biru-Biru","Siantar",
  "Jorlang Hataran","Hatonduhan","Dolok Panribuan","Jawa Maraja Bah Jambi","Bandar Huluan",
  "Ujung Padang","Sei Dadap","Sei Kepayang Timur","Pulo Bandring","Bilah Barat",
  "Siempat Nempu","Berampu","Bonatua Lunasi","Panyabungan Utara","Panyabungan Barat",
  "Lembah Sorik Marapi","Huta Bargot","Ulunoyo","Kerajaan","Ronggur Nihuta","Dolok Merawan",
  "Lima Puluh","Talawi","Tanjung Tiram","Padang Bolak Julu","Silangkitang","Marbau","Lahomi",
  "Padangsidimpuan Utara","Padangsidimpuan Selatan","Padangsidimpuan Batunadua","Iv Jurai",
  "Gunung Talang","Batipuh","Baso","Kapur IX","Birem Bayeun","Sungai Raya","Simpang Jernih",
  "Atu Lintang","Sungai Mas","Woyla Timur","Pulo Aceh","Kota Sigli","Simeulue Tengah",
  "Simeulue Cut","Setia Bakti","Darul Hikmah","Tadu Raya","Syiah Utama","Baiturrahman",
  "Meuraxa","Kuta Raja","Sorkam","Barus Utara","Pahae Jae","Muara","Angkola Barat","Marancar",
  "Sayur Matinggi","Angkola Muara Tais","Gido","Idanogawo","Sogae'Adu","Batang Serangan",
  "Barusjahe","Kutabuluh","Naman Teran","Stm Hilir","Gunung Maligas","Panombeian Panei",
  "Girsang Sipangan Bolon","Dolok Batu Nanggar","Dolok Silou","Silou Kahean","Raya",
  "Bandar Pasir Mandoge","Aek Kuasan","Aek Songsongan","Aek Ledong","Tigalingga",
  "Silima Pungga Pungga","Siempat Nempu Hilir","Pegagan Hilir","Silaen","Bukit Malintang",
  "Batang Natal","Sinunukan","Lolowau","Umbunasi","Pulau-Pulau Batu Timur","Huruna","Salak",
  "Paranginan","Tarabintang","Sei Rampah","Dolok Masihul","Tebing Syahbandar","Laut Tador",
  "Batang Onang","Huristak","Barumun","Sungai Kanan","Aek Natas","Tugala Oyo","Lahewa Timur",
  "Sirombu","Siantar Selatan","Sibolga Selatan","Sibolga Sambas","Tanjungbalai Selatan",
  "Tanjungbalai Utara","Padang Hilir","Gunungsitoli Barat","Koto Xi Tarusan","Junjung Sirih",
  "Tanjuang Baru","Enam Lingkung","Siberut Selatan","Padang Selatan","Padang Barat",
  "Bungus Teluk Kabung"
];
