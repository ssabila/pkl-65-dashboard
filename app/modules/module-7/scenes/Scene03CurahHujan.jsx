import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";
import SectionLabel from "../components/SectionLabel";
import Legend from "../components/Legend";

const RAIN_LEGEND = [
  { color: "#3b0a02", label: ">250 mm" },
  { color: "#a4381a", label: "200–250 mm" },
  { color: "#f2810b", label: "150–200 mm" },
  { color: "#fbc02d", label: "100–150 mm" },
  { color: "#fff176", label: "75–100 mm" },
];

export default function Scene03CurahHujan() {
  return (
    <div className="relative w-full h-full">
      <SectionLabel>Data Curah Hujan 21–30 Nov</SectionLabel>

      <MapSection
        geojsonFiles={["/map/aceh.json"]}
        center={[3.6, 98]}
        zoom={7}
        dotOverlay
      />

      <StoryCard title="Intensitas Hujan" className="left-8 bottom-8">
        <p className="text-base leading-relaxed text-slate-700">
          Curah hujan tinggi melanda{" "}
          <span className="text-blue-500 font-semibold">Utara Sumatera</span> di
          akhir November 2025, dengan beberapa wilayah mencatat intensitas ekstrem
          hingga lebih dari{" "}
          <span className="text-blue-500 font-semibold">250 mm</span>. Kondisi ini
          meningkatkan risiko banjir, terutama di daerah dengan daya serap tanah
          yang sudah menurun. Hujan yang berlangsung terus-menerus menjadi salah
          satu pemicu utama terjadinya bencana banjir di wilayah ini.
        </p>
      </StoryCard>

      <Legend items={RAIN_LEGEND} className="right-8 bottom-8" />
    </div>
  );
}