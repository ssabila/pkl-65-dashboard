"use client";

// Data Banjir dummy per kecamatan
const DATA_BANJIR = {
  "Aceh": {
    "Kab. Aceh Besar": {
      "Krueng Barona Jaya": { luasBanjir: 4200, persentase: 50, kedalamanRataRata: "0,85", kedalamanMaks: "2,1", kategoriBahaya: "Sedang" },
      "Ingin Jaya": { luasBanjir: 2100, persentase: 30, kedalamanRataRata: "0,60", kedalamanMaks: "1,5", kategoriBahaya: "Ringan" },
      "Kuta Baro": { luasBanjir: 1500, persentase: 20, kedalamanRataRata: "0,40", kedalamanMaks: "1,1", kategoriBahaya: "Ringan" },
    },
    "Kab. Pidie": {
      "Kota Sigli": { luasBanjir: 5800, persentase: 65, kedalamanRataRata: "1,20", kedalamanMaks: "2,8", kategoriBahaya: "Berat" },
      "Mutiara": { luasBanjir: 3200, persentase: 40, kedalamanRataRata: "0,75", kedalamanMaks: "1,8", kategoriBahaya: "Sedang" },
    },
  },
  "Sumatera Utara": {
    "Kota Medan": {
      "Medan Kota": { luasBanjir: 6500, persentase: 70, kedalamanRataRata: "1,40", kedalamanMaks: "3,0", kategoriBahaya: "Berat" },
      "Medan Baru": { luasBanjir: 3100, persentase: 35, kedalamanRataRata: "0,65", kedalamanMaks: "1,6", kategoriBahaya: "Sedang" },
    },
    "Kab. Deli Serdang": {
      "Lubuk Pakam": { luasBanjir: 4900, persentase: 55, kedalamanRataRata: "0,95", kedalamanMaks: "2,2", kategoriBahaya: "Sedang" },
    },
  },
  "Sumatera Barat": {
    "Kota Padang": {
      "Padang Utara": { luasBanjir: 5200, persentase: 60, kedalamanRataRata: "1,10", kedalamanMaks: "2,5", kategoriBahaya: "Sedang" },
      "Kuranji": { luasBanjir: 7100, persentase: 75, kedalamanRataRata: "1,60", kedalamanMaks: "3,2", kategoriBahaya: "Berat" },
    },
  },
};

// Fallback data jika belum memilih wilayah
const DEFAULT_DATA = {
  provinsi: "Provinsi Aceh",
  kabupaten: "Kabupaten Aceh Besar",
  kecamatan: "Kecamatan Krueng Barona Jaya",
  luasBanjir: 4200,
  persentase: 50,
  kedalamanRataRata: "0,85",
  kedalamanMaks: "2,1",
  kategoriBahaya: "Sedang",
};

function formatAngka(num) {
  return num?.toLocaleString("id-ID") ?? "-";
}

