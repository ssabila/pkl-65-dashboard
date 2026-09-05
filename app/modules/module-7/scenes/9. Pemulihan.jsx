import MapSection from "../components/MapSection";
import StoryCard from "../components/StoryCard";

export default function Pemulihan() {
  return (
    <div className="relative w-full h-screen">

      <StoryCard 
        title="Pemulihan"

        className="left-25 top-15"
      >
        <h4>Fase 4 (<span className="text-blue-500 font-semibold">11-20 Desember 2025</span>)</h4>

        <p className="text-lg leading-relaxed">
          Di fase keempat, Sumatera Utara dan Sumatera Barat mulai membaik — genangan Sumut menyusut ke 261 km², sementara Sumbar tinggal menyisakan 28 km². Warga di kedua provinsi ini sudah mulai membersihkan rumah dan memulihkan keseharian. Namun, Aceh belum ikut bernapas lega. Air yang sempat surut justru kembali naik ke 446 km², lebih luas dari fase sebelumnya. Hujan susulan memaksa warga Aceh Utara dan sekitarnya kembali berjibaku dengan genangan yang belum juga benar-benar pergi — dan inilah yang mendorong total luas Fase 4 sedikit lebih tinggi dari Fase 3. Fase ini menjadi pengingat bahwa pemulihan pascabencana tidak pernah seragam — satu wilayah bisa bersorak lega sementara wilayah lain masih berdiri di tepi genangan.
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