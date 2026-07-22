import { Lora } from "next/font/google";

const loraNormal = Lora({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal"]
});


const STATS = {
    totalLuasBanjir: 100000,
    jumlahKotaTerdampak: 10,
    jumlahKecamatanTerdampak: 10,
    totalLuasLongsor: 100000,
};

function formatAngka(num) {
    return num.toLocaleString("id-ID");
}

// Style glass card sesuai Figma
const cardStyle = {
    background: "rgba(255,255,255,0.5)",
    boxShadow: "inset 0px -2px 4px rgba(0,0,0,0.2), inset 0px 2px 4px rgba(255,255,255,0.4)",
    backdropFilter: "blur(51.5px)",
    border: "4px solid rgba(255, 255, 255, 0.3)"
};

// Style angka gradient sesuai Figma
const gradientNumberStyle = {
    fontFamily: "var(--font-garet-heavy)",
    background: "linear-gradient(90deg, #F3BB99 0%, #F43E3E 54.33%, #E50707 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
};

// Style teks judul card
const cardTitleStyle = {
    fontFamily: "var(--font-garet-heavy)",
    textShadow: "0px 4px 4px rgba(0,0,0,0.25)",
    color: "#FFFFFF",
};

// Style teks subtitle
const subtitleStyle = {
    fontFamily: "var(--font-garet-heavy)",
    color: "#FFF4F4",
};

export default function BerandaView() {
    return (
        <div className="relative w-[620px] h-[580px]">

            {/* Card 1: TOTAL LUAS AREA BANJIR */}
            <div className="absolute top-[0px] left-[0px] rounded-[34px] p-5 flex flex-col items-center gap-2 rotate-[0.68deg] w-[308px] h-[260px]"
                style={{ ...cardStyle, background: "#FFFFFF80", backdropFilter: "blur(103px)", boxShadow: "inset 0px 2px 4px 0px #FFFFFF66, inset 0px -2px 4px 0px #00000033"
 }}>
                <p className="text-[23px] [-webkit-text-stroke:1px_rgba(44,44,44,0.63)] font-black uppercase text-center leading-tight" style={cardTitleStyle}>
                    TOTAL LUAS AREA<br />BANJIR
                </p>
                <div className="w-full h-[2px] my-1" style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #E0C9C9 100%)" }}></div>
                <div className="flex items-baseline gap-5">
                    <span className="text-[41px] font-black drop-shadow-[0_4px_4px_rgba(0,0,0,1)]" style={gradientNumberStyle}>
                        {formatAngka(STATS.totalLuasBanjir)}
                    </span>
                    <span className="text-[36px] font-bold text-[#FFFFFF] [-webkit-text-stroke:1px_#000000]"
                        style={{ fontFamily: "var(--font-lora)", opacity: 0.76 }}>
                        Ha
                    </span>
                </div>
                <p className="text-[19px] font-[850] text-center" style={subtitleStyle}>
                    15% dari total wilayah
                </p>
            </div>

            {/* Card 2: Jumlah Kota Terdampak */}
            <div className="absolute top-[60px] left-[338px] rounded-[21px] p-5 flex flex-col items-center gap-2 rotate-[0.68deg] w-[261.42px] h-[205px]"
                style={{ ...cardStyle, background: "#FFFFFF5C", backdropFilter: "blur(103px)", boxShadow: "inset 0px 2px 4px 0px #FFFFFF66, 0px -2px 4px 0px #00000033" }}>
                <p className="text-[23px] font-[850] text-center leading-tight [-webkit-text-stroke:1px_rgba(44,44,44,0.63)]" style={cardTitleStyle}>
                    Jumlah Kota<br />Terdampak
                </p>
                <span className="text-[41px] font-[850] drop-shadow-[0_4px_4px_rgba(0,0,0,1)]" style={gradientNumberStyle}>
                    {STATS.jumlahKotaTerdampak}
                </span>
                <p className="text-[19px] font-[850] text-center" style={subtitleStyle}>
                    dari 30 kab/kota
                </p>
            </div>

            {/* Card 3: Jumlah Kecamatan Terdampak */}
            <div className="absolute top-[288px] left-[20px] rounded-[27px] p-5 flex flex-col items-center gap-2 rotate-[0.68deg]"
                style={{ ...cardStyle, background: "#FFFFFF54", backdropFilter: "blur(103px)", boxShadow: "inset 0px 2px 4px 0px #FFFFFF66, 0px -2px 4px 0px #00000033" }}>
                <p className="text-[23px] font-[850] text-center leading-tight [-webkit-text-stroke:1px_rgba(44,44,44,0.63)]" style={cardTitleStyle}>
                    Jumlah Kecamatan<br />Terdampak
                </p>
                <span className="text-[41px] font-[850] drop-shadow-[0_4px_4px_rgba(0,0,0,1)]" style={gradientNumberStyle}>
                    {STATS.jumlahKecamatanTerdampak}
                </span>
                <p className="text-[19px] font-[850] text-center" style={subtitleStyle}>
                    dari 30 kecamatan
                </p>
            </div>

            {/* Card 4: TOTAL LUAS AREA LONGSOR */}
            <div className="absolute top-[288px] left-[338px] rounded-[34px] p-5 flex flex-col items-center gap-2 rotate-[0.68deg]  w-[308px] h-[260px]"
                style={cardStyle}>
                <p className="text-[23px] font-[850] uppercase text-center leading-tight [-webkit-text-stroke:1px_rgba(44,44,44,0.63)]" style={cardTitleStyle}>
                    TOTAL LUAS AREA<br />LONGSOR
                </p>
                <div className="w-full h-[2px] my-1" style={{ background: "linear-gradient(90deg, #FFFFFF 0%, #E0C9C9 100%)" }}></div>
                <div className="flex items-baseline gap-5">
                    <span className="text-[41px] font-[850] drop-shadow-[0_4px_4px_rgba(0,0,0,1)]" style={gradientNumberStyle}>
                        {formatAngka(STATS.totalLuasLongsor)}
                    </span>
                    <span className="text-[36px] font-bold   [-webkit-text-stroke:1px_#000000]"
                        style={{ fontFamily: "var(--font-lora)", color: "#FFFFFF", opacity: 0.76 }}>
                        Ha
                    </span>
                </div>
                <p className="text-[19px] font-[850] text-center" style={subtitleStyle}>
                    15% dari total wilayah
                </p>
            </div>

        </div>
    );
}
