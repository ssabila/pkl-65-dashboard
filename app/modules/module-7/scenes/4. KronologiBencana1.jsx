import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function KronologiBencana1() {
  return (
    <div className="relative w-full h-screen">

      <StoryCard 
        title="Kronologi Bencana"
        className="left-10 top-40"
      >

        <p className="text-lg leading-relaxed">
          Pengungsian masif di Tapanuli Tengah; Bireuen, Tanah Datar, dan Agam ikut terendam Banjir meluas ke Bireuen (Aceh), Tanah Datar, dan Agam (Sumatera Barat), serta Tapanuli Tengah (Sumatera Utara). Hari ini mencatat lebih dari 9.000 warga luka-luka — angka tertinggi dalam periode bencana ini
        </p>

      </StoryCard>

      <MapSection
        jsonFiles={[
          "/data/aceh.json"
        ]}
        center={[4.6, 97]}
        zoom={8}
      />
      
    </div>
  );
}