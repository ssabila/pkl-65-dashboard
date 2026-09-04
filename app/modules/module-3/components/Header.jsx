"use client";
import { useState, useRef, useEffect } from "react";
import DATA_WILAYAH from "../dataWilayah.json";

// Helper for finding parent province of a kabupaten
function findProvinceForKab(kabName) {
  for (const [prov, kabs] of Object.entries(DATA_WILAYAH)) {
    if (kabs[kabName]) return prov;
  }
  return "";
}

// Helper for finding parent kab & prov of a kecamatan
function findLocationForKec(kecName) {
  for (const [prov, kabs] of Object.entries(DATA_WILAYAH)) {
    for (const [kab, kecs] of Object.entries(kabs)) {
      if (kecs.includes(kecName)) return { prov, kab };
    }
  }
  return { prov: "", kab: "" };
}

// Komponen dropdown kustom glassmorphism dengan fitur pencarian & scrollbar
function CustomDropdown({ label, value, options, onChange, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const displayText = value ? value : `${label} ...`;

  return (
    <div ref={ref} className="relative mod3-dropdown-wrapper">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen((v) => !v);
            setSearch("");
          }
        }}
        disabled={disabled}
        className="
          mod3-dropdown-trigger
          flex flex-row justify-between items-center
          px-5 py-2.5 sm:px-7 sm:py-3.5
          w-full sm:w-[220px] md:w-[250px] lg:w-[270px]
          rounded-[35px]
          border-[3.5px] sm:border-[4px] lg:border-[5px]
          border-[rgba(255,255,255,0.45)]
          transition-all duration-200
          hover:opacity-95 active:scale-98
        "
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.12) 100%)",
          boxShadow: "inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.12)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
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
      {isOpen && (
        <div
          className="absolute left-0 z-[100] mod3-dropdown-list flex flex-col rounded-[20px] overflow-hidden border border-white/40"
          style={{
            top: "calc(100% + 8px)",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
            boxShadow: "0px 12px 32px rgba(0,0,0,0.3)",
            width: "100%",
            minWidth: "250px",
            maxHeight: "340px",
          }}
        >
          {/* Input pencarian cepat jika opsi > 5 */}
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-200/80 bg-white/70">
              <input
                type="text"
                placeholder={`Cari ${label}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-1.5 rounded-xl border border-gray-300 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{ fontFamily: "sans-serif" }}
              />
            </div>
          )}

          {/* Tombol Clear / Reset */}
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="w-full text-left px-5 py-2.5 text-red-600 hover:bg-red-50 font-bold transition-colors text-xs border-b border-gray-100 uppercase tracking-wider flex items-center justify-between"
              style={{ fontFamily: "var(--font-garet-heavy), sans-serif" }}
            >
              <span>✕ Reset Filter {label}</span>
            </button>
          )}

          {/* Container Scrollable Opsi */}
          <div className="overflow-y-auto max-h-[260px] custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const nextVal = value === opt ? "" : opt;
                    onChange(nextVal);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-5 py-2.5 transition-colors hover:bg-amber-100/60"
                  style={{
                    fontFamily: "var(--font-garet-heavy), sans-serif",
                    fontSize: "15px",
                    fontWeight: 850,
                    color: value === opt ? "#B71C1C" : "#333333",
                    background: value === opt ? "rgba(227,52,52,0.12)" : "transparent",
                  }}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="px-5 py-4 text-xs text-gray-400 italic text-center">
                Tidak ada data {label.toLowerCase()}
              </div>
            )}
          </div>
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

  // Jika provinsi terpilih -> tampilkan kab/kota di provinsi tersebut
  // Jika tidak -> tampilkan seluruh 75 kab/kota dari semua provinsi
  const kabupatenList = filterProvinsi
    ? Object.keys(DATA_WILAYAH[filterProvinsi] ?? {})
    : Object.values(DATA_WILAYAH).flatMap((kabs) => Object.keys(kabs));

  // Jika kabupaten terpilih -> tampilkan kecamatan kabupaten tersebut
  // Jika provinsi terpilih -> tampilkan semua kecamatan di provinsi tersebut
  // Jika tidak -> tampilkan semua kecamatan
  let kecamatanList = [];
  if (filterProvinsi && filterKabupaten) {
    kecamatanList = DATA_WILAYAH[filterProvinsi]?.[filterKabupaten] ?? [];
  } else if (filterProvinsi) {
    const kabs = DATA_WILAYAH[filterProvinsi] ?? {};
    kecamatanList = Object.values(kabs).flat();
  } else if (filterKabupaten) {
    const parentProv = findProvinceForKab(filterKabupaten);
    if (parentProv) {
      kecamatanList = DATA_WILAYAH[parentProv]?.[filterKabupaten] ?? [];
    }
  } else {
    kecamatanList = Object.values(DATA_WILAYAH)
      .flatMap((kabs) => Object.values(kabs))
      .flat();
  }

  // Handler Perubahan Provinsi
  const handleProvinsiChange = (val) => {
    const nextProv = filterProvinsi === val ? "" : val;
    setFilterProvinsi(nextProv);
    setFilterKabupaten("");
    setFilterKecamatan("");
  };

  // Handler Perubahan Kabupaten/Kota
  const handleKabupatenChange = (val) => {
    if (!val) {
      setFilterKabupaten("");
      setFilterKecamatan("");
      return;
    }
    const nextKab = filterKabupaten === val ? "" : val;
    setFilterKabupaten(nextKab);
    setFilterKecamatan("");

    // Otomatis set parent province jika belum terpilih
    if (nextKab) {
      const parentProv = findProvinceForKab(nextKab);
      if (parentProv && filterProvinsi !== parentProv) {
        setFilterProvinsi(parentProv);
      }
    }
  };

  // Handler Perubahan Kecamatan
  const handleKecamatanChange = (val) => {
    if (!val) {
      setFilterKecamatan("");
      return;
    }
    const nextKec = filterKecamatan === val ? "" : val;
    setFilterKecamatan(nextKec);

    // Otomatis set parent kabupaten & prov jika belum terpilih
    if (nextKec) {
      const { prov, kab } = findLocationForKec(nextKec);
      if (prov) setFilterProvinsi(prov);
      if (kab) setFilterKabupaten(kab);
    }
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

        {/* Underline Bar */}
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
      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2.5 sm:gap-4 lg:gap-6 w-full lg:w-auto mt-2 lg:mt-6 mod3-header-filters pointer-events-auto">
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
        />
        <CustomDropdown
          label="Kecamatan"
          value={filterKecamatan}
          options={kecamatanList}
          onChange={handleKecamatanChange}
        />
      </div>
    </header>
  );
}