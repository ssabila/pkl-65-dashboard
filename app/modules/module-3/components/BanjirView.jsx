"use client";
import { useState, useEffect, useMemo } from "react";

function formatAngka(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return Math.round(num).toLocaleString("id-ID");
}

function formatDesimal(num) {
  if (num === null || num === undefined || isNaN(num)) return "-";
  return num.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Klasifikasi bahaya banjir berdasarkan mean_nilai
function getKategoriBahayaBanjir(meanNilai) {
  if (meanNilai <= 0) return "Tidak Terdampak";
  if (meanNilai < 3) return "Ringan";
  if (meanNilai < 5) return "Sedang";
  return "Berat";
}

export default function BanjirView({ provinsi, kabupaten, kecamatan }) {
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data modul3_dampak.json
  useEffect(() => {
    fetch("/data/modul3_dampak.json")
      .then((res) => res.json())
      .then((data) => {
        setAllData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Gagal memuat data modul3_dampak.json:", err);
        setIsLoading(false);
      });
  }, []);

  // Cari data berdasarkan filter wilayah
  const selectedData = useMemo(() => {
    if (!allData.length) return null;

    // Jika ada kecamatan terpilih, cari data kecamatan spesifik
    if (provinsi && kabupaten && kecamatan) {
      return allData.find(
        (r) =>
          r.provinsi === provinsi &&
          r.nm_kabupaten === kabupaten &&
          r.nm_kecamatan === kecamatan
      ) || null;
    }

    // Jika hanya provinsi dan kabupaten, aggregate data kabupaten
    if (provinsi && kabupaten) {
      const kabData = allData.filter(
        (r) => r.provinsi === provinsi && r.nm_kabupaten === kabupaten
      );
      if (kabData.length === 0) return null;
      const totalPixel = kabData.reduce((acc, r) => acc + r.dampak_banjir_longsor.pixel_count, 0);
      const totalSum = kabData.reduce((acc, r) => acc + r.dampak_banjir_longsor.sum_nilai, 0);
      const totalLuas = kabData.reduce((acc, r) => acc + r.luas_kec_km2, 0);
      const meanNilai = totalPixel > 0 ? totalSum / totalPixel : 0;
      return {
        provinsi,
        nm_kabupaten: kabupaten,
        nm_kecamatan: `${kabData.length} Kecamatan`,
        luas_kec_km2: totalLuas,
        dampak_banjir_longsor: {
          pixel_count: totalPixel,
          sum_nilai: totalSum,
          mean_nilai: meanNilai,
        },
      };
    }

    // Jika hanya provinsi, aggregate data provinsi
    if (provinsi) {
      const provData = allData.filter((r) => r.provinsi === provinsi);
      if (provData.length === 0) return null;
      const totalPixel = provData.reduce((acc, r) => acc + r.dampak_banjir_longsor.pixel_count, 0);
      const totalSum = provData.reduce((acc, r) => acc + r.dampak_banjir_longsor.sum_nilai, 0);
      const totalLuas = provData.reduce((acc, r) => acc + r.luas_kec_km2, 0);
      const meanNilai = totalPixel > 0 ? totalSum / totalPixel : 0;
      const kabCount = new Set(provData.map((r) => r.nm_kabupaten)).size;
      return {
        provinsi,
        nm_kabupaten: `${kabCount} Kab/Kota`,
        nm_kecamatan: `${provData.length} Kecamatan`,
        luas_kec_km2: totalLuas,
        dampak_banjir_longsor: {
          pixel_count: totalPixel,
          sum_nilai: totalSum,
          mean_nilai: meanNilai,
        },
      };
    }

    // Default: aggregate seluruh wilayah
    const totalPixel = allData.reduce((acc, r) => acc + r.dampak_banjir_longsor.pixel_count, 0);
    const totalSum = allData.reduce((acc, r) => acc + r.dampak_banjir_longsor.sum_nilai, 0);
    const totalLuas = allData.reduce((acc, r) => acc + r.luas_kec_km2, 0);
    const meanNilai = totalPixel > 0 ? totalSum / totalPixel : 0;
    const provCount = new Set(allData.map((r) => r.provinsi)).size;
    const kabCount = new Set(allData.map((r) => r.nm_kabupaten)).size;
    return {
      provinsi: `${provCount} Provinsi`,
      nm_kabupaten: `${kabCount} Kab/Kota`,
      nm_kecamatan: `${allData.length} Kecamatan`,
      luas_kec_km2: totalLuas,
      dampak_banjir_longsor: {
        pixel_count: totalPixel,
        sum_nilai: totalSum,
        mean_nilai: meanNilai,
      },
    };
  }, [allData, provinsi, kabupaten, kecamatan]);

  // Compute display values
  const displayProv = provinsi
    ? provinsi.startsWith("Provinsi") ? provinsi : `Provinsi ${provinsi}`
    : selectedData?.provinsi || "Semua Wilayah";
  const displayKab = kabupaten
    ? kabupaten.startsWith("Kab.") || kabupaten.startsWith("Kota") ? kabupaten : kabupaten
    : selectedData?.nm_kabupaten || "-";
  const displayKec = kecamatan
    ? kecamatan.startsWith("Kecamatan") ? kecamatan : `Kecamatan ${kecamatan}`
    : selectedData?.nm_kecamatan || "-";

  const banjirData = selectedData?.dampak_banjir_longsor;
  // Luas banjir dalam hektar (pixel_count * 0.09 ha at 30m resolution)
  const luasBanjirHa = banjirData ? banjirData.pixel_count * 0.09 : 0;
  // Persentase terhadap luas wilayah
  const luasWilayahHa = selectedData ? selectedData.luas_kec_km2 * 100 : 1;
  const persentase = luasWilayahHa > 0 ? ((luasBanjirHa / luasWilayahHa) * 100) : 0;
  // Mean nilai sebagai kedalaman rata-rata (dB)
  const meanNilai = banjirData ? banjirData.mean_nilai : 0;
  // Sum nilai / pixel count adjusted 
  const sumNilai = banjirData ? banjirData.sum_nilai : 0;
  // Kategori bahaya
  const kategoriBahaya = getKategoriBahayaBanjir(meanNilai);

  if (isLoading) {
    return (
      <div className="w-full max-w-[580px] xl:max-w-[620px] mx-auto mt-2 xl:mt-[40px] 2xl:mt-[56px] select-none flex items-center justify-center min-h-[300px]">
        <p
          className="text-white text-[18px] font-[850] animate-pulse [text-shadow:0_3px_6px_rgba(0,0,0,0.5)]"
          style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
        >
          Memuat data...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[580px] xl:max-w-[620px] mx-auto mt-2 xl:mt-[40px] 2xl:mt-[56px] select-none">
      {/* Outer Card - Identik dengan Frosted Glass & Border Beranda */}
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
            {/* Top Row: Luas Banjir & Persentase */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p
                  className="font-[850] text-[#0F5257] text-[14px] sm:text-[15px] [-webkit-text-stroke:0.4px_rgba(15,82,87,0.3)] [text-shadow:0_1.5px_3px_rgba(0,0,0,0.25)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Luas Banjir
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
                    {formatAngka(luasBanjirHa)}
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
                    {formatDesimal(persentase)}%
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

            {/* Bottom Row: Rata-rata Dampak & Total Dampak */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <p
                  className="font-[850] text-[#0F5257] text-[13px] sm:text-[14px] [-webkit-text-stroke:0.4px_rgba(15,82,87,0.3)] [text-shadow:0_1.5px_3px_rgba(0,0,0,0.25)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Rata-rata Dampak
                </p>
                <span
                  className="text-[26px] sm:text-[30px] lg:text-[34px] font-[850] leading-none block mt-0.5"
                  style={{
                    fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                    background: "linear-gradient(90deg, #FFA6A6 6%, #CE2222 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 4px 4px #000000E3)",
                  }}
                >
                  {formatDesimal(meanNilai)}
                </span>
              </div>
              <div>
                <p
                  className="font-[850] text-[#0F5257] text-[13px] sm:text-[14px] [-webkit-text-stroke:0.4px_rgba(15,82,87,0.3)] [text-shadow:0_1.5px_3px_rgba(0,0,0,0.25)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Total Dampak
                </p>
                <span
                  className="text-[26px] sm:text-[30px] lg:text-[34px] font-[850] leading-none block mt-0.5"
                  style={{
                    fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif",
                    background: "linear-gradient(90deg, #FFA6A6 6%, #CE2222 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0px 4px 4px #000000E3)",
                  }}
                >
                  {formatAngka(sumNilai)}
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
