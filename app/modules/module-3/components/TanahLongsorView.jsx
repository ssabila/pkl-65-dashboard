"use client";

// Data Longsor dummy per kecamatan
const DATA_LONGSOR = {
  "Aceh": {
    "Kab. Aceh Besar": {
      "Krueng Barona Jaya": { luasLongsor: 3000, persentase: 50, selisihBackscatter: "6,2", kategoriBahaya: "Berat" },
      "Ingin Jaya": { luasLongsor: 1200, persentase: 25, selisihBackscatter: "3,1", kategoriBahaya: "Sedang" },
      "Kuta Baro": { luasLongsor: 800, persentase: 15, selisihBackscatter: "1,8", kategoriBahaya: "Ringan" },
    },
    "Kab. Pidie": {
      "Kota Sigli": { luasLongsor: 4500, persentase: 60, selisihBackscatter: "5,4", kategoriBahaya: "Berat" },
      "Mutiara": { luasLongsor: 2300, persentase: 35, selisihBackscatter: "3,5", kategoriBahaya: "Sedang" },
    },
  },
  "Sumatera Utara": {
    "Kota Medan": {
      "Medan Kota": { luasLongsor: 5100, persentase: 65, selisihBackscatter: "5,8", kategoriBahaya: "Berat" },
      "Medan Baru": { luasLongsor: 2800, persentase: 30, selisihBackscatter: "2,9", kategoriBahaya: "Sedang" },
    },
    "Kab. Deli Serdang": {
      "Lubuk Pakam": { luasLongsor: 3900, persentase: 45, selisihBackscatter: "3,8", kategoriBahaya: "Sedang" },
    },
  },
  "Sumatera Barat": {
    "Kota Padang": {
      "Padang Utara": { luasLongsor: 4200, persentase: 55, selisihBackscatter: "4,6", kategoriBahaya: "Berat" },
      "Kuranji": { luasLongsor: 6300, persentase: 70, selisihBackscatter: "6,8", kategoriBahaya: "Berat" },
    },
  },
};

// Fallback data jika belum memilih wilayah (Identik dengan Gambar Referensi)
const DEFAULT_DATA = {
  provinsi: "Provinsi Aceh",
  kabupaten: "Kabupaten Aceh Besar",
  kecamatan: "Kecamatan Krueng Barona Jaya",
  luasLongsor: 3000,
  persentase: 50,
  selisihBackscatter: "6,2",
  kategoriBahaya: "Berat",
};

function formatAngka(num) {
  return num?.toLocaleString("id-ID") ?? "-";
}

