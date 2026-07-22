import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function SurutBertahap() {
  return (
    <div className="relative w-full h-screen">

      <StoryCard 
        title="Surut Bertahap"
        className="right-25 top-15"
      >
        <h4>Fase 3 (<span className="text-blue-500 font-semibold">1-30 Desember 2025</span>)</h4>

        <p className="text-lg leading-relaxed">
          Memasuki fase ketiga, debit air perlahan mulai menyusut di ketiga provinsi. Di Aceh, genangan luas yang sebelumnya mengepung kini mereda dan menyisakan area terdampak sekitar 377 km2. Ini memberi sedikit ruang bagi masyarakat untuk mulai membersihkan pekarangan dan rumah mereka. Harapan serupa turut dirasakan warga Sumatera Utara. Seiring surutnya air di kisaran 295 km2, langkah-langkah awal untuk memulihkan kembali denyut kehidupan mulai terlihat di berbagai sudut desa. Sementara itu di Sumatera Barat, kelegaan yang lebih nyata mulai terasa ketika luas area terdampak turun drastis hingga menyentuh angka 36 km2. Kondisi ini perlahan mengizinkan roda keseharian warga kembali berputar. Fase ini bukan lagi menceritakan kepanikan menghindari air bah, melainkan tentang ketabahan dan langkah awal untuk bangkit menata kembali kehidupan yang sempat terendam.
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