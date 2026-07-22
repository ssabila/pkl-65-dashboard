import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function CurahHujan() {
  return (
    <div className="relative w-full h-screen">

      <div className="absolute top-5 left-5 text-red-600 font-bold text-2xl">
        Data Curah Hujan 21-30 Nov
      </div>

      <StoryCard 
        title="Intensitas Hujan"
        className="left-10 bottom-2"
      >

        <p className="text-lg leading-relaxed">
          Curah hujan tinggi melanda
          <span className="text-blue-500 font-semibold">
            {" "}Utara Sumatera{" "}
          </span>

          di akhir November 2025, dengan beberapa
          wilayah mencatat intensitas ekstrem
          hingga lebih dari
          <span className="text-blue-500 font-semibold">
            {" "}250 mm.
          </span>
          Kondisi ini meningkatkan risiko banjir, terutama di daerah dengan daya serap tanah yang sudah menurun. Hujan yang berlangsung terus-menerus menjadi salah satu pemicu utama terjadinya bencana banjir di wilayah ini.
        </p>

      </StoryCard>

      <MapSection
        jsonFiles={[
          "/data/aceh.json"
        ]}
        center={[3.6, 98]}
        zoom={7}
      />
      
    </div>
  );
}