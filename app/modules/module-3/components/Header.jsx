"use client";
import { useState, useRef, useEffect } from "react";

const DATA_WILAYAH = {
  "Aceh": {
    "Kab. Aceh Besar": ["Krueng Barona Jaya", "Ingin Jaya", "Kuta Baro"],
    "Kab. Pidie": ["Kota Sigli", "Mutiara", "Grong-Grong"],
  },
  "Sumatera Utara": {
    "Kab. Deli Serdang": ["Lubuk Pakam", "Sunggal", "Pantai Labu"],
    "Kota Medan": ["Medan Kota", "Medan Baru", "Medan Timur"],
  },
  "Sumatera Barat": {
    "Kab. Padang Pariaman": ["Pariaman", "Lubuk Alung", "Batang Anai"],
    "Kota Padang": ["Padang Utara", "Padang Selatan", "Kuranji"],
  },
};

// Komponen dropdown kustom glassmorphism
function CustomDropdown({ label, value, options, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayText = value ? value : `${label} ...`;

  return (
    <div ref={ref} className="relative mod3-dropdown-wrapper">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((v) => !v)}
        disabled={disabled}
        className="
          mod3-dropdown-trigger
          flex flex-row justify-between items-center
          px-5 py-2.5 sm:px-7 sm:py-3.5
          w-full sm:w-[220px] md:w-[250px] lg:w-[270px]
          rounded-[35px]
          transition-all duration-200
          hover:opacity-95 active:scale-98
        "
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.12) 100%)",
          boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "3.5px solid rgba(255,255,255,0.75)",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Teks "Provinsi ..." */}
        <span
          className="
            flex items-center
            font-[850]
            text-[16px] sm:text-[20px] md:text-[22px]
            leading-tight
            text-white
            whitespace-nowrap
            overflow-hidden
            text-ellipsis
            [-webkit-text-stroke:1px_rgba(44,44,44,0.6)]
            [text-shadow:0_3px_6px_rgba(0,0,0,0.3)]
          "
          style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
        >
          {displayText}
        </span>

        {/* Teks "v" */}
        <span
          className="
            flex items-center text-center
            font-bold
            text-[18px] sm:text-[22px]
            text-[#272525]
            ml-2 flex-shrink-0
          "
          style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
        >
          v
        </span>
      </button>

      {/* Dropdown list */}
      {isOpen && options.length > 0 && (
        <div
          className="absolute left-0 z-[100] overflow-hidden mod3-dropdown-list"
          style={{
            top: "calc(100% + 8px)",
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            borderRadius: "20px",
            boxShadow: "0px 12px 32px rgba(0,0,0,0.25)",
            width: "100%",
            minWidth: "220px",
          }}
        >
          {/* Default clear option if value is selected */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="w-full text-left px-5 py-2.5 text-red-600 hover:bg-red-50 font-bold transition-colors text-sm border-b border-gray-100"
              style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            >
              ✕ Reset {label}
            </button>
          )}

          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="w-full text-left px-5 py-3 transition-colors hover:bg-gray-100/80"
              style={{
                fontFamily: "var(--font-garet-heavy), sans-serif",
                fontSize: "16px",
                fontWeight: 850,
                color: value === opt ? "#222222" : "#555555",
                background: value === opt ? "rgba(200,200,200,0.3)" : "transparent",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({
  filterProvinsi, setFilterProvinsi,
  filterKabupaten, setFilterKabupaten,
  filterKecamatan, setFilterKecamatan,
}) {
  const provinsiList = Object.keys(DATA_WILAYAH);
  const kabupatenList = filterProvinsi
    ? Object.keys(DATA_WILAYAH[filterProvinsi] ?? {})
    : [];
  const kecamatanList = filterProvinsi && filterKabupaten
    ? (DATA_WILAYAH[filterProvinsi]?.[filterKabupaten] ?? [])
    : [];

  const handleProvinsiChange = (val) => {
    setFilterProvinsi(val);
    setFilterKabupaten("");
    setFilterKecamatan("");
  };

  const handleKabupatenChange = (val) => {
    setFilterKabupaten(val);
    setFilterKecamatan("");
  };

  return (
    <header className="mod3-header flex flex-col lg:flex-row items-center lg:items-start justify-between px-3 sm:px-8 lg:px-16 pt-12 sm:pt-10 lg:pt-14 pb-4 z-50 w-full gap-4 lg:gap-4">
      {/* Judul Dashboard */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left mod3-header-title max-w-full">
        <h1
          className="
            font-black
            text-[#F7C564]
            leading-tight
            text-[24px] sm:text-[34px] md:text-[40px] lg:text-[44px]
            drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)]
            tracking-tight
          "
          style={{ fontFamily: "var(--font-garet-heavy), 'Garet-Heavy', sans-serif" }}
        >
          Dashboard Pemantauan
        </h1>

        <div className="flex items-baseline justify-center lg:justify-start gap-1.5 sm:gap-2 mt-0 sm:-mt-1 max-w-full">
          <p
            className="
              font-black 
              text-[26px] sm:text-[42px] md:text-[50px] lg:text-[54px] 
              leading-tight
              drop-shadow-[0_4px_6px_rgba(0,0,0,0.85)]
              tracking-tight
            "
            style={{ fontFamily: "var(--font-garet-heavy), 'Garet-Heavy', sans-serif" }}
          >
            <span className="text-[#EE5C5C] italic">Banjir</span>{" "}
            <span className="text-white italic">&amp;</span>{" "}
            <span className="text-[#EE5C5C] italic">Tanah Longsor</span>
          </p>
        </div>

        {/* Underline Bar — Figma Line 1 (#FFFAFA -> #F6954F, 5px, Shadow 0 3px 3.8px 26%) */}
        <div
          className="
            w-full max-w-[280px] sm:max-w-[580px] lg:max-w-[696px]
            h-[4px] sm:h-[5px]
            rounded-full
            -mt-1 sm:-mt-2 lg:-mt-2.5
            mb-2 sm:mb-2.5
          "
          style={{
            background: "linear-gradient(90deg, #FFFAFA 0%, #F6954F 100%)",
            boxShadow: "0px 3px 3.8px rgba(0, 0, 0, 0.26)",
          }}
        />

        <p
          className="
            font-black
            text-white
            leading-none
            text-[16px] sm:text-[22px] md:text-[25px]
            drop-shadow-[0_3px_6px_rgba(0,0,0,0.85)]
            tracking-normal
          "
          style={{ fontFamily: "var(--font-garet-heavy), 'Garet-Heavy', sans-serif" }}
        >
          Aceh | Sumut | Sumbar
        </p>
      </div>

      {/* Custom Dropdowns */}
      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2.5 sm:gap-4 lg:gap-6 w-full lg:w-auto mt-2 lg:mt-6 mod3-header-filters">
        <CustomDropdown
          label="Provinsi"
          value={filterProvinsi}
          options={provinsiList}
          onChange={handleProvinsiChange}
        />
        <CustomDropdown
          label="Kota/Kab"
          value={filterKabupaten}
          options={kabupatenList}
          onChange={handleKabupatenChange}
          disabled={!filterProvinsi}
        />
        <CustomDropdown
          label="Kecamatan"
          value={filterKecamatan}
          options={kecamatanList}
          onChange={setFilterKecamatan}
          disabled={!filterKabupaten}
        />
      </div>
    </header>
  );
}