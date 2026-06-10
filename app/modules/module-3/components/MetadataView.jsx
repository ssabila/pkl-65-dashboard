const METADATA_INFO = {
  totalNama: "Peta Banjir dan Tanah Longsor",
  unitAnalisis: "Kecamatan (Aceh, Sumatera Utara, Sumatera Barat)",
  waktuPelaksanaan: "Oktober – November 2025",
  sumberData: "Copernicus Emergency Management Service (CEMS), SAR Sentinel-1",
  penanggungjawab: "Kelompok PKL 65 – Politeknik Statistika STIS",
};

const KETERBATASAN = [
  "Peta genangan banjir merupakan hasil estimasi dari model hidrologi berbasis DEM MERIT, sehingga mungkin terdapat perbedaan dengan kondisi lapangan.",
  "Data tanah longsor bersumber dari selisih backscatter SAR Sentinel-1 sebelum dan sesudah kejadian, sehingga tidak mencakup longsor di bawah vegetasi lebat.",
  "Batas kecamatan menggunakan data LapakGIS 2024 yang mungkin belum mencerminkan perubahan administrasi terbaru.",
  "Analisis dilakukan pada skala kecamatan, sehingga variasi di tingkat desa tidak tertangkap.",
];

const KONSEP_DEFINISI = [
  {
    istilah: "Indikator Banjir",
    deskripsi:
      "FW0152 (Flooded Area) – Luas area genangan banjir per kecamatan yang diperoleh dari model FwDET 2.1 berbasis DEM MERIT. Satuan: hektar (Ha).",
  },
  {
    istilah: "Indikator Tanah Longsor",
    deskripsi:
      "Selisih rata-rata nilai backscatter SAR Sentinel-1 (dB) antara citra pra-kejadian dan pasca-kejadian. Nilai lebih tinggi mengindikasikan perubahan permukaan yang lebih signifikan.",
  },
];

const KLASIFIKASI = [
  {
    jenis: "Banjir",
    warna: "text-blue-300",
    items: [
      { label: "Ringan",          range: "Kedalaman < 0,5 m",    color: "bg-blue-200" },
      { label: "Sedang",          range: "0,5 – 1,5 m",          color: "bg-blue-400" },
      { label: "Berat",           range: "> 1,5 m",              color: "bg-blue-700" },
      { label: "Tidak Terdampak", range: "—",                    color: "bg-gray-500" },
    ],
  },
  {
    jenis: "Tanah Longsor",
    warna: "text-orange-300",
    items: [
      { label: "Ringan",          range: "Selisih < 2 dB",       color: "bg-amber-200" },
      { label: "Sedang",          range: "2 – 4 dB",             color: "bg-amber-500" },
      { label: "Berat",           range: "> 4 dB",               color: "bg-amber-800" },
      { label: "Tidak Terdampak", range: "—",                    color: "bg-gray-500" },
    ],
  },
];

export default function MetadataView() {
  return (
    <div className="flex gap-4 w-full">
      {/* Kolom Kiri */}
      <div className="flex flex-col gap-3 flex-1">
        {/* Keterbatasan Data */}
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-3 border-b border-white/10 pb-2">
            Keterbatasan Data
          </p>
          <ul className="flex flex-col gap-2">
            {KETERBATASAN.map((item, i) => (
              <li key={i} className="flex gap-2 text-white/70 text-xs leading-relaxed">
                <span className="text-white/40 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Metadata */}
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-3 border-b border-white/10 pb-2">
            Metadata
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries({
              "Nama Data":           METADATA_INFO.totalNama,
              "Unit Analisis":       METADATA_INFO.unitAnalisis,
              "Waktu Pelaksanaan":   METADATA_INFO.waktuPelaksanaan,
              "Sumber Data":         METADATA_INFO.sumberData,
              "Penanggung Jawab":    METADATA_INFO.penanggungjawab,
            }).map(([key, val]) => (
              <div key={key} className="grid grid-cols-[140px_1fr] gap-2">
                <span className="text-white/50 text-xs">{key}</span>
                <span className="text-white/80 text-xs">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kolom Kanan */}
      <div className="flex flex-col gap-3 flex-1">
        {/* Konsep dan Definisi */}
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-3 border-b border-white/10 pb-2">
            Konsep dan Definisi
          </p>
          <div className="flex flex-col gap-3">
            {KONSEP_DEFINISI.map((item) => (
              <div key={item.istilah}>
                <p className="text-yellow-300 text-xs font-semibold mb-1">{item.istilah}</p>
                <p className="text-white/70 text-xs leading-relaxed">{item.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Klasifikasi Bahaya */}
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4">
          <p className="text-white font-semibold text-sm mb-3 border-b border-white/10 pb-2">
            Klasifikasi Bahaya
          </p>
          <div className="flex gap-4">
            {KLASIFIKASI.map((kel) => (
              <div key={kel.jenis} className="flex-1">
                <p className={`text-xs font-semibold mb-2 ${kel.warna}`}>{kel.jenis}</p>
                <div className="flex flex-col gap-1.5">
                  {kel.items.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-4 h-3 rounded-sm flex-shrink-0 ${item.color}`} />
                      <div>
                        <span className="text-white/80 text-xs">{item.label}</span>
                        <span className="text-white/40 text-xs ml-1">({item.range})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
