"use client";

export default function MetadataView() {
  return (
    <div className="w-full max-w-[1380px] mx-auto select-none mt-2 xl:mt-4">
      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-start">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col gap-5 w-full">
          {/* Header Pill: Keterbatasan Data */}
          <div
            className="flex items-center justify-center px-10 py-2.5 sm:px-14 sm:py-3 rounded-[40px] border-[3px] border-white/70 shadow-[0_8px_20px_rgba(0,0,0,0.25)] w-full max-w-[420px] mx-auto"
            style={{
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.20) 100%)",
              boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.2)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            <span
              className="font-black text-white text-center text-[20px] sm:text-[22px] lg:text-[24px] [text-shadow:0_3px_6px_rgba(0,0,0,0.6)] [-webkit-text-stroke:1px_rgba(44,44,44,0.4)] whitespace-nowrap"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              Keterbatasan Data
            </span>
          </div>

          {/* Card 1: Keterbatasan Data Points */}
          <div className="bg-[#243356]/60 backdrop-blur-2xl border-[3px] border-white/40 rounded-[28px] p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.3)] flex flex-col gap-4">
            <ul className="flex flex-col gap-4 text-white text-[14px] sm:text-[15px] lg:text-[15.5px] leading-relaxed font-serif tracking-wide">
              <li className="flex gap-2.5 items-start">
                <span className="text-white text-[18px] leading-none mt-0.5">•</span>
                <span>
                  Peta genangan banjir dan sebaran tanah longsor merupakan hasil interpretasi otomatis dari citra satelit SAR (Synthetic Aperture Radar) yang mungkin memiliki tingkat margin error tertentu.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-white text-[18px] leading-none mt-0.5">•</span>
                <span>
                  Sistem tidak memperhitungkan kedalaman genangan banjir di bawah tajuk pepohonan lebat (canopy) yang mungkin tidak tertembus sinyal radar.
                </span>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="text-white text-[18px] leading-none mt-0.5">•</span>
                <span>
                  Resolusi spasial terbatas pada ukuran piksel sensor satelit, area terdampak berukuran sangat kecil (di bawah 10x10 meter) mungkin tidak terdeteksi.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 2: Metadata Terracotta Glass Card */}
          <div className="bg-[#B85D5D]/60 backdrop-blur-2xl border-[3px] border-white/45 rounded-[28px] p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.3)] flex flex-col gap-4">
            <h3
              className="font-black text-white text-center text-[22px] sm:text-[25px] lg:text-[27px] [text-shadow:0_3px_6px_rgba(0,0,0,0.6)] [-webkit-text-stroke:1px_rgba(44,44,44,0.4)] mb-1"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              Metadata
            </h3>

            <div className="flex flex-col gap-3 text-white text-[13.5px] sm:text-[14.5px] lg:text-[15px]">
              <div className="grid grid-cols-[170px_1fr] sm:grid-cols-[190px_1fr] items-center gap-2">
                <span
                  className="font-[850] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Sumber Data Utama
                </span>
                <span className="font-serif italic text-white/95">
                  Sentinel-1 (C-Band SAR) &amp; Sentinel-2 (Multispectral)
                </span>
              </div>

              <div className="grid grid-cols-[170px_1fr] sm:grid-cols-[190px_1fr] items-center gap-2">
                <span
                  className="font-[850] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Metode Pemrosesan
                </span>
                <span className="font-serif italic text-white/95">
                  Otsu Thresholding (Banjir) &amp; Log-Ratio (Longsor)
                </span>
              </div>

              <div className="grid grid-cols-[170px_1fr] sm:grid-cols-[190px_1fr] items-center gap-2">
                <span
                  className="font-[850] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Data Tambahan
                </span>
                <span className="font-serif italic text-white/95">
                  SRTM DEM 30m, Peta Batas Administrasi BPS
                </span>
              </div>

              <div className="grid grid-cols-[170px_1fr] sm:grid-cols-[190px_1fr] items-center gap-2">
                <span
                  className="font-[850] [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                >
                  Periode Pengamatan
                </span>
                <span className="font-serif italic text-white/95">
                  Desember 2023 - Januari 2024
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="flex flex-col gap-5 w-full">
          {/* Header Pill: Konsep dan Definisi */}
          <div
            className="flex items-center justify-center px-10 py-2.5 sm:px-14 sm:py-3 rounded-[40px] border-[3px] border-white/70 shadow-[0_8px_20px_rgba(0,0,0,0.25)] w-full max-w-[420px] mx-auto"
            style={{
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.20) 100%)",
              boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.2)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
            }}
          >
            <span
              className="font-black text-white text-center text-[20px] sm:text-[22px] lg:text-[24px] [text-shadow:0_3px_6px_rgba(0,0,0,0.6)] [-webkit-text-stroke:1px_rgba(44,44,44,0.4)] whitespace-nowrap"
              style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
            >
              Konsep dan Definisi
            </span>
          </div>

          {/* Card 1: Konsep dan Definisi Points */}
          <div className="bg-[#243356]/60 backdrop-blur-2xl border-[3px] border-white/40 rounded-[28px] p-6 sm:p-7 shadow-[0_12px_32px_rgba(0,0,0,0.3)] flex flex-col gap-5">
            {/* Indikator Banjir */}
            <div>
              <h4
                className="font-[850] text-white text-[16px] sm:text-[17px] lg:text-[18px] mb-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
              >
                Indikator Banjir
              </h4>
              <p className="font-serif italic text-white/95 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                FwDET2.1 (Floodwater Depth Estimation Tool) digunakan untuk mengestimasi kedalaman banjir dengan menganalisis citra SAR yang dioverlay dengan Digital Elevation Model (DEM)
              </p>
            </div>

            {/* Indikator Tanah Longsor */}
            <div>
              <h4
                className="font-[850] text-white text-[16px] sm:text-[17px] lg:text-[18px] mb-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
              >
                Indikator Tanah Longsor
              </h4>
              <p className="font-serif italic text-white/95 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                Tanah longsor dideteksi melalui perubahan nilai backscatter amplitudo citra SAR pada saat sebelum dan sesudah kejadian. Penurunan backscatter signifikan sering berkorelasi dengan hilangnya vegetasi dan pergerakan tanah.
              </p>
            </div>

            {/* Klasifikasi Bahaya */}
            <div>
              <h4
                className="font-[850] text-white text-[16px] sm:text-[17px] lg:text-[18px] mb-2.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]"
                style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
              >
                Klasifikasi Bahaya
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Ringan (Kuning) */}
                <div className="bg-[#EBF1A8]/95 rounded-[16px] p-3 border border-white/80 shadow-md flex flex-col justify-between min-h-[90px]">
                  <p
                    className="font-[850] text-[#7A6400] text-[13px] text-center mb-1.5"
                    style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                  >
                    Ringan (Kuning)
                  </p>
                  <div className="text-[11.5px] text-gray-900 font-serif leading-tight space-y-1">
                    <p>
                      <span className="font-sans font-semibold text-gray-900">Banjir</span> : <span className="italic text-gray-800">Kedalaman &lt; 0,5 m</span>
                    </p>
                    <p>
                      <span className="font-sans font-semibold text-gray-900">Longsor</span> : <span className="italic text-gray-800">Perubahan backscatter kecil</span>
                    </p>
                  </div>
                </div>

                {/* Sedang (Orange) */}
                <div className="bg-[#FCD274]/95 rounded-[16px] p-3 border border-white/80 shadow-md flex flex-col justify-between min-h-[90px]">
                  <p
                    className="font-[850] text-[#8C4A00] text-[13px] text-center mb-1.5"
                    style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                  >
                    Sedang (Orange)
                  </p>
                  <div className="text-[11.5px] text-gray-900 font-serif leading-tight space-y-1">
                    <p>
                      <span className="font-sans font-semibold text-gray-900">Banjir</span> : <span className="italic text-gray-800">Kedalaman 0,5 - 1,5 m</span>
                    </p>
                    <p>
                      <span className="font-sans font-semibold text-gray-900">Longsor</span> : <span className="italic text-gray-800">Perubahan backscatter sedang</span>
                    </p>
                  </div>
                </div>

                {/* Berat (Merah) */}
                <div className="bg-[#F88F8F]/95 rounded-[16px] p-3 border border-white/80 shadow-md flex flex-col justify-between min-h-[90px]">
                  <p
                    className="font-[850] text-[#800000] text-[13px] text-center mb-1.5"
                    style={{ fontFamily: "var(--font-garet-heavy), 'Garet', sans-serif" }}
                  >
                    Berat (Merah)
                  </p>
                  <div className="text-[11.5px] text-gray-900 font-serif leading-tight space-y-1">
                    <p>
                      <span className="font-sans font-semibold text-gray-900">Banjir</span> : <span className="italic text-gray-800">Kedalaman &gt; 1,5 m</span>
                    </p>
                    <p>
                      <span className="font-sans font-semibold text-gray-900">Longsor</span> : <span className="italic text-gray-800">Perubahan backscatter tinggi</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ground Truth Disclaimer */}
          <div className="bg-white/20 backdrop-blur-2xl border-[3px] border-white/50 rounded-[28px] p-5 sm:p-6 shadow-[0_10px_28px_rgba(0,0,0,0.2)] text-center">
            <p className="font-serif italic text-white text-[14px] sm:text-[15px] lg:text-[15.5px] leading-relaxed [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
              - Dashboard ini dimaksudkan sebagai alat bantu peringatan dini. Untuk operasional penyelamatan lapangan, petugas diwajibkan untuk mengonfirmasi data spasial ini dengan laporan langsung (ground truth) -
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
