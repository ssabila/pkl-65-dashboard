import ScrollHint from "../components/ScrollHint";

export default function Scene01Pembuka() {
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-50 overflow-hidden">
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,#e2e8f0,transparent_40%),radial-gradient(circle_at_80%_70%,#e2e8f0,transparent_40%)]" />

      <div className="relative z-10 max-w-4xl text-center px-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="bg-white rounded-full px-5 py-2 shadow border text-sm font-semibold text-slate-700">
            Badan Pusat Statistik
          </span>
          <span className="bg-white rounded-full px-5 py-2 shadow border text-sm font-semibold text-slate-700">
            Politeknik Statistika STIS
          </span>
        </div>

        <h3 className="text-2xl italic mb-3 text-slate-700">Analisis Spasial Bencana</h3>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
          Menelusuri Jejak Bencana
        </h1>
        <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
          Pesisir Sumatera memiliki kerentanan ganda. Mari kita lihat data satelit
          terkait pemicu awalnya sebelum melihat dampaknya di wilayah administratif.
        </p>
      </div>

      <ScrollHint />
    </div>
  );
}