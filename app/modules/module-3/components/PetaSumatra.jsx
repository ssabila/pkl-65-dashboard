import Image from "next/image";

const PROVINSI_CONFIG = {
    "Aceh": {
        src: "/module-3/aceh.webp",
        style: { top: "0%", left: "10%", width: "38%", opacity: 1 },
    },
    "Sumatera Utara": {
        src: "/module-3/sumut.webp",
        style: { top: "28%", left: "30%", width: "42%", opacity: 1 },
    },
    "Sumatera Barat": {
        src: "/module-3/sumbar.webp",
        style: { top: "52%", left: "42%", width: "38%", opacity: 1 },
    },
};

const JUDUL_PETA = {
    beranda: "Peta Wilayah Bencana Sumatra",
    banjir: "Peta Banjir Sumatra",
    longsor: "Peta Tanah Longsor Sumatra",
};

export default function PetaSumatra({ activeMenu, provinsi }) {
    return (
        <div className="flex flex-col items-center gap-3 w-full" style={{ maxWidth: "680px" }}>

            {/* Label glass pill — sesuai referensi */}
            <div
                className="ml-[100px]"
                style={{
                    borderRadius: "71px",
                    padding: "6px 50px",
                    background: "linear-gradient(180deg, rgba(255,255,255,0.33) 0%, rgba(255,255,255,0) 100%)",
                    boxShadow: "inset 0px -2px 4px rgba(0,0,0,0.2), inset 0px 2px 4px rgba(255,255,255,0.4)",
                    backdropFilter: "blur(51.5px)",
                    border: "4px solid rgba(255,255,255,0.70)",
                }}>
                <span
                    className="font-black text-white text-lg [text-shadow:0_4px_4px_#000000] text-[31px]"
                    style={{
                        fontFamily: "var(--font-garet-heavy)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {JUDUL_PETA[activeMenu] ?? "Peta Wilayah Bencana Sumatra"}
                </span>
            </div>

            {/* Container peta — lebih besar */}
            <div
                className="absolute top-[325px] right-[-32px] rounded-[34px] overflow-hidden border border-white/30"
                style={{
                    width: "989px",
                    height: "530px",
                    background: "#FFFFFF80",
                    boxShadow: "inset 0px -2px 4px rgba(0,0,0,0.2), inset 0px 2px 4px rgba(255,255,255,0.4)",
                    backdropFilter: "blur(51.5px)",
                    border: "4px solid rgba(255,255,255,0.70)",
                }}
            >
                {Object.entries(PROVINSI_CONFIG).map(([nama, config]) => {
                    const isSelected = provinsi === nama;
                    const isAnySelected = provinsi !== "";
                    const opacity = isAnySelected && !isSelected ? 0.3 : 1;

                    return (
                        <div
                            key={nama}
                            className="absolute transition-all duration-500"
                            style={{
                                ...config.style,
                                opacity,
                                filter: isSelected ? "drop-shadow(0 0 12px rgba(255,255,255,0.5))" : "none",
                            }}
                        >
                            <Image
                                src={config.src}
                                alt={`Peta ${nama}`}
                                fill={false}
                                width={200}
                                height={200}
                                className="w-full h-auto object-contain"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}