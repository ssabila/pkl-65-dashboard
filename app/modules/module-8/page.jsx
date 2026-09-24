'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400 font-medium">
      Memuat Peta Spasial...
    </div>
  ),
});

export default function Module8Page() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [mapMode, setMapMode] = useState(0); 
  const [landslideMode, setLandslideMode] = useState(0);
  const containerRef = useRef(null);

  const mapLayers = [
    { id: 0, label: 'Peta Genangan Residual' },
    { id: 1, label: 'Peta Genangan Puncak Banjir' },
    { id: 2, label: 'Peta Genangan Surut' },
    { id: 3, label: 'Peta Surutnya Genangan (%)' }
  ];

  const landslideLayers = [
    { id: 0, label: 'Peta Risiko Longsor | Nov - Des 2025' },
    { id: 1, label: 'Peta Risiko Longsor | April 2026' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      const slideIndex = Math.round(scrollTop / clientHeight) + 1;
      setActiveSlide(slideIndex);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    let autoSlideTimer;
    if (activeSlide === 3) {
      autoSlideTimer = setInterval(() => {
        setMapMode((prevMode) => (prevMode + 1) % mapLayers.length);
      }, 5000); 
    }
    return () => {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
    };
  }, [activeSlide]);

  useEffect(() => {
    let landslideTimer;
    if (activeSlide === 6) {
      landslideTimer = setInterval(() => {
        setLandslideMode((prev) => (prev === 0 ? 1 : 0));
      }, 5000);
    }
    return () => {
      if (landslideTimer) clearInterval(landslideTimer);
    };
  }, [activeSlide]);

  const scrollToSlide = (slideIndex) => {
    if (!containerRef.current) return;
    const clientHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({
      top: (slideIndex - 1) * clientHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div 
      className="h-screen w-screen text-[#1a2332] relative overflow-hidden font-sans select-none"
      style={{
        backgroundColor: '#edf3f9',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, #b5d1ed 0%, transparent 45%), 
          radial-gradient(circle at 90% 10%, #ffe0a3 0%, transparent 45%), 
          radial-gradient(circle at 50% 50%, #f4f8fc 0%, #edf3f9 100%)
        `
      }}
    >
      
      <header className="fixed top-0 left-0 right-0 w-full max-w-7xl mx-auto px-6 py-5 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300 shadow-sm pointer-events-auto">
          <span className="w-2 h-2 bg-[#168573] rounded-full animate-pulse" />
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-700 font-mod8-body">
            Modul 8 | Monitoring Pemulihan
          </span>
        </div>
        
        <div className="flex items-center gap-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-300 shadow-sm text-xs font-mod8-body pointer-events-auto text-slate-700">
          <button 
            onClick={() => scrollToSlide(activeSlide - 1)}
            disabled={activeSlide === 1}
            className={`transition font-bold ${activeSlide === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#f47b2f]'}`}
          >
            &larr;
          </button>
          <span className="font-semibold tracking-widest">{activeSlide} / 17</span>
          <button 
            onClick={() => scrollToSlide(activeSlide + 1)}
            disabled={activeSlide === 17}
            className={`transition font-bold ${activeSlide === 17 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#f47b2f]'}`}
          >
            &rarr;
          </button>
        </div>
      </header>

      <div ref={containerRef} className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        
        {/* SLIDE 1 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center items-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Kondisi Sumatera Terkini</span>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">5 Bulan</span> Setelah Bencana Hidrologi: Seberapa Pulih Sumatera Kini?
              </h1>
              <p className="text-slate-600 text-base leading-relaxed italic pr-4 font-mod8-sub border-l-2 border-[#168573] pl-4">
                "Dari akses jalan yang pernah terputus, genangan yang masih tertinggal, hingga hijaunya vegetasi yang pelan-pelan kembali."
              </p>
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-base font-bold text-[#f47b2f]">5 Bulan</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Fase pemulihan dari Januari hingga Mei 2026.</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-base font-bold text-slate-700">75 Kab/Kota</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Di Provinsi Aceh, Sumatera Utara, dan Sumatera Barat.</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-base font-bold text-[#168573]">90% Pulih</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Beberapa wilayah masih memerlukan perhatian.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden shadow-md">
              <MapComponent currentMode={0} />
            </div>
          </div>
        </section>

        {/* SLIDE 2 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-24 pb-12 px-8 relative">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Konteks Bencana</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading">Pemulihan Tidak Sesederhana Angka.</h2>
              <p className="text-slate-600 text-sm max-w-5xl leading-relaxed font-mod8-sub italic">
                Pemulihan terlihat dari air yang pergi, tanah yang mengering, jalan yang terbuka, rumah yang kembali dihuni, lampu yang menyala, dan alam yang kembali hijau.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
              {[
                { t: "Nov 2025", p: "Serangkaian bencana hidrometeorologi berupa banjir bandang menerjang wilayah utara Sumatera." },
                { t: "Des 2025", p: "Pemerintah menetapkan Status Tanggap Darurat setelah banjir memutus akses jalan and listrik." },
                { t: "Jan 2026", p: "Ratusan ribu korban masih bertahan di tenda darurat. Korban meninggal mencapai 1.199 jiwa." },
                { t: "Feb 2026", p: "Wilayah mulai berangsur pulih seiring percepatan rehabilitasi infrastruktur dan fasilitas umum." },
                { t: "Saat Ini", p: "Fokus pemulihan kini diarahkan pada pembangunan permanen dan pemulihan ekonomi masyarakat.", highlight: true }
              ].map((item, i) => (
                <div key={i} className={`bg-gradient-to-br from-white to-slate-50 border ${item.highlight ? 'border-2 border-[#168573]' : 'border-slate-300'} p-5 rounded-2xl flex flex-col gap-2 font-mod8-body shadow-sm`}>
                  <span className={`text-xs font-bold ${item.highlight ? 'text-[#168573]' : 'text-[#f47b2f]'} tracking-wider`}>{item.t}</span>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-light">{item.p}</p>
                </div>
              ))}
            </div>

            <p className="text-xs font-medium text-slate-700 font-mod8-body pt-2 border-t border-slate-300">
              Indikator Monitoring Pemulihan yang digunakan:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mod8-body">
              {[
                { n: 1, t: "Pemulihan Vegetasi", c: "#168573", d: "Stabilnya tanah & berkurangnya longsor." },
                { n: 2, t: "Cahaya Malam", c: "#1a2332", d: "Tanda pulihnya listrik & aktivitas." },
                { n: 3, t: "Genangan Residual", c: "#5b8fbf", d: "Cakupan luapan air yang sudah surut." },
                { n: 4, t: "Pemulihan Jalan", c: "#f47b2f", d: "Akses konektivitas transportasi warga." },
                { n: 5, t: "Kondisi Bangunan", c: "#d72e38", d: "Rekonstruksi fisik fasilitas publik." },
                { n: 6, t: "Kelembaban Tanah", c: "#168573", d: "Tingkat kepadatan tanah pascabanjir." }
              ].map((ind, i) => (
                <div key={i} className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white uppercase px-2.5 py-0.5 rounded-full w-fit" style={{ backgroundColor: ind.c }}>Indikator {ind.n}</span>
                  <strong className="text-xs text-slate-800 font-bold tracking-tight">{ind.t}</strong>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-light">{ind.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 3 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Indikator 3</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                Air Surut <br />Tetapi Genangan Residual Masih Tertinggal.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body pr-4 text-justify">
                Citra Sentinel-1 menunjukkan wilayah yang masih menyimpan genangan hingga Mei 2026. Semakin besar area berwarna mencolok, semakin lambat pemulihan infrastruktur wilayah berlangsung.
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={mapMode} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {mapLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setMapMode(layer.id)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${mapMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Statistik Genangan</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-tight">
                <span className="text-[#f47b2f]">68,47%</span> <br />Rata-rata Genangan Residual.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body">
                Dari total 15.094 hektare genangan saat puncak banjir, sekitar 10.335 hektare masih terdeteksi sebagai genangan residual hingga Mei 2026.
              </p>
            </div>

            <div className="lg:col-span-7 w-full bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 space-y-6 flex flex-col shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                {[["15.094 ha", "Luas Puncak"], ["10.335 ha", "Luas Residual"], ["90%", "Terdampak"]].map(([v, l], i) => (
                  <div key={i} className="bg-white border border-slate-300 p-4 rounded-2xl text-center shadow-xs">
                    <span className="text-xl font-bold text-slate-800 block">{v}</span>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4 font-mod8-body text-xs">
                {[["Sumatera Barat", 74, "Kritis", "#D72E38"], ["Aceh", 58, "Parah", "#F47B2F"], ["Sumatera Utara", 43, "Sedang", "#FFD47D"]].map(([p, w, s, c], i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700"><span>{p}</span><span style={{ color: c }}>{w}% — {s}</span></div>
                    <div className="w-full h-3 bg-slate-200 border border-slate-300 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${w}%`, backgroundColor: c }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#fdfcf7] border border-orange-200 p-4 rounded-2xl font-mod8-body">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f47b2f] block mb-1">Metodologi Radar Sentinel-1</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-light text-justify">Analisis menggunakan threshold -15 dB pada Google Earth Engine untuk identifikasi genangan yang stabil dan realistis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 5 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Kelembaban Tanah - Indikator 6</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Tanah Pulih?</span> <br />Zona Tanah Jenuh Menyusut Signifikan.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body pr-4 text-justify">
                Indikator 3 membaca air yang terlihat di permukaan. Sedangkan Indikator 6 membaca air yang tertahan di dalam tanah setelah banjir.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  ["Aceh", "Zona jenuh sangat menyusut di Aceh bagian Timur. Namun, masih tersisa area kritis di bagian Tengah dan Utara."],
                  ["Sumatera Utara", "Zona jenuh hampir hilang sepenuhnya."],
                  ["Sumatera Barat", "Zona jenuh hampir hilang sepenuhnya."]
                ].map(([prov, desc], i) => (
                  <div key={i} className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl shadow-sm font-mod8-body">
                    <span className="text-xs font-bold text-[#d72e38] block mb-0.5">{prov}</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-light">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={4} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 6 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Kelembaban Tanah - Indikator 6</span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Tanah Stabil</span> <br />Risiko Longsor Menurun Signifikan.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#5b8fbf] pl-4">
                Risiko longsor dihitung dari dua hal yaitu tanah sangat jenuh dan kemiringan lereng di atas 15°.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Saat puncak bencana, beberapa lereng di Aceh menunjukkan potensi longsor tinggi. Memasuki fase pemulihan, zona rawan longsor menyusut tajam. Seluruh wilayah Sumatera Barat, Sumatera Utara, dan Aceh kembali stabil dan siap memasuki tahap rekonstruksi infrastruktur secara menyeluruh.
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={landslideMode === 0 ? 5 : 6} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {landslideLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setLandslideMode(layer.id)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${landslideMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================= */}
        {/* SLIDE 7: PEMULIHAN AKSES JALAN (HALAMAN 7 BARU)         */}
        {/* ======================================================= */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Akses Jalan - Indikator 4
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">2.058 km</span> <br />Akses jalan pernah terputus.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Pemulihan tidak terasa nyata sampai jalan kembali bisa dilewati dan aktivitas manusia kembali berjalan diatasnya.
              </p>
              
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xl font-bold text-[#168573]">1.900 km</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Pulih</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xl font-bold text-[#d72e38]">100 km</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Terputus</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xl font-bold text-[#f47b2f]">58 km</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Tergenang</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={7} />
              </div>
            </div>

          </div>
        </section>
        {/* ======================================================= */}
        {/* SLIDE 8: ANALISIS JARINGAN JALAN (HALAMAN 8 BARU)       */}
        {/* ======================================================= */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Kiri: Ringkasan Narasi Akses Jalan */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Akses Jalan - Indikator 4
              </span>
              <h2 className="text-4xl lg:text-6xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.1]">
                <span className="text-[#f47b2f]">84%</span> <br />Akses Jalan Telah Pulih, Aceh Pulih Paling Cepat.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Pemulihan akses jalan tidak terjadi merata di tiga provinsi terdampak. Aceh menunjukkan pemulihan paling cepat, sementara Sumatera Barat dan Sumatera Utara masih perlu perhatian.
              </p>
              <div className="bg-gradient-to-br from-[#f8fafc] to-white border-l-4 border-[#168573] p-4 rounded-r-2xl font-mod8-body italic text-slate-500 text-xs leading-relaxed">
                Aceh mencatat pemulihan akses jalan sebesar 84,2%, diikuti oleh Sumatera Utara 65,2%, dan Sumatera Barat pada 54,1%.
              </div>
            </div>

            {/* Kanan: Panel Visualisasi Grafik */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Box 1: Progress Bar per Provinsi */}
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-5 font-mod8-heading">Pemulihan akses jalan per Provinsi</h3>
                <div className="space-y-5 font-mod8-body">
                  {[
                    { label: "Aceh", val: 84.2, color: "#168573" },
                    { label: "Sumatera Utara", val: 65.2, color: "#f47b2f" },
                    { label: "Sumatera Barat", val: 54.1, color: "#d72e38" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 border border-slate-300 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Stacked Bar Chart Komposisi Kategori Jalan */}
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-5">
                   <h3 className="text-base font-bold text-slate-800 font-mod8-heading">Komposisi kategori jalan terdampak per Provinsi</h3>
                   {/* Legend Dinamis */}
                   <div className="flex gap-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-400" /><span>Residential</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#1a2332]" /><span>Primary</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#168573]" /><span>Secondary</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#f47b2f]" /><span>Tertiary</span></div>
                   </div>
                </div>

                <div className="space-y-6 font-mod8-body">
                  {[
                    { label: "Aceh", stack: [{w: 15, c: '#94a3b8'}, {w: 40, c: '#1a2332'}, {w: 30, c: '#168573'}, {w: 15, c: '#f47b2f'}] },
                    { label: "Sumatera Utara", stack: [{w: 45, c: '#94a3b8'}, {w: 35, c: '#1a2332'}, {w: 10, c: '#168573'}, {w: 10, c: '#f47b2f'}] },
                    { label: "Sumatera Barat", stack: [{w: 10, c: '#94a3b8'}, {w: 60, c: '#1a2332'}, {w: 20, c: '#168573'}, {w: 10, c: '#f47b2f'}] }
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-slate-500 w-24 leading-tight">{row.label}</span>
                      <div className="flex-grow h-4 flex border border-slate-300 rounded-md overflow-hidden">
                        {row.stack.map((s, sIdx) => (
                          <div key={sIdx} style={{ width: `${s.w}%`, backgroundColor: s.c }} className="h-full border-r border-white/10 last:border-0" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