export default function TanahLongsorView({ provinsi, kabupaten, kecamatan }) {
  const selectedData =
    provinsi && kabupaten && kecamatan
      ? DATA_LONGSOR[provinsi]?.[kabupaten]?.[kecamatan]
      : null;

  const displayProv = provinsi ? (provinsi.startsWith("Provinsi") ? provinsi : `Provinsi ${provinsi}`) : DEFAULT_DATA.provinsi;
  const displayKab = kabupaten ? (kabupaten.startsWith("Kab.") || kabupaten.startsWith("Kota") ? kabupaten : `Kabupaten ${kabupaten}`) : DEFAULT_DATA.kabupaten;
  const displayKec = kecamatan ? (kecamatan.startsWith("Kecamatan") ? kecamatan : `Kecamatan ${kecamatan}`) : DEFAULT_DATA.kecamatan;

  const luasLongsor = selectedData ? selectedData.luasLongsor : DEFAULT_DATA.luasLongsor;
  const persentase = selectedData ? selectedData.persentase : DEFAULT_DATA.persentase;
  const selisihBackscatter = selectedData ? selectedData.selisihBackscatter : DEFAULT_DATA.selisihBackscatter;
  const kategoriBahaya = selectedData ? selectedData.kategoriBahaya : DEFAULT_DATA.kategoriBahaya;

  return (
    <div className="w-full max-w-[580px] xl:max-w-[620px] mx-auto mt-2 xl:mt-[40px] 2xl:mt-[56px] select-none">
      {/* Outer Card */}
      <div
        className="relative overflow-hidden flex flex-col items-center justify-between p-5 sm:p-6 lg:p-7 rounded-[24px] sm:rounded-[28px] border-[3.5px] sm:border-[4px] lg:border-[5px] border-[rgba(255,255,255,0.45)] transition-all duration-300 shadow-[0px_9px_11.2px_rgba(0,0,0,0.24)]"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.20) 100%)",
          boxShadow: "0px 9px 11.2px rgba(0, 0, 0, 0.24), inset 0px -2px 4px rgba(0, 0, 0, 0.2), inset 0px 2px 4px rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(51.5px)",
          WebkitBackdropFilter: "blur(51.5px)",
        }}
      >
        {/* Radial Glow Ellipse */}
        <div
          className="absolute pointer-events-none z-0"
          style={{
            width: "280px",
            height: "280px",
            background: "radial-gradient(ellipse at center, #EB8B68 0%, rgba(235, 139, 104, 0.75) 40%, transparent 75%)",
            right: "-50px",
            bottom: "-50px",
            borderRadius: "50%",
            filter: "blur(65px)",
            opacity: 0.9,
          }}
        />

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center w-full gap-4">
          {/* Frosted Glass Red Pill Badge "Detail Wilayah" */}
          <div
            className="flex items-center justify-center px-7 py-2 sm:px-9 sm:py-2.5 rounded-[40px] border-[3px] border-[rgba(255,255,255,0.65)] shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-300"
            style={{
              background: "linear-gradient(180deg, rgba(220, 50, 65, 0.75) 0%, rgba(160, 30, 45, 0.65) 100%)",
              boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
            }}
          >
            <span
              className="font-black italic text-white text-center text-[18px] sm:text-[21px] lg:text-[23px] [text-shadow:0_4px_8px_rgba(0,0,0,0.6)] whitespace-nowrap [-webkit-text-stroke:1px_rgba(44,44,44,0.4)]"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              Detail Wilayah
            </span>
          </div>

          {/* Region Titles */}
          <div className="w-full text-left px-1 flex flex-col gap-0.5">
            <p
              className="font-[850] text-[#F7C564] text-[20px] sm:text-[22px] lg:text-[24px] leading-tight [-webkit-text-stroke:1px_rgba(44,44,44,0.5)] [text-shadow:0_3px_6px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              {displayProv}
            </p>
            <p
              className="font-[850] text-white text-[18px] sm:text-[20px] lg:text-[21px] leading-tight [-webkit-text-stroke:1px_rgba(44,44,44,0.5)] [text-shadow:0_3px_6px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              {displayKab}
            </p>
            <p
              className="font-[850] italic text-white/95 text-[15px] sm:text-[17px] lg:text-[18px] leading-tight mt-0.5 [-webkit-text-stroke:0.8px_rgba(44,44,44,0.4)] [text-shadow:0_2px_4px_rgba(0,0,0,0.4)]"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              {displayKec}
            </p>
          </div>

          {/* White Inner Card */}
          <div className="w-full bg-white/95 backdrop-blur-md rounded-[22px] p-4 sm:p-5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] flex flex-col gap-3 border border-white/80">
            {/* Top Row: Luas Longsor & Persentase */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p
                  className="font-[850] text-[#0F5257] text-[14px] sm:text-[15px] [-webkit-text-stroke:0.4px_rgba(15,82,87,0.3)] [text-shadow:0_1.5px_3px_rgba(0,0,0,0.25)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Luas Longsor
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className="text-[30px] sm:text-[36px] lg:text-[40px] font-[850] leading-none"
                    style={{
                      fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                      background: "linear-gradient(90deg, #F3BB99 0%, #F43E3E 79.81%, #E50707 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0px 4px 4px #000000E3)",
                    }}
                  >
                    {formatAngka(luasLongsor)}
                  </span>
                  <span
                    className="text-[18px] sm:text-[22px] font-[850]"
                    style={{
                      fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                      background: "linear-gradient(90deg, #F43E3E 0%, #E50707 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0px 4px 4px #000000E3)",
                    }}
                  >
                    ha
                  </span>
                </div>
              </div>
              <div>
                <p
                  className="font-[850] text-[#0F5257] text-[14px] sm:text-[15px] [-webkit-text-stroke:0.4px_rgba(15,82,87,0.3)] [text-shadow:0_1.5px_3px_rgba(0,0,0,0.25)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Persentase
                </p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className="text-[30px] sm:text-[36px] lg:text-[40px] font-[850] leading-none"
                    style={{
                      fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                      background: "linear-gradient(90deg, #F3BB99 0%, #F43E3E 79.81%, #E50707 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter: "drop-shadow(0px 4px 4px #000000E3)",
                    }}
                  >
                    {persentase}%
                  </span>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="flex items-center w-full my-1">
              <div className="w-2.5 h-2.5 rounded-full bg-[#7C5A37]" />
              <div className="flex-1 h-[2px] bg-[#7C5A37]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#7C5A37]" />
            </div>

            {/* Bottom Centered Metric */}
            <div className="flex flex-col items-center justify-center text-center w-full">
              <p
                className="font-[850] text-[#0F5257] text-[13px] sm:text-[15px] [-webkit-text-stroke:0.4px_rgba(15,82,87,0.3)] [text-shadow:0_1.5px_3px_rgba(0,0,0,0.25)]"
                style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
              >
                Selisih Rata-Rata Backscatter
              </p>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span
                  className="text-[28px] sm:text-[34px] lg:text-[38px] font-[850] leading-none"
                  style={{
                    fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                    background: "linear-gradient(90deg, #FFA6A6 6%, #CE2222 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 4px 4px #000000E3)",
                  }}
                >
                  {selisihBackscatter}
                </span>
                <span
                  className="text-[20px] sm:text-[24px] lg:text-[26px] font-[850]"
                  style={{
                    fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                    background: "linear-gradient(90deg, #F43E3E 0%, #CE2222 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 4px 4px #000000E3)",
                  }}
                >
                  dB
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Kategori Bahaya */}
          <p
            className="text-[17px] sm:text-[19px] lg:text-[20px] font-[850] italic text-center text-white [-webkit-text-stroke:1px_rgba(44,44,44,0.63)] [text-shadow:0px_4px_6px_rgba(0,0,0,0.5)] mt-1"
            style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
          >
            Kategori Bahaya: {kategoriBahaya}
          </p>
        </div>
      </div>
    </div>
  );
}
