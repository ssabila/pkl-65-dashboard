// Data dummy — nanti ganti dengan data real dari Excel
// File: Luas dan Selisih Backscatter Tanah Longsor.xlsx
const DATA_LONGSOR = {
  "Aceh": {
    "Kab. Aceh Besar": {
      "Krueng Barona Jaya": {
        luasLongsor: 3000,          // Ha
        persentase: 50,             // %
        selisihBackscatter: 4.2,    // dB (rata-rata selisih)
        kategoriBahaya: "Berat",
      },
      "Ingin Jaya": {
        luasLongsor: 800,
        persentase: 18,
        selisihBackscatter: 2.1,
        kategoriBahaya: "Sedang",
      },
    },
  },
  // Tambahkan data provinsi lain di sini
};

const KATEGORI_COLOR = {
  "Ringan": "text-yellow-300 bg-yellow-300/20",
  "Sedang": "text-orange-400 bg-orange-400/20",
  "Berat":  "text-red-400   bg-red-400/20",
};

const KLASIFIKASI_LONGSOR = [
  { label: "Ringan",          range: "< 2 dB",    color: "bg-amber-200" },
  { label: "Sedang",          range: "2 – 4 dB",  color: "bg-amber-500" },
  { label: "Berat",           range: "> 4 dB",    color: "bg-amber-800" },
  { label: "Tidak Terdampak",                     color: "bg-gray-400"  },
];

function formatAngka(num) {
  return num?.toLocaleString("id-ID") ?? "-";
}

export default function TanahLongsorView({ provinsi, kabupaten, kecamatan }) {
  const data =
    provinsi && kabupaten && kecamatan
      ? DATA_LONGSOR[provinsi]?.[kabupaten]?.[kecamatan]
      : null;

  const kategoriClass = data
    ? (KATEGORI_COLOR[data.kategoriBahaya] ?? "text-white bg-white/20")
    : "";

  return (
    <div className="flex flex-col gap-3 max-w-xs">
      {/* Card Detail Wilayah */}
      <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4">
        <p className="text-white/60 text-xs uppercase tracking-wide mb-2 border-b border-white/10 pb-2">
          Detail Wilayah
        </p>

        {/* Info wilayah terpilih */}
        {provinsi ? (
          <div className="mb-3">
            <p className="text-orange-300 font-bold text-sm">Provinsi {provinsi}</p>
            <p className="text-white/70 text-xs">{kabupaten || "—"}</p>
            <p className="text-white/50 text-xs">{kecamatan || "—"}</p>
          </div>
        ) : (
          <p className="text-white/40 text-xs italic mb-3">
            Pilih wilayah melalui filter di atas
          </p>
        )}

        {/* Data longsor */}
        {data ? (
          <>
            {/* Luas & Persentase */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-white/50 text-xs">Luas Longsor</p>
                <p className="text-orange-300 font-bold text-lg" style={{ fontFamily: "var(--font-garet-heavy)" }}>
                  {formatAngka(data.luasLongsor)}
                  <span className="text-xs font-normal ml-1">ha</span>
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Persentase</p>
                <p className="text-orange-300 font-bold text-lg" style={{ fontFamily: "var(--font-garet-heavy)" }}>
                  {data.persentase}
                  <span className="text-xs font-normal ml-0.5">%</span>
                </p>
              </div>
            </div>

            {/* Selisih Backscatter */}
            <div className="mb-3">
              <p className="text-white/50 text-xs">Selisih Rata-rata Backscatter</p>
              <p className="text-white font-semibold text-sm">{data.selisihBackscatter} dB</p>
            </div>

            {/* Kategori bahaya */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${kategoriClass}`}>
              ⚠ Kategori Bahaya: {data.kategoriBahaya}
            </div>
          </>
        ) : (
          provinsi && kabupaten && kecamatan && (
            <p className="text-white/40 text-xs italic">
              Data tidak tersedia untuk wilayah ini
            </p>
          )
        )}
      </div>

      {/* Legenda klasifikasi longsor */}
      <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-3">
        <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
          Klasifikasi Longsor
        </p>
        <div className="flex flex-col gap-1.5">
          {KLASIFIKASI_LONGSOR.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-4 h-3 rounded-sm ${item.color}`} />
              <span className="text-white/70 text-xs">{item.label}</span>
              {item.range && (
                <span className="text-white/40 text-xs">— {item.range}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
