import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Dashboard Big Data PKL 65",
  description: "Eksplorasi delapan modul analisis kebencanaan Sumatera.",
};

function ModuleIcon({ type }) {
  const paths = {
    landscape: <><path d="M3 19l6.5-8 4 4 2.5-3 5 7H3z" /><path d="M15 7h.01" /><circle cx="15" cy="7" r="2" /></>,
    risk: <><path d="M12 3l8 3v5c0 5-3.4 8.3-8 10-4.6-1.7-8-5-8-10V6l8-3z" /><path d="M12 8v4" /><path d="M12 15h.01" /></>,
    map: <><path d="M4 5l5-2 6 2 5-2v16l-5 2-6-2-5 2V5z" /><path d="M9 3v16M15 5v16" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20c.4-3.4 2.4-5 6-5s5.6 1.6 6 5" /><path d="M16 5.5a3 3 0 010 5.5M17 15c2.2.3 3.4 1.7 3.8 4" /></>,
    impact: <><path d="M4 18h16M6 15V9M12 15V5M18 15v-3" /><path d="M4 20h16" /></>,
    priority: <><path d="M4 5h16M4 12h16M4 19h16" /><circle cx="8" cy="5" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="11" cy="19" r="2" /></>,
    story: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 16V9M12 16v-5M16 16V7" /></>,
    recovery: <><path d="M4 12a8 8 0 101.8-5.1" /><path d="M4 5v5h5" /><path d="M12 8v4l3 2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function SatelliteOrbit() {
  return (
    <div className="satellite-orbit" aria-label="Ilustrasi bumi dan satelit yang sedang mengorbit">
      <div className="satellite-orbit__halo" />
      <div className="satellite-orbit__ring satellite-orbit__ring--outer" />
      <div className="satellite-orbit__ring satellite-orbit__ring--inner" />
      <Image src="/earth.png" alt="Bumi dari citra satelit" width={520} height={520} className="satellite-orbit__earth" priority />
      <div className="satellite-orbit__path">
        <div className="satellite-orbit__satellite">
          <Image src="/satelit.png" alt="Satelit penginderaan jauh" width={260} height={170} />
        </div>
      </div>
    </div>
  );
}

const modules = [
  { id: "01", route: "/modules/module-1", category: "Konteks", title: "Kondisi Fisik Wilayah", desc: "Membaca karakteristik lingkungan, tutupan lahan, curah hujan, dan medan sebelum bencana.", icon: "landscape", color: "teal", meta: "Peta fisik" },
  { id: "02", route: "/modules/module-2", category: "Risiko", title: "Skor Risiko Bencana", desc: "Membandingkan skor banjir dan longsor di Aceh, Sumatera Utara, dan Sumatera Barat.", icon: "risk", color: "blue", meta: "Dashboard interaktif" },
  { id: "03", route: "/modules/module-3", category: "Dampak Spasial", title: "Sebaran Dampak Wilayah", desc: "Menjelajahi lokasi terdampak melalui peta Sumatera dan detail banjir serta tanah longsor.", icon: "map", color: "slate", meta: "Peta Sumatera" },
  { id: "04", route: "/modules/module-4", category: "Sosial Ekonomi", title: "Kerentanan Masyarakat", desc: "Melihat hubungan kondisi sosial ekonomi dengan tingkat kerentanan wilayah terhadap bencana.", icon: "people", color: "cyan", meta: "Analisis wilayah" },
  { id: "05", route: "/modules/module-5", category: "Dampak & Logistik", title: "Dampak dan Logistik", desc: "Mengikuti skala dampak, isolasi, infrastruktur, dan kebutuhan logistik pascabencana.", icon: "impact", color: "amber", meta: "Webstory interaktif"},
  { id: "06", route: "/modules/module-6", category: "Prioritas", title: "Prioritas Penanganan", desc: "Menentukan wilayah yang perlu didahulukan menggunakan Composite Risk Score atau CRS.", icon: "priority", color: "rose", meta: "CRS dashboard" },
  { id: "07", route: "/modules/module-7", category: "Webstory", title: "Cerita Data Bencana", desc: "Menyusun temuan analisis menjadi alur cerita visual yang mudah diikuti dan dipahami.", icon: "story", color: "indigo", meta: "Storytelling" },
  { id: "08", route: "/modules/module-8", category: "Pemulihan", title: "Monitoring Pemulihan", desc: "Memantau genangan residual, risiko longsor, dan perubahan kondisi wilayah setelah bencana.", icon: "recovery", color: "teal", meta: "Monitoring spasial"},
];

const colorStyles = {
  teal: { strip: "bg-teal-500", badge: "bg-teal-50 text-teal-700 border-teal-200/70", hover: "group-hover:text-slate-900", shadow: "hover:shadow-[0_16px_36px_rgba(13,148,136,0.12)]" },
  blue: { strip: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200/70", hover: "group-hover:text-slate-900", shadow: "hover:shadow-[0_16px_36px_rgba(37,99,235,0.12)]" },
  slate: { strip: "bg-slate-700", badge: "bg-slate-100 text-slate-700 border-slate-300/70", hover: "group-hover:text-slate-900", shadow: "hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]" },
  cyan: { strip: "bg-cyan-500", badge: "bg-cyan-50 text-cyan-700 border-cyan-200/70", hover: "group-hover:text-slate-900", shadow: "hover:shadow-[0_16px_36px_rgba(6,182,212,0.12)]" },
  amber: { strip: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200/70", hover: "group-hover:text-slate-900", shadow: "hover:shadow-[0_16px_36px_rgba(245,158,11,0.12)]" },
  rose: { strip: "bg-gradient-to-r from-teal-500 to-rose-500", badge: "bg-teal-50 text-teal-700 border-teal-200/70", hover: "group-hover:text-slate-900", shadow: "shadow-[0_12px_36px_rgba(20,184,166,0.16)]" },
  indigo: { strip: "bg-indigo-300", badge: "bg-slate-100 text-slate-500 border-slate-200", hover: "group-hover:text-slate-900", shadow: "" },
};

function ModuleCard({ module }) {
  const style = colorStyles[module.color];
  return (
    <article className="group relative flex min-h-[390px] flex-col justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/45 p-6 shadow-[0_12px_35px_rgba(26,35,50,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/60">
      <div className={`absolute left-0 right-0 top-0 h-1 ${style.strip}`} />
      <div>
        <div className="mb-5 flex items-center justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-xl border text-base font-extrabold ${style.badge}`}>{module.id}</span><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${style.badge}`}>{module.category}</span></div>
        <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100/80 text-slate-700 ${style.hover}`}><ModuleIcon type={module.icon} /></div>
        <h3 className={`mb-2 text-lg font-bold text-slate-900 transition-colors ${style.hover}`}>{module.title}</h3>
        <p className="text-xs leading-relaxed text-slate-600">{module.desc}</p>
        <p className="mt-5 text-xs font-semibold text-slate-500">{module.meta}</p>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-4">
        <div className="mb-3 flex items-center justify-between text-xs"></div>
        <Link href={module.route} className="flex w-full items-center justify-center rounded-xl border border-[#1a2332] bg-[#1a2332] px-4 py-2.5 text-xs font-bold !text-[#d8dfe8] transition-colors hover:border-[#5b8fbf] hover:bg-[#5b8fbf] hover:!text-[#ffffff]">Buka Modul</Link>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="landing-page min-h-screen bg-[#FAFAFA] font-sans text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"><div className="absolute -left-20 -top-32 h-[560px] w-[560px] rounded-full bg-teal-200/35 blur-[130px]" /><div className="absolute -right-24 top-1/4 h-[620px] w-[620px] rounded-full bg-sky-200/35 blur-[150px]" /><div className="absolute -bottom-20 right-1/4 h-[500px] w-[500px] rounded-full bg-amber-100/40 blur-[130px]" /></div>
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-8"><div className="mx-auto max-w-7xl"><div className="flex min-h-16 items-center justify-center rounded-full border border-white/60 bg-white/35 px-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] backdrop-blur-2xl sm:px-6">
        <Link href="/" className="flex min-w-0 items-center justify-center gap-3"><Image src="/logo-pkl-65-new.png" alt="Logo PKL 65" width={48} height={48} className="h-10 w-10 object-contain sm:h-11 sm:w-11" priority /><div className="flex min-w-0 flex-col"><span className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">Dashboard PKL 65</span><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-[11px]">Big Data Kebencanaan</span></div></Link>
      </div></div></header>
      <main className="landing-main w-full pb-20 pt-0"><div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8">
        <section id="hero" className="hero-satellite mx-auto grid max-w-7xl items-center gap-8 px-0 py-8 sm:gap-12 sm:py-10 lg:grid-cols-[minmax(420px,1fr)_minmax(0,1fr)] lg:gap-10 lg:py-12"><SatelliteOrbit /><div className="relative z-10 text-center lg:text-left"><h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[54px]">Eksplorasi data bencana<span className="mt-1 block bg-gradient-to-r from-teal-600 via-sky-600 to-amber-600 bg-clip-text text-transparent">Sumatera dalam 8 modul</span></h1><p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">Dari kondisi fisik wilayah hingga monitoring pemulihan, jelajahi rangkaian analisis kebencanaan Aceh, Sumatera Utara, dan Sumatera Barat.</p><dl className="mt-10 flex flex-wrap justify-center gap-x-12 gap-y-4 text-left lg:justify-start"><div><dt className="text-sm text-slate-400">Modul analisis</dt><dd className="text-2xl font-extrabold text-slate-900">8</dd></div><div><dt className="text-sm text-slate-400">Provinsi utama</dt><dd className="text-2xl font-extrabold text-slate-900">3</dd></div><div><dt className="text-sm text-slate-400">Fokus analisis</dt><dd className="text-2xl font-extrabold text-slate-900">Bencana</dd></div></dl></div></section>
        <section id="modul-grid" className="scroll-mt-24 pt-4"><div className="mb-8 flex flex-col justify-between gap-4 border-b border-slate-200/70 pb-4 sm:flex-row sm:items-end"><div><span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">Navigasi langsung</span><h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Daftar Modul Analisis</h2></div><p className="text-xs font-semibold text-slate-500 sm:text-sm">8 modul, satu alur analisis kebencanaan</p></div><div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">{modules.map(module => <ModuleCard key={module.id} module={module} />)}</div></section>
      </div></main>
      <footer className="border-t border-slate-200/70 bg-white/70 py-8 text-center text-xs font-semibold text-slate-500 backdrop-blur-xl">PKL 65, All Rights Reserved</footer>
    </div>
  );
}
