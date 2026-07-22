import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function PuncakBanjir() {
  return (
    <div className="relative w-full h-screen">

      <StoryCard 
        title="Puncak Banjir"
        className="left-25 top-15"
      >
        <h4>Fase 2 (<span className="text-blue-500 font-semibold">26-30 November 2025</span>)</h4>

        <p className="text-lg leading-relaxed">
          Pada fase 2, banjir mencapai fase krusial. Air tak lagi sekadar singgah, melainkan meluas dan mencapai titik puncaknya. Di Aceh, hamparan genangan melonjak drastis hingga menelan lebih dari 900 km2 ruang hidup warga. Banjir menjadikan wilayah seperti Aceh Utara sebagai titik terberat. Ujian yang sama memaksa masyarakat Sumatera Utara di kawasan Serdang Bedagai hingga Deli Serdang untuk saling bahu-membahu karena lebih dari 460 km2 lahan keseharian mereka kini tertutup air bah. Sementara itu, warga Sumatera Barat di sekitar Agam dan Pasaman Barat juga harus berhadapan dengan luapan tertinggi yang menyentuh angka hampir 100 km2. Ini adalah fase paling menantang bagi ketiga provinsi. Sebuah momen di mana aktivitas harian memang dipaksa berhenti oleh alam, namun ketangguhan warga untuk saling menjaga justru semakin benderang.
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