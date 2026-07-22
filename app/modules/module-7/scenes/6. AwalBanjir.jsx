import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function AwalBanjir() {
  return (
    <div className="relative w-full h-screen">

      <StoryCard 
        title="Awal Banjir"
        className="right-25 top-15"
      >
        <h4>Fase 1 (<span className="text-blue-500 font-semibold">20-25 November 2025</span>)</h4>

        <p className="text-lg leading-relaxed">
          Pada fase awal, beberapa daerah Utara Sumatera sudah mulai terkena dampak dari peningkatan curah hujan.  Di fase ini, air mulai merayap naik dan mengubah wajah ratusan hektar ruang kehidupan dan mata pencaharian menjadi genangan. Di ujung pulau, warga Aceh Utara dan Pidie harus menatap nanar ketika daerah mereka mendadak terendam oleh air yang menyapu lebih dari 288 km2. Kecemasan serupa turut menyelimuti saudara-saudara kita di Sumatera Utara. Saat air bah menelan lebih dari 191 km2, warga di Labuhan Batu hingga Deli Serdang terpaksa untuk bergegas menyelamatkan keluarga serta sisa harapan di tengah genangan yang terus meninggi. Sementara itu, di Sumatera Barat, raut kekhawatiran mulai tergambar jelas di wajah warga Pesisir Selatan saat air mulai memasuki batas-batas rumah mereka. Ini adalah fase pertama, sebuah titik awal dengan lebih dari 500 km2 tanah Sumatera terhenti sejenak detak kehidupannya dan hanya menyisakan ketegaran dan doa para warga yang berjuang bertahan di kepungan air.
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