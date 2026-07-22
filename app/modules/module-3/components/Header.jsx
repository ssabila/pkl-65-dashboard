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

// Komponen dropdown kustom
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
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => !disabled && setIsOpen((v) => !v)}
                disabled={disabled}
                className="
                    flex flex-row justify-between items-center
                    px-[30px] py-[16px] gap-[10px]
                    w-[280px] h-[57px]
                    backdrop-blur-[51.5px]
                    rounded-[35px]
                    shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.4)]
                    transition-all
                "
                style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0) 100%)",
                    boxShadow: "inset 0px -2px 4px rgba(0,0,0,0.2), inset 0px 2px 4px rgba(255,255,255,0.4)",
                    backdropFilter: "blur(51.5px)",
                    border: "4px solid rgba(255,255,255,0.70)",
                }}
            >
                {/* Teks "Provinsi ..." */}
                <span
                    className="
                        flex items-center
                        font-[850]
                        text-[24px]
                        leading-[35px]
                        text-white
                        whitespace-nowrap
                        overflow-hidden
                        [-webkit-text-stroke:1px_rgba(44,44,44,0.63)]
                        [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]
                    "
                    style={{ fontFamily: "var(--font-garet-heavy)" }}
                >
                    {displayText}
                </span>

                {/* Teks "v" */}
                <span
                    className="
                        flex items-center text-center
                        font-medium
                        text-[24px]
                        leading-[31px]
                        text-[#272525]
                        [text-shadow:0_4px_4px_rgba(0,0,0,0.25)]
                    "
                    style={{ fontFamily: "var(--font-garet-heavy)" }}
                >
                    v
                </span>
            </button>

            {/* Dropdown list */}
            {isOpen && options.length > 0 && (
                <div
                    className="absolute left-0 z-50 overflow-hidden"
                    style={{
                        top: "calc(100% + 8px)",
                        background: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(20px)",
                        borderRadius: "20px",
                        boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
                        minWidth: "240px",
                    }}
                >
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className="w-full text-left px-6 py-3 transition-colors"
                            style={{
                                fontFamily: "var(--font-garet-heavy)",
                                fontSize: "18px",
                                fontWeight: 850,
                                color: value === opt ? "#222" : "#666",
                                background: value === opt ? "rgba(160,160,160,0.25)" : "transparent",
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
        ? Object.keys(DATA_WILAYAH[filterProvinsi])
        : [];
    const kecamatanList = filterProvinsi && filterKabupaten
        ? (DATA_WILAYAH[filterProvinsi][filterKabupaten] ?? [])
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
        <header className="flex flex-row items-start justify-between px-[81px] pt-[69px] pb-4 relative z-50 w-full">
            {/* Judul */}
            <div className="flex flex-col">
                <p className="
                    font-[850]
                    text-[#FACB48]
                    leading-none
                    whitespace-nowrap
                    text-[43px]
                    drop-shadow-[0_4px_4px_rgba(0,0,0,1)]
                "
                style={{fontFamily:"var(--font-garet-heavy)"}}
                >
                    Dashboard Pemantauan
                </p>
                <p className="
                    font-black 
                    italic 
                    text-[#F06E6E] 
                    text-[55px] 
                    leading-[76px]
                    whitespace-nowrap
                    drop-shadow-[0_4px_4px_rgba(0,0,0,1)]
                    -mt-[10px]
                "
                    style={{ fontFamily: "var(--font-garet-heavy)", zIndex: 2 }}>
                    Banjir <span className="text-white">&amp;</span> Tanah Longsor
                </p>
                <div
                    className="h-[5px] w-[696px] shadow-[0_3px_3.8px_rgba(0,0,0,0.26)] z-1 -mt-[15px]"
                    style={{ background: "linear-gradient(90deg, #FFFAFA 0%, #F6954F 100%)"}}>
                </div>
                <p className="
                    font-bold
                    text-[#FFFBF2]
                    leading-none
                    whitespace-nowrap
                    text-[28px]
                    drop-shadow-[0_4px_4px_rgba(0,0,0,1)]
                    mt-2
                "
                    style={{ fontFamily: "var(--font-garet-heavy)"}}>
                    Aceh | Sumut | Sumbar
                </p>
            </div>

            {/* Custom Dropdowns */}
            <div className="flex items-center gap-[55px] mt-[36px]">
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