// Data dummy per kecamatan — nanti diganti data real dari Excel
const DATA_BANJIR = {
  "Aceh": {
    "Kab. Aceh Besar": {
      "Krueng Barona Jaya": {
        luasBanjir: 4200,        // Ha
        persentase: 50,          // %
        kedalamanRataRata: 0.85, // m
        kedalamanHujan: 2.1,     // m
        kategoriBahaya: "Sedang",
      },
      "Ingin Jaya": {
        luasBanjir: 2100,
        persentase: 30,
        kedalamanRataRata: 0.6,
        kedalamanHujan: 1.5,
        kategoriBahaya: "Ringan",
      },
    },
  },
  // Tambahkan data provinsi lain di sini
};

const KATEGORI_COLOR = {
  "Ringan":  "text-yellow-300 bg-yellow-300/20",
  "Sedang":  "text-orange-400 bg-orange-400/20",
  "Berat":   "text-red-400   bg-red-400/20",
};

const KLASIFIKASI_BANJIR = [
  { label: "Ringan",  range: "< 0,5 m",    color: "bg-blue-200" },
  { label: "Sedang",  range: "0,5 – 1,5 m", color: "bg-blue-400" },
  { label: "Berat",   range: "> 1,5 m",    color: "bg-blue-700" },
  { label: "Tidak Terdampak",             color: "bg-gray-400" },
];

function formatAngka(num) {
  return num?.toLocaleString("id-ID") ?? "-";
}

export default function BanjirView({ provinsi, kabupaten, kecamatan }) {
  // Ambil data sesuai filter
  const data =
    provinsi && kabupaten && kecamatan
      ? DATA_BANJIR[provinsi]?.[kabupaten]?.[kecamatan]
      : null;

  const kategoriClass = data ? (KATEGORI_COLOR[data.kategoriBahaya] ?? "text-white bg-white/20") : "";

  return (
    <div className="flex flex-col gap-3 max-w-xs">
      {/* Card Detail Wilayah */}
      <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-4">
        {/* Header card */}
        <p className="text-white/60 text-xs uppercase tracking-wide mb-2 border-b border-white/10 pb-2">
          Detail Wilayah
        </p>

        {/* Info wilayah terpilih */}
        {provinsi ? (
          <div className="mb-3">
            <p className="text-blue-300 font-bold text-sm">Provinsi {provinsi}</p>
            <p className="text-white/70 text-xs">{kabupaten || "—"}</p>
            <p className="text-white/50 text-xs">{kecamatan || "—"}</p>
          </div>
        ) : (
          <p className="text-white/40 text-xs italic mb-3">
            Pilih wilayah melalui filter di atas
          </p>
        )}

        {/* Data banjir */}
        {data ? (
          <>
            {/* Luas & Persentase */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-white/50 text-xs">Luas Banjir</p>
                <p className="text-blue-300 font-bold text-lg" style={{ fontFamily: "var(--font-garet-heavy)" }}>
                  {formatAngka(data.luasBanjir)}
                  <span className="text-xs font-normal ml-1">ha</span>
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Persentase</p>
                <p className="text-blue-300 font-bold text-lg" style={{ fontFamily: "var(--font-garet-heavy)" }}>
                  {data.persentase}
                  <span className="text-xs font-normal ml-0.5">%</span>
                </p>
              </div>
            </div>

            {/* Kedalaman */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <p className="text-white/50 text-xs">Kedalaman Rata-Rata</p>
                <p className="text-white font-semibold text-sm">{data.kedalamanRataRata} m</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Kedalaman Hujan</p>
                <p className="text-white font-semibold text-sm">{data.kedalamanHujan} m</p>
              </div>
            </div>

            {/* Kategori bahaya */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${kategoriClass}`}>
              ⚠ Kategori Bahaya: {data.kategoriBahaya}
            </div>
          </>
        ) : (
          provinsi && kabupaten && kecamatan && (
            <p className="text-white/40 text-xs italic">Data tidak tersedia untuk wilayah ini</p>
          )
        )}
      </div>

      {/* Legenda klasifikasi banjir */}
      <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl p-3">
        <p className="text-white/60 text-xs uppercase tracking-wide mb-2">
          Klasifikasi Banjir
        </p>
        <div className="flex flex-col gap-1.5">
          {KLASIFIKASI_BANJIR.map((item) => (
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
