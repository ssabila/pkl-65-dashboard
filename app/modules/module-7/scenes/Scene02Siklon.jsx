import { useReveal } from "../hooks/useReveal";

export default function Scene02Siklon() {
  const [ref, inView] = useReveal(0.4);

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div
        ref={ref}
        className={`reveal ${inView ? "is-visible" : ""} bg-white/90 rounded-3xl shadow-lg p-12 max-w-3xl text-center`}
      >
        <h3 className="text-2xl italic mb-3 text-slate-700">Pemicu Awal</h3>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
          Siklon Tropis di Samudra Hindia
        </h1>
        <p className="text-lg text-slate-700 leading-relaxed">
          Aktivitas siklon tropis di sekitar Samudra Hindia pada akhir November 2025
          mendorong massa uap air dalam jumlah besar ke arah pesisir barat Sumatera,
          menjadi pemicu awal rentetan curah hujan ekstrem yang akan kita lihat
          selanjutnya.
        </p>
      </div>
    </div>
  );
}