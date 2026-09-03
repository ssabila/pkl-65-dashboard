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

const normalizeName = (str) => str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ') : '';
const stripPrefix = (n) => {
  for (const p of ['kota ', 'kabupaten ', 'kab. ', 'kab ']) {
    if (n.startsWith(p)) return n.slice(p.length);
  }
  return n;
};

const parseCSVContent = (text) => {
  const parseCSVLine = (line) => {
    let ret = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      let char = line[i];
      if (inQuote) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') { cur += '"'; i++; } 
          else { inQuote = false; }
        } else { cur += char; }
      } else {
        if (char === '"') { inQuote = true; } 
        else if (char === ',') { ret.push(cur); cur = ''; } 
        else { cur += char; }
      }
    }
    ret.push(cur);
    return ret;
  };

  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] !== undefined ? values[i].trim() : '';
    });
    return obj;
  });
};

export default function Module8Page() {
  const [activeSlide, setActiveSlide] = useState(1);
  const [mapMode, setMapMode] = useState(3); 
  const [landslideMode, setLandslideMode] = useState(5); // Mode 5: Nov-Des, Mode 6: April
  const [kelembabanMode, setKelembabanMode] = useState(11); 
  
  const [selectedNightLightProv, setSelectedNightLightProv] = useState('Aceh');
  const [selectedVegetationProv, setSelectedVegetationProv] = useState('Sumut');
  const containerRef = useRef(null);

  const [genanganData, setGenanganData] = useState([]);
  const [kelembabanNovDesData, setKelembabanNovDesData] = useState([]);
  const [kelembabanAprData, setKelembabanAprData] = useState([]);
  const [kelembabanKritisData, setKelembabanKritisData] = useState([]);

  const [genanganStats, setGenanganStats] = useState({
    luasPuncak: "15.094",
    luasResidual: "10.335",
    persenResidual: "68,47",
    provinsi: [
      { nama: "Sumatera Barat", persen: 74, status: "Kritis", color: "#D72E38" },
      { nama: "Aceh", persen: 58, status: "Parah", color: "#F47B2F" },
      { nama: "Sumatera Utara", persen: 43, status: "Sedang", color: "#FFD47D" }
    ]
  });

  const nightLightData = {
    Aceh: { highest: [{ name: 'Sabang', val: 126 }, { name: 'Banda Aceh', val: 118 }, { name: 'Aceh Besar', val: 103 }], lowest: [{ name: 'Aceh Utara', val: 68, color: '#d72e38' }, { name: 'Aceh Tamiang', val: 72, color: '#f47b2f' }, { name: 'Lhokseumawe', val: 86, color: '#ffd47d' }] },
    Sumut: { highest: [{ name: 'Medan', val: 116 }, { name: 'Binjai', val: 109 }, { name: 'Pematangsiantar', val: 102 }], lowest: [{ name: 'Mandailing Natal', val: 64, color: '#d72e38' }, { name: 'Nias Selatan', val: 71, color: '#f47b2f' }, { name: 'Karo', val: 81, color: '#ffd47d' }] },
    Sumbar: { highest: [{ name: 'Padang', val: 114 }, { name: 'Bukittinggi', val: 107 }, { name: 'Payakumbuh', val: 101 }], lowest: [{ name: 'Agam', val: 65, color: '#d72e38' }, { name: 'Pesisir Selatan', val: 73, color: '#f47b2f' }, { name: 'Pasaman Barat', val: 84, color: '#ffd47d' }] }
  };

  const vegetationData = {
    Sumut: { label: 'Sumatera Utara', highest: [{ name: 'Pakpak Bharat', val: '77,8%', width: 77.8, color: '#168573' }, { name: 'Karo', val: '69,8%', width: 69.8, color: '#f47b2f' }, { name: 'Nias Utara', val: '66,4%', width: 66.4, color: '#ffd47d' }], lowest: [{ name: 'Padang Lawas Utara', val: '16,4%', width: 16.4, color: '#d72e38' }, { name: 'Dairi', val: '46,2%', width: 46.2, color: '#f47b2f' }, { name: 'Tapanuli Tengah', val: '50,7%', width: 50.7, color: '#ffd47d' }] },
    Aceh: { label: 'Aceh', highest: [{ name: 'Banda Aceh', val: '82,5%', width: 82.5, color: '#168573' }, { name: 'Sabang', val: '80,1%', width: 80.1, color: '#168573' }, { name: 'Bener Meriah', val: '74,6%', width: 74.6, color: '#168573' }], lowest: [{ name: 'Aceh Tamiang', val: '21,3%', width: 21.3, color: '#d72e38' }, { name: 'Aceh Timur', val: '38,5%', width: 38.5, color: '#f47b2f' }, { name: 'Aceh Utara', val: '44,2%', width: 44.2, color: '#ffd47d' }] },
    Sumbar: { label: 'Sumatera Barat', highest: [{ name: 'Padang Panjang', val: '76,4%', width: 76.4, color: '#168573' }, { name: 'Bukittinggi', val: '73,2%', width: 73.2, color: '#168573' }, { name: 'Sawahlunto', val: '68,5%', width: 68.5, color: '#f47b2f' }], lowest: [{ name: 'Padang Pariaman', val: '19,8%', width: 19.8, color: '#d72e38' }, { name: 'Pesisir Selatan', val: '41,2%', width: 41.2, color: '#f47b2f' }, { name: 'Pasaman Barat', val: '47,5%', width: 47.5, color: '#ffd47d' }] }
  };

  const mapLayers = [
    { id: 0, label: 'Peta Surutnya Genangan (%)' },
    { id: 1, label: 'Peta Genangan Puncak Banjir' },
    { id: 2, label: 'Peta Genangan Surut' },
    { id: 3, label: 'Peta Genangan Residual' }
  ];

  const kelembabanLayers = [
    { id: 11, label: 'Peta Kelembaban Tanah (Nov–Des 2025)' },
    { id: 12, label: 'Peta Kelembaban Tanah (April 2026)' },
    { id: 13, label: 'Peta Zona Kritis Kelembaban' }
  ];

  const landslideLayers = [
    { id: 5, label: 'Peta Risiko Longsor (Nov–Des 2025)' },
    { id: 6, label: 'Peta Risiko Longsor (April 2026)' }
  ];

  useEffect(() => {
    fetch('/module-8/data/Modul8_R3.csv') 
      .then(res => {
        if (!res.ok) throw new Error("CSV tidak ditemukan.");
        return res.text();
      })
      .then(text => {
        const parsed = parseCSVContent(text);
        let totalPuncak = 0; let totalResidual = 0;
        const provData = {};

        const normalizedData = parsed.map(row => {
          const namaKabupaten = row.kabupaten || row.NAME_2 || '';
          let namaProvinsi = row.provinsi || row.NAME_1 || 'Sumatera';
          if (namaProvinsi.toLowerCase().includes('aceh')) namaProvinsi = 'Aceh';

          const puncak = parseFloat(row.luas_puncak_ha) || 0;
          const residual = parseFloat(row.luas_terkini_ha) || 0;
          const r3_persen_asli = parseFloat(row.r3_persen);

          const surut = Math.max(0, puncak - residual);
          const persenSurut = puncak > 0 ? (surut / puncak) * 100 : 0;
          const persenResidual = !isNaN(r3_persen_asli) ? r3_persen_asli : (puncak > 0 ? (residual / puncak) * 100 : 0);

          let status = 'pulih';
          if (persenResidual > 75) status = 'kritis';
          else if (persenResidual > 50) status = 'parah';
          else if (persenResidual > 25) status = 'sedang';

          totalPuncak += puncak; totalResidual += residual;
          if (!provData[namaProvinsi]) provData[namaProvinsi] = { puncak: 0, residual: 0 };
          provData[namaProvinsi].puncak += puncak; provData[namaProvinsi].residual += residual;

          const norm = normalizeName(namaKabupaten);
          return {
            ...row,
            kabupaten_key: norm,
            kabupaten_key_noprefix: stripPrefix(norm),
            luas_puncak_ha: puncak,
            luas_terkini_ha: residual,
            surut_ha: surut,
            surut_persen: persenSurut.toFixed(2),
            r3_persen: persenResidual.toFixed(2),
            status: status
          };
        });

        setGenanganData(normalizedData);

        if (totalPuncak > 0) {
          const rataPersen = ((totalResidual / totalPuncak) * 100).toFixed(2);
          const provStats = Object.keys(provData).map(prov => {
            const p = provData[prov];
            const pr = p.puncak > 0 ? (p.residual / p.puncak) * 100 : 0;
            let st = 'Pulih', c = '#168573';
            if (pr > 75) { st = 'Kritis'; c = '#D72E38'; }
            else if (pr > 50) { st = 'Parah'; c = '#F47B2F'; }
            else if (pr > 25) { st = 'Sedang'; c = '#FFD47D'; }
            return { nama: prov, persen: Math.round(pr), status: st, color: c };
          }).sort((a, b) => b.persen - a.persen);

          setGenanganStats({
            luasPuncak: Math.round(totalPuncak).toLocaleString('id-ID'),
            luasResidual: Math.round(totalResidual).toLocaleString('id-ID'),
            persenResidual: rataPersen.replace('.', ','),
            provinsi: provStats.length > 0 ? provStats : genanganStats.provinsi
          });
        }
      })
      .catch(err => console.warn("Gagal memuat CSV Genangan:", err));

    const fetchKelembaban = async (url, setter) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return;
        const text = await res.text();
        const parsed = parseCSVContent(text);
        const mapped = parsed.map(row => ({
          ...row,
          kabupaten_key: normalizeName(row.ADM2_NAME || ''),
          kabupaten_key_noprefix: stripPrefix(normalizeName(row.ADM2_NAME || '')),
          mean: parseFloat(row.mean) || 0
        }));
        setter(mapped);
      } catch(e) {
        console.warn("Gagal memuat " + url, e);
      }
    };

    fetchKelembaban('/module-8/data/Modul8_R6_NovDes25.csv', setKelembabanNovDesData);
    fetchKelembaban('/module-8/data/Modul8_R6_JanMay26.csv', setKelembabanAprData);
    fetchKelembaban('/module-8/data/Modul8_R6.csv', setKelembabanKritisData);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, clientHeight } = containerRef.current;
      const slideIndex = Math.round(scrollTop / clientHeight) + 1;
      setActiveSlide(slideIndex);
    };
    const container = containerRef.current;
    if (container) container.addEventListener('scroll', handleScroll);
    return () => { if (container) container.removeEventListener('scroll', handleScroll); };
  }, []);

  useEffect(() => {
    let autoSlideTimer;
    if (activeSlide === 3) {
      autoSlideTimer = setInterval(() => { setMapMode((prev) => (prev + 1) % mapLayers.length); }, 5000); 
    }
    return () => { if (autoSlideTimer) clearInterval(autoSlideTimer); };
  }, [activeSlide]);

  useEffect(() => {
    let kelembabanTimer;
    if (activeSlide === 5) {
      kelembabanTimer = setInterval(() => {
        setKelembabanMode((prev) => {
          if (prev === 11) return 12;
          if (prev === 12) return 13;
          return 11;
        });
      }, 5000); 
    }
    return () => { if (kelembabanTimer) clearInterval(kelembabanTimer); };
  }, [activeSlide]);

  useEffect(() => {
    let landslideTimer;
    if (activeSlide === 6) {
      landslideTimer = setInterval(() => {
        setLandslideMode((prev) => (prev === 5 ? 6 : 5));
      }, 5000);
    }
    return () => { if (landslideTimer) clearInterval(landslideTimer); };
  }, [activeSlide]);

  const scrollToSlide = (slideIndex) => {
    if (!containerRef.current) return;
    const clientHeight = containerRef.current.clientHeight;
    containerRef.current.scrollTo({ top: (slideIndex - 1) * clientHeight, behavior: 'smooth' });
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
          <button onClick={() => scrollToSlide(activeSlide - 1)} disabled={activeSlide === 1} className={`transition font-bold ${activeSlide === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#f47b2f]'}`}>&larr;</button>
          <span className="font-semibold tracking-widest">{activeSlide} / 17</span>
          <button onClick={() => scrollToSlide(activeSlide + 1)} disabled={activeSlide === 17} className={`transition font-bold ${activeSlide === 17 ? 'opacity-30 cursor-not-allowed' : 'hover:text-[#f47b2f]'}`}>&rarr;</button>
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
              <MapComponent currentMode={3} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
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
                { t: "Des 2025", p: "Pemerintah menetapkan Status Tanggap Darurat setelah banjir memutus akses jalan dan listrik." },
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
            <p className="text-xs font-medium text-slate-700 font-mod8-body pt-2 border-t border-slate-300">Indikator Monitoring Pemulihan yang digunakan:</p>
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
                <MapComponent currentMode={mapMode} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {mapLayers.map((layer) => (
                  <button key={layer.id} onClick={() => setMapMode(layer.id)} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${mapMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} />
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
                Zona Tanah Jenuh <br /><span className="text-[#f47b2f]">Menyusut Signifikan.</span>
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
                <MapComponent currentMode={kelembabanMode} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {kelembabanLayers.map((layer) => (
                  <button key={layer.id} onClick={() => setKelembabanMode(layer.id)} title={layer.label} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${kelembabanMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 6: DISESUAIKAN DENGAN GAMBAR (TEKS & KAROUSEL PETA RISIKO LONGSOR) */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Slide 6 — Analisis Risiko Longsor
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                Risiko Longsor <br /><span className="text-[#f47b2f]">Menurun Signifikan.</span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#5b8fbf] pl-4">
                Peta risiko longsor dari analisis silang kelembaban tanah (tanah sangat jenuh) dan kemiringan lereng di atas 15 derajat.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                "Saat puncak bencana, lereng di Aceh berpotensi longsor tinggi. Memasuki fase pemulihan, zona rawan longsor menyusut tajam."
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={landslideMode} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[450] bg-white border border-slate-300 px-4 py-2 rounded-full flex items-center gap-3 shadow-sm">
                {landslideLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setLandslideMode(layer.id)}
                    title={layer.label}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border border-slate-400 ${landslideMode === layer.id ? 'bg-[#f47b2f] scale-125' : 'bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 7 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Pemulihan Akses Jalan - Indikator 4</span>
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
                <MapComponent currentMode={7} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 8 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">Pemulihan Akses Jalan - Indikator 4</span>
              <h2 className="text-4xl lg:text-6xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.1]">
                <span className="text-[#f47b2f]">84%</span> <br />Akses Jalan Telah Pulih, Aceh Pulih Paling Cepat.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Pemulihan akses jalan tidak terjadi merata di tiga provinsi terdampak. Aceh menunjukkan pemulihan paling cepat, sementara Sumatera Barat dan Sumatera Utara masih perlu perhatian.
              </p>
              <div className="bg-gradient-to-br from-[#f8fafc] to-white border-l-4 border-[#168573] p-4 rounded-r-2xl font-mod8-body italic text-slate-500 text-xs leading-relaxed">
                Aceh mencatat pemulihan akses jalan sebesar 84,0%, diikuti oleh Sumatera Utara 65,1%, dan Sumatera Barat pada 54,1%.
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-5 font-mod8-heading">Pemulihan akses jalan per Provinsi</h3>
                <div className="space-y-4 font-mod8-body">
                  {[
                    { label: "Aceh", val: 84.0, color: "#168573" },
                    { label: "Sumatera Utara", val: 65.1, color: "#f47b2f" },
                    { label: "Sumatera Barat", val: 54.1, color: "#ffd47d" }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>{item.label}</span>
                        <span>{item.val}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 border border-slate-300 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-4 font-mod8-heading">Komposisi kategori jalan terdampak per Provinsi</h3>
                <div className="space-y-4 font-mod8-body">
                  {[
                    { label: "Aceh", stack: [{w: 15, c: '#168573'}, {w: 45, c: '#f47b2f'}, {w: 25, c: '#5b8fbf'}, {w: 15, c: '#d72e38'}] },
                    { label: "Sumatera Utara", stack: [{w: 40, c: '#168573'}, {w: 35, c: '#f47b2f'}, {w: 15, c: '#5b8fbf'}, {w: 10, c: '#d72e38'}] },
                    { label: "Sumatera Barat", stack: [{w: 25, c: '#168573'}, {w: 35, c: '#f47b2f'}, {w: 25, c: '#5b8fbf'}, {w: 15, c: '#d72e38'}] }
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-xs font-bold text-slate-700">{row.label}</span>
                      <div className="w-full h-3.5 flex border border-slate-300 rounded-full overflow-hidden bg-slate-100">
                        {row.stack.map((s, sIdx) => (
                          <div key={sIdx} style={{ width: `${s.w}%`, backgroundColor: s.c }} className="h-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-2 text-[10px] font-bold text-slate-500">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#168573]" /><span>Residential</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f47b2f]" /><span>Primary</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#5b8fbf]" /><span>Secondary</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#d72e38]" /><span>Tertiary</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 9 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Kondisi Bangunan - Indikator 5
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Tempat Tinggal</span> <br />Ada Rumah untuk Pulang?
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body pr-4 text-justify">
                Jalan bisa terbuka lebih dulu. Tapi pemulihan baru benar-benar terasa ketika rumah, sekolah, kios, dan fasilitas layanan publik bisa kembali digunakan.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed font-mod8-body text-justify pr-4 italic border-l-2 border-[#168573] pl-3">
                Indikator R-5 membaca pemulihan fisik bangunan dari citra Sentinel-2 dan Google Open Buildings. Bangunan dianggap pulih ketika area terbangun mulai kembali mendekati kondisi normal sebelum bencana.
              </p>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={8} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 10 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Kondisi Bangunan - Indikator 5
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">75,1%</span> <br />Rata-rata Pemulihan Bangunan, Menguat Hingga Mei.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                Tren pemulihan kondisi bangunan bergerak naik secara serentak pada akhir periode pemantauan.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Dari agregasi bulanan tiga provinsi, rata-rata gabungan pemulihan bangunan meningkat dari 69,4% pada Januari menjadi 75,1% pada Mei 2026. Pada bulan terakhir, Aceh mencatat pemulihan tertinggi, disusul Sumatera Barat dan Sumatera Utara.
              </p>
            </div>

            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-800 mb-4 font-mod8-heading">
                Tren bulanan pemulihan bangunan
              </h3>
              <div className="w-full h-[280px] relative font-mod8-body">
                <svg viewBox="0 0 540 240" className="w-full h-full overflow-visible">
                  {[
                    { val: '90%', y: 20 },
                    { val: '85%', y: 42.5 },
                    { val: '80%', y: 65 },
                    { val: '75%', y: 87.5 },
                    { val: '70%', y: 110 },
                    { val: '65%', y: 132.5 },
                    { val: '60%', y: 155 },
                    { val: '55%', y: 177.5 },
                    { val: '50%', y: 200 },
                  ].map((grid, idx) => (
                    <g key={idx}>
                      <line x1="50" y1={grid.y} x2="520" y2={grid.y} stroke="#e2e8f0" strokeWidth="1" />
                      <text x="40" y={grid.y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="bold">
                        {grid.val}
                      </text>
                    </g>
                  ))}
                  {[
                    { m: 'Jan', x: 75 },
                    { m: 'Feb', x: 180 },
                    { m: 'Mar', x: 285 },
                    { m: 'Apr', x: 390 },
                    { m: 'Mei', x: 495 },
                  ].map((col, idx) => (
                    <text key={idx} x={col.x} y="222" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                      {col.m}
                    </text>
                  ))}
                  <path d="M 75 60 C 120 70, 140 150, 180 155 C 220 160, 240 85, 285 92 C 330 98, 350 115, 390 105 C 430 95, 460 75, 495 72" fill="none" stroke="#f47b2f" strokeWidth="2.2" />
                  {[[75, 60], [180, 155], [285, 92], [390, 105], [495, 72]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3.5" fill="#f47b2f" stroke="#ffffff" strokeWidth="1" />
                  ))}
                  <path d="M 75 105 C 120 100, 140 92, 180 92 C 220 92, 240 135, 285 132 C 330 130, 350 115, 390 110 C 430 105, 460 55, 495 45" fill="none" stroke="#168573" strokeWidth="2.2" />
                  {[[75, 105], [180, 92], [285, 132], [390, 110], [495, 45]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3.5" fill="#168573" stroke="#ffffff" strokeWidth="1" />
                  ))}
                  <path d="M 75 125 C 120 145, 140 178, 180 178 C 220 178, 240 115, 285 118 C 330 120, 350 122, 390 122 C 430 122, 460 112, 495 110" fill="none" stroke="#5b8fbf" strokeWidth="2.2" />
                  {[[75, 125], [180, 178], [285, 118], [390, 122], [495, 110]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="3.5" fill="#5b8fbf" stroke="#ffffff" strokeWidth="1" />
                  ))}
                  <path d="M 75 112 C 120 118, 140 120, 180 122 C 220 124, 240 125, 285 120 C 330 115, 350 112, 390 105 C 430 98, 460 90, 495 88" fill="none" stroke="#1a2332" strokeWidth="2.5" />
                  {[[75, 112], [180, 122], [285, 120], [390, 105], [495, 88]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#1a2332" stroke="#ffffff" strokeWidth="1.2" />
                  ))}
                </svg>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 pt-3 border-t border-slate-200/80 font-mod8-body text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#1a2332]" /><span>Rata-rata</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#168573]" /><span>Aceh</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#f47b2f]" /><span>Sumatera Barat</span></div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#5b8fbf]" /><span>Sumatera Utara</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 11 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Intensitas Cahaya Malam - Indikator 2
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Lampu Menyala</span> <br />Tanda Aktivitas Mulai Kembali.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Intensitas cahaya malam menjadi sinyal tidak langsung untuk membaca pulihnya listrik, mobilitas, dan aktivitas ekonomi setelah bencana. Semakin terang wilayah, semakin kuat indikasi aktivitas malam telah pulih.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xs font-bold text-[#168573] uppercase tracking-wider">Baseline</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Intensitas cahaya malam Maret–Mei 2025</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xs font-bold text-[#168573] uppercase tracking-wider">Current</span>
                  <p className="text-[10px] text-slate-500 leading-normal mt-1">Intensitas cahaya malam April 2026</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-4 rounded-2xl flex flex-col justify-between font-mod8-body shadow-sm">
                  <span className="text-xs font-bold text-[#168573] uppercase tracking-wider">Recovery</span>
                  <div className="text-[10px] text-slate-500 leading-normal mt-1 flex flex-col">
                    <span className="font-semibold text-slate-700">Baseline</span>
                    <div className="border-t border-slate-300 my-0.5" />
                    <span className="font-semibold text-slate-700">Current</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">× 100</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={9} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 12 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Intensitas Cahaya Malam - Indikator 2
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">68%</span> <br />Recovery Intensitas Cahaya Malam Terendah
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                Beberapa Kab/Kota sudah melampaui baseline atau nilai recovery lebih dari 100%, tetapi wilayah dengan cahaya malam terendah justru menjadi sinyal prioritas pemulihan.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Nilai recovery di bawah 100% menandakan wilayah belum pulih sepenuhnya. Nilai 100% menunjukkan kondisi telah kembali seperti sebelum bencana, sedangkan di atas 100% berarti kondisinya sudah lebih baik dari sebelum bencana.
              </p>
            </div>

            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-mod8-heading">Pemulihan Intensitas Cahaya Malam</h3>
                <span className="text-xs font-bold text-[#f47b2f] font-mod8-body block mt-0.5">
                  &gt; {selectedNightLightProv === 'Aceh' ? 'Aceh' : selectedNightLightProv === 'Sumut' ? 'Sumatera Utara' : 'Sumatera Barat'}
                </span>
              </div>
              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#168573] px-2.5 py-0.5 rounded-full w-fit block">3 Tertinggi</span>
                <div className="space-y-2">
                  {nightLightData[selectedNightLightProv].highest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-24 font-medium text-slate-700 truncate">{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="h-full bg-[#168573] rounded-full transition-all duration-500" style={{ width: `${Math.min((item.val / 140) * 100, 100)}%` }} />
                      </div>
                      <span className="w-10 text-right font-bold text-[#5b8fbf] text-xs">{item.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#d72e38] px-2.5 py-0.5 rounded-full w-fit block">3 Terendah</span>
                <div className="space-y-2">
                  {nightLightData[selectedNightLightProv].lowest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-24 font-medium text-slate-700 truncate">{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.val / 140) * 100}%`, backgroundColor: item.color }} />
                      </div>
                      <span className="w-10 text-right font-bold text-[#d72e38] text-xs">{item.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full bg-slate-100/90 border border-slate-200 py-1.5 px-3 rounded-xl flex items-center justify-between text-[10px] font-semibold text-slate-500 font-mod8-body">
                <span>— 100% atau Setara Baseline</span>
              </div>
              <div className="flex justify-center items-center gap-2 pt-1 font-mod8-body">
                {['Aceh', 'Sumut', 'Sumbar'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setSelectedNightLightProv(prov)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      selectedNightLightProv === prov
                        ? 'bg-[#1a2332] text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 13 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Vegetasi - Indikator 1
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] text-[#1a2332] tracking-tight font-mod8-heading">
                <span className="text-[#f47b2f]">Kembali Hijau</span> <br />Tapi Tidak Secara Serentak
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify pr-4">
                Vegetasi pulih lebih lambat dibanding jalan, bangunan, atau intensitas cahaya malam. NDVI membantu membaca apakah tutupan lahan dan ekosistem mulai kembali stabil setelah bencana.
              </p>
              <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-300 p-5 rounded-2xl flex flex-col items-center justify-center font-mod8-body shadow-sm max-w-sm">
                <span className="text-xs font-bold text-[#168573] uppercase tracking-wider mb-2">Formula</span>
                <div className="flex items-center gap-3 text-xs text-slate-700">
                  <span className="font-medium">NDVI Recovery =</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-semibold text-slate-600 px-1">Baseline − Impact</span>
                    <div className="w-full border-t border-slate-400 my-0.5" />
                    <span className="text-[11px] font-semibold text-slate-600 px-1">Current − Impact</span>
                  </div>
                  <span className="font-semibold text-slate-700">× 100</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 w-full h-[500px] border border-slate-300 rounded-3xl relative overflow-hidden flex flex-col shadow-md">
              <div className="w-full flex-grow relative h-full">
                <MapComponent currentMode={10} genanganData={genanganData} kelembabanNovDesData={kelembabanNovDesData} kelembabanAprData={kelembabanAprData} kelembabanKritisData={kelembabanKritisData} />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 14 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Pemulihan Vegetasi - Indikator 1
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">62,9%</span> <br />Rata-rata Pemulihan Vegetasi
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                Secara agregat, tiga provinsi sudah masuk kategori baik. Namun, pemulihan vegetasi di tingkat kabupaten/kota masih menunjukkan kontras yang tajam.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Aceh mencatat rata-rata pemulihan tertinggi sebesar 62,9%, diikuti Sumatera Utara 56,6% dan Sumatera Barat 55,3%. Titik perhatian utama berada pada wilayah dengan recovery paling rendah, terutama Padang Lawas Utara, Padang Pariaman, dan Aceh Tamiang.
              </p>
            </div>

            <div className="lg:col-span-7 bg-gradient-to-br from-white to-slate-50 border border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-800 font-mod8-heading">
                  Pemulihan Vegetasi (NDVI Recovery)
                </h3>
                <span className="text-xs font-bold text-[#f47b2f] font-mod8-body block mt-0.5">
                  &gt; {vegetationData[selectedVegetationProv].label}
                </span>
              </div>

              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#168573] px-2.5 py-0.5 rounded-full w-fit block">
                  3 Tertinggi
                </span>
                <div className="space-y-2">
                  {vegetationData[selectedVegetationProv].highest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-medium text-slate-700 truncate">{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-300 z-10" />
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.width}%`, backgroundColor: item.color }} 
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-[#5b8fbf] text-xs">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 font-mod8-body">
                <span className="text-[9px] font-bold text-white uppercase bg-[#d72e38] px-2.5 py-0.5 rounded-full w-fit block">
                  3 Terendah
                </span>
                <div className="space-y-2">
                  {vegetationData[selectedVegetationProv].lowest.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <span className="w-28 font-medium text-slate-700 truncate">{item.name}</span>
                      <div className="flex-grow h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden relative">
                        <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-slate-300 z-10" />
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ width: `${item.width}%`, backgroundColor: item.color }} 
                        />
                      </div>
                      <span className="w-12 text-right font-bold text-[#d72e38] text-xs">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full bg-slate-100/90 border border-slate-200 py-1.5 px-3 rounded-xl flex items-center justify-between text-[10px] font-semibold text-slate-500 font-mod8-body">
                <span>— &lt; 25% = prioritas intervensi</span>
              </div>

              <div className="flex justify-center items-center gap-2 pt-1 font-mod8-body">
                {['Aceh', 'Sumut', 'Sumbar'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setSelectedVegetationProv(prov)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                      selectedVegetationProv === prov
                        ? 'bg-[#1a2332] text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 15 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="space-y-2">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Sintesis Pemulihan
              </span>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1a2332] font-mod8-heading tracking-tight">
                Bukan Hanya Satu Tanda, Pemulihan Dibaca dari Gabungan Beberapa Sinyal.
              </h2>
              <p className="text-slate-500 text-xs max-w-5xl leading-relaxed font-mod8-sub italic">
                Setiap indikator membaca sisi pemulihan yang berbeda: air yang surut, tanah yang stabil, jalan yang terbuka, bangunan yang kembali, aktivitas malam, dan vegetasi yang pulih.
              </p>
              <p className="text-slate-600 text-xs max-w-5xl leading-relaxed font-mod8-body">
                Scorecard 3×6 berikut merangkum kondisi Aceh, Sumatera Utara, dan Sumatera Barat pada enam indikator pemulihan. Tujuannya bukan hanya melihat siapa yang paling pulih, tetapi menemukan wilayah yang masalahnya saling menumpuk dan membutuhkan perhatian lintas sektor.
              </p>
            </div>

            <div className="grid grid-cols-7 gap-3 font-mod8-body text-xs pt-4">
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Provinsi</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Indikator 1</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Indikator 2</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Indikator 3</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Indikator 4</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Indikator 5</div>
              <div className="bg-slate-200/80 text-slate-700 font-bold p-3 rounded-2xl flex items-center justify-center text-center">Indikator 6</div>

              <div className="bg-slate-200/80 text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center">Aceh</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Sedang</div>
              <div className="bg-[#168573] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Melebihi Baseline</div>
              <div className="bg-[#f47b2f] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Parah</div>
              <div className="bg-[#168573] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Pulih</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Sedang</div>
              <div className="bg-[#f47b2f] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Kelembaban Tinggi</div>

              <div className="bg-slate-200/80 text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center">Sumatera Utara</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Sedang</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Mendekati Normal</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Sedang</div>
              <div className="bg-[#f47b2f] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Tergenang</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Sedang</div>
              <div className="bg-[#168573] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Normal</div>

              <div className="bg-slate-200/80 text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center">Sumatera Barat</div>
              <div className="bg-[#f47b2f] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Parah</div>
              <div className="bg-[#ffd47d] text-slate-800 font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Mendekati Normal</div>
              <div className="bg-[#d72e38] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Kritis</div>
              <div className="bg-[#d72e38] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Terputus</div>
              <div className="bg-[#f47b2f] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Parah</div>
              <div className="bg-[#168573] text-white font-bold p-4 rounded-2xl flex items-center justify-center text-center shadow-xs">Normal</div>
            </div>
          </div>
        </section>

        {/* SLIDE 16 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center pt-20 px-8 relative">
          <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-5 flex flex-col justify-center">
              <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
                Prioritas Intervensi
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1a2332] tracking-tight font-mod8-heading leading-[1.15]">
                <span className="text-[#f47b2f]">Prioritas</span> <br />Muncul Saat Beberapa Risiko Bertemu.
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-mod8-sub italic border-l-2 border-[#168573] pl-4">
                Wilayah prioritas bukan hanya yang memiliki satu indikator buruk, tetapi wilayah yang menunjukkan tekanan berlapis pada lebih dari satu dimensi pemulihan.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed font-mod8-body text-justify">
                Perhatian utama diarahkan pada wilayah dengan beberapa sinyal pemulihan yang masih lemah. Semakin banyak sinyal lemah yang muncul bersamaan, semakin tinggi kebutuhan intervensinya.
              </p>
            </div>

            <div className="lg:col-span-7 bg-white/95 border border-slate-300 rounded-3xl p-7 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#168573] font-mod8-heading mb-4">
                Daftar Wilayah Prioritas
              </h3>

              <div className="space-y-3 font-mod8-body">
                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">1</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Sumatera Barat</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Genangan residual tinggi, akses jalan sangat kritis, dan pemulihan vegetasi belum merata
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">2</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Padang Lawas Utara</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">Pemulihan vegetasi hanya 16,4%</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">3</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Aceh Tamiang</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Pemulihan vegetasi tertinggal dan indikasi dampak banjir masih kuat
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 flex items-center gap-4 bg-white hover:border-slate-300 transition">
                  <span className="w-9 h-9 rounded-full bg-[#d72e38] text-white flex items-center justify-center font-bold text-sm shrink-0">4</span>
                  <div>
                    <h4 className="font-bold text-sm text-[#1a2332]">Dharmasraya</h4>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Genangan residual dan akses jalan perlu dipantau silang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 17 */}
        <section className="h-screen w-full snap-start flex flex-col justify-center items-center pt-20 px-8 relative">
          <div className="w-full max-w-4xl bg-white/95 border border-slate-300 rounded-[32px] p-8 md:p-14 shadow-sm space-y-6 relative">
            <span className="text-slate-500 tracking-widest text-xs font-bold uppercase block font-mod8-body">
              Penutup
            </span>
            
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#1a2332] font-mod8-heading tracking-tight leading-[1.15]">
              Pemulihan Bukan Garis Lurus.
            </h2>

            <p className="text-slate-500 text-sm md:text-base leading-relaxed font-mod8-sub italic">
              Di sebagian tempat, air telah surut, jalan kembali terbuka, bangunan mulai pulih, cahaya malam menyala, dan vegetasi tumbuh kembali. Di tempat lain, tanda-tanda itu belum hadir bersamaan.
            </p>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-mod8-body">
              Karena itu, pemulihan perlu dibaca sebagai kumpulan sinyal. Bukan untuk mencari wilayah yang paling tertinggal semata, tetapi untuk memastikan bantuan, rehabilitasi, dan rekonstruksi diarahkan ke tempat yang paling membutuhkan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-mod8-body">
              <button
                onClick={() => scrollToSlide(1)}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                Ulangi cerita
              </button>
              <button
                onClick={() => scrollToSlide(1)}
                className="px-5 py-2.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-xs"
              >
                Buka dashboard lengkap
              </button>
            </div>

            <p className="text-[11px] text-slate-400 italic pt-2 font-mod8-body">
              Dashboard ini hanya desain awal, creator menerima segala kritik dan saran yang membangun ~budi.
            </p>
          </div>

          <span className="absolute bottom-6 right-10 text-xs text-slate-400 font-mod8-body">
            Terima Kasih
          </span>
        </section>

      </div>
    </div>
  );
}