export default function BanjirView({ provinsi, kabupaten, kecamatan }) {
  // Ambil data terpilih atau fallback default
  const selectedData =
    provinsi && kabupaten && kecamatan
      ? DATA_BANJIR[provinsi]?.[kabupaten]?.[kecamatan]
      : null;

  const displayProv = provinsi ? `Provinsi ${provinsi}` : DEFAULT_DATA.provinsi;
  const displayKab = kabupaten ? (kabupaten.startsWith("Kab.") || kabupaten.startsWith("Kota") ? kabupaten : `Kabupaten ${kabupaten}`) : DEFAULT_DATA.kabupaten;
  const displayKec = kecamatan ? `Kecamatan ${kecamatan}` : DEFAULT_DATA.kecamatan;

  const luasBanjir = selectedData ? selectedData.luasBanjir : DEFAULT_DATA.luasBanjir;
  const persentase = selectedData ? selectedData.persentase : DEFAULT_DATA.persentase;
  const kedalamanRataRata = selectedData ? selectedData.kedalamanRataRata : DEFAULT_DATA.kedalamanRataRata;
  const kedalamanMaks = selectedData ? selectedData.kedalamanMaks : DEFAULT_DATA.kedalamanMaks;
  const kategoriBahaya = selectedData ? selectedData.kategoriBahaya : DEFAULT_DATA.kategoriBahaya;

  return (
    <div className="flex flex-col gap-4 w-full max-w-[340px] select-none">
      {/* SINGLE CARD DETAIL WILAYAH BANJIR (IMAGE 1 EXACT DESIGN) */}
      <div
        className="
          relative flex flex-col items-center
          w-full px-5 py-5 sm:px-6 sm:py-6
          rounded-[32px] sm:rounded-[36px]
          border-[2.5px] border-white/60
          shadow-[0_16px_40px_rgba(0,0,0,0.25)]
          backdrop-blur-xl
        "
        style={{
          background: "linear-gradient(180deg, rgba(140, 160, 195, 0.50) 0%, rgba(210, 160, 165, 0.45) 100%)",
        }}
      >
        {/* Top Header Badge Pill */}
        <div
          className="
            flex items-center justify-center
            px-6 py-1.5 sm:px-7 sm:py-2
            rounded-full
            border border-white/80
            shadow-[0_4px_12px_rgba(0,0,0,0.2)]
            mb-4
          "
          style={{
            background: "linear-gradient(180deg, #D85A65 0%, #A53945 100%)",
          }}
        >
          <span
            className="font-black italic text-white text-[17px] sm:text-[19px] tracking-wide"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
          >
            Detail Wilayah
          </span>
        </div>

        {/* Info Wilayah (Provinsi, Kabupaten, Kecamatan) */}
        <div className="w-full text-left mb-3 px-1">
          <p
            className="font-black text-[#F7C564] text-[18px] sm:text-[20px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
          >
            {displayProv}
          </p>
          <p
            className="font-black text-white text-[16px] sm:text-[18px] leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
          >
            {displayKab}
          </p>
          <p
            className="font-bold italic text-white/90 text-[14px] sm:text-[15px] leading-snug drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)] mt-0.5"
            style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
          >
            {displayKec}
          </p>
        </div>

        {/* Divider Line Under Info */}
        <div className="w-full h-[1.5px] bg-white/40 mb-4" />

        {/* White Inner Card */}
        <div className="w-full bg-white rounded-[22px] p-4 shadow-[0_6px_20px_rgba(0,0,0,0.12)] flex flex-col gap-3">
          {/* Top Row: Luas Banjir & Persentase */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <p
                className="font-bold text-[#0F5257] text-[13px] sm:text-[14px]"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                Luas Banjir
              </p>
              <p
                className="font-black text-[#EE3B3B] text-[20px] sm:text-[22px] leading-tight"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                {formatAngka(luasBanjir)}{" "}
                <span className="text-[15px] font-black text-[#EE3B3B]">ha</span>
              </p>
            </div>
            <div>
              <p
                className="font-bold text-[#0F5257] text-[13px] sm:text-[14px]"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                Persentase
              </p>
              <p
                className="font-black text-[#EE3B3B] text-[20px] sm:text-[22px] leading-tight"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                {persentase}%
              </p>
            </div>
          </div>

          {/* Divider Line with Dot Ends (•─────────────•) */}
          <div className="flex items-center w-full my-0.5">
            <div className="w-2 h-2 rounded-full bg-[#7C5A37]" />
            <div className="flex-1 h-[1.5px] bg-[#7C5A37]" />
            <div className="w-2 h-2 rounded-full bg-[#7C5A37]" />
          </div>

          {/* Bottom Row: Kedalaman Rata-Rata & Kedalaman Maks. */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <p
                className="font-bold text-[#0F5257] text-[12px] sm:text-[13px]"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                Kedalaman Rata-Rata
              </p>
              <p
                className="font-black text-[#EE7676] text-[18px] sm:text-[20px] leading-tight"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                {kedalamanRataRata} m
              </p>
            </div>
            <div>
              <p
                className="font-bold text-[#0F5257] text-[12px] sm:text-[13px]"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                Kedalaman Maks.
              </p>
              <p
                className="font-black text-[#EE7676] text-[18px] sm:text-[20px] leading-tight"
                style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
              >
                {kedalamanMaks} m
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Text: Kategori Bahaya */}
        <p
          className="font-black italic text-white text-[16px] sm:text-[17px] mt-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
        >
          Kategori Bahaya: {kategoriBahaya}
        </p>
      </div>
    </div>
  );
}
