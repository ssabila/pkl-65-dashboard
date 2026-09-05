import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function KronologiBencana2() {
  return (
    <div className="relative w-full h-screen">

      <StoryCard 
        title="Kronologi Bencana"
        className="right-25 top-15"
      >

        <p className="text-lg leading-relaxed">
          Terlihat bahwa pada tanggal <span className="text-blue-500 font-semibold">30 November 2025</span> kondisi semakin memburuk. Terdapat <span className="text-blue-500 font-semibold">485</span> kecamatan yang terendam banjir. <span className="text-blue-500 font-semibold">Dua</span> kecamatan diantaranya disertai gempa bumi dan <span className="text-blue-500 font-semibold">17</span> <span className="text-red-500 font-semibold">kecamatan terkena longsor</span>.
        </p>

      </StoryCard>

      <MapSection
        jsonFiles={[
          "/data/aceh.json"
        ]}
        center={[3.8, 97]}
        zoom={8}
      />
      
    </div>
  );
}