"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { dataOverview, dataKerentanan } from "./dataMock";

// Dynamic import of the Interactive Map component to avoid Next.js SSR document/window crashes
const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-950 rounded-xl border border-card-border flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 text-sm font-sans">Memuat Peta Interaktif...</p>
    </div>
  )
});

// Image Slider mock data - premium CSS representation of visual simulation cards
const simulationSlides = [
  {
    id: 1,
    title: "Simulasi Aliran Lahar Dingin & Banjir Bandang",
    region: "Sumatera Barat (Gunung Marapi)",
    desc: "Pemetaan zona bahaya aliran sekunder di sepanjang sungai Batang Anai untuk kesiapsiagaan tanggap darurat masyarakat.",
    metricLabel: "Zona Bahaya Utama",
    metricValue: "Radius 4.5 Km",
    metricColor: "text-accent-danger border-accent-danger/30 bg-accent-danger/10",
    glowColor: "shadow-accent-danger/15",
    visualStyle: "bg-linear-to-r from-red-950/70 to-slate-900/95"
  },
  {
    id: 2,
    title: "Rute Evakuasi & Shelter Tsunami Kepulauan",
    region: "Aceh (Kepulauan Simeulue)",
    desc: "Pemodelan rute evakuasi mandiri berbasis ketinggian wilayah untuk menjangkau shelter terdekat dalam waktu <15 menit.",
    metricLabel: "Batas Ketinggian Aman",
    metricValue: "> 25 Mdpl",
    metricColor: "text-accent-secondary border-accent-secondary/30 bg-accent-secondary/10",
    glowColor: "shadow-accent-secondary/15",
    visualStyle: "bg-linear-to-r from-teal-950/70 to-slate-900/95"
  },
  {
    id: 3,
    title: "Integrasi Telemetri Early Warning System (EWS)",
    region: "Sumatera Utara (DAS Asahan)",
    desc: "Sensor tinggi muka air otomatis yang terintegrasi untuk memberikan peringatan dini banjir luapan sungai secara real-time.",
    metricLabel: "Waktu Transmisi Sensor",
    metricValue: "0.8 Detik",
    metricColor: "text-accent-warning border-accent-warning/30 bg-accent-warning/10",
    glowColor: "shadow-accent-warning/15",
    visualStyle: "bg-linear-to-r from-orange-950/70 to-slate-900/95"
  }
];

// Metadata table dataset
const metadataRows = [
  {
    indicator: "Indikator Luas Terdampak Bencana",
    definition: "Persentase estimasi luas area yang tergenang banjir atau terdampak longsor dibandingkan total luas administratif wilayah.",
    unit: "Persentase (%)",
    dataType: "Desimal",
    year: "2025",
    source: "BNPB (Badan Nasional Penanggulangan Bencana)"
  },
  {
    indicator: "Indeks Sensitivitas (Kemiskinan)",
    definition: "Rasio penduduk miskin terhadap total penduduk kabupaten/kota yang menggambarkan kerentanan sosial ekonomi menghadapi ancaman bencana.",
    unit: "Persentase (%)",
    dataType: "Desimal",
    year: "2025",
    source: "BPS (Badan Pusat Statistik)"
  },
  {
    indicator: "Indeks Kapasitas Adaptasi (Faskes)",
    definition: "Jumlah unit sarana pelayanan kesehatan formal (RS, Puskesmas, Klinik) sebagai penopang pemulihan pasca kejadian bencana.",
    unit: "Unit Fasilitas",
    dataType: "Integer (Bulat)",
    year: "2025",
    source: "BPS / Kemenkes"
  },
  {
    indicator: "Indeks Kerentanan Wilayah",
    definition: "Indeks agregat komposit hasil normalisasi pembobotan variabel bencana alam, tingkat kemiskinan, dan rasio ketahanan fasilitas wilayah.",
    unit: "Nilai Indeks (-1.0 s.d +1.0)",
    dataType: "Desimal",
    year: "2025",
    source: "Pusat Studi Kebencanaan (Hasil ETL)"
  }
];

// Download files dataset
const downloadFiles = [
  { id: "map_geojson", name: "Peta Indeks Kerentanan Wilayah (Aceh, Sumut, Sumbar)", format: "GeoJSON", size: "2.4 MB" },
  { id: "macro_casualties", name: "Data Tabular Jumlah Korban Jiwa & Pengungsi 2025", format: "XLSX", size: "340 KB" },
  { id: "flood_landslide_pct", name: "Data Tabular Persentase Luas Wilayah Terdampak Banjir & Longsor", format: "CSV", size: "185 KB" },
  { id: "health_facilities_cap", name: "Data Tabular Indeks Kapasitas Adaptasi Kesehatan", format: "CSV", size: "94 KB" },
  { id: "complete_vulnerability_profile", name: "Data Tabular Profil Kerentanan Wilayah Komplet (10 Kabupaten)", format: "XLSX", size: "1.1 MB" }
];

// Image Coverflow Gallery mock dataset (3 Gambar Provinsi)
const coverflowItems = [
  {
    id: 1,
    badge: "Provinsi Aceh",
    image: "/module-4/aceh.jpg"
  },
  {
    id: 2,
    badge: "Provinsi Sumatera Utara",
    image: "/module-4/sumut.jpeg"
  },
  {
    id: 3,
    badge: "Provinsi Sumatera Barat",
    image: "/module-4/sumbar.jpeg"
  }
];

export default function Modul4Page() {
  // Navigation Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  // Cascading Filters States
  const [selectedProvinsi, setSelectedProvinsi] = useState("Semua Provinsi");
  const [selectedKabupaten, setSelectedKabupaten] = useState("");

  // Carousel & Coverflow Slider States
  const [sliderIndex, setSliderIndex] = useState(0);
  const [coverflowIndex, setCoverflowIndex] = useState(0);

  const prevCover = () => {
    setCoverflowIndex((prev) => (prev === 0 ? coverflowItems.length - 1 : prev - 1));
  };

  const nextCover = () => {
    setCoverflowIndex((prev) => (prev === coverflowItems.length - 1 ? 0 : prev + 1));
  };

  // Sorting States for Table
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Download Checklist States
  const [checkedDownloads, setCheckedDownloads] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  // Smooth Scroll Navigation Handler
  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Intersection Observer to update active navigation item on scroll
  useEffect(() => {
    const sections = ["overview", "data", "metadata", "unduh"];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter kabupaten options dynamically based on selected province
  const availableKabupatenOptions = useMemo(() => {
    if (selectedProvinsi === "Semua Provinsi") return [];
    return dataKerentanan
      .filter((item) => item.provinsi === selectedProvinsi)
      .map((item) => item.kabupaten);
  }, [selectedProvinsi]);

  // Reset kabupaten when province changes
  const handleProvinsiChange = (e) => {
    const prov = e.target.value;
    setSelectedProvinsi(prov);
    setSelectedKabupaten(""); // Reset chosen kabupaten
  };

  // Top 10 sorted and filtered dataset
  const processedDataKerentanan = useMemo(() => {
    let dataset = [...dataKerentanan];

    // Sort logic based on Indeks
    dataset.sort((a, b) => {
      if (sortOrder === "asc") return a.indeks - b.indeks;
      return b.indeks - a.indeks;
    });

    return dataset;
  }, [sortOrder]);

  // Handle Map direct marker click (binds back to filters)
  const handleMapMarkerSelect = (kabupatenName) => {
    const match = dataKerentanan.find(k => k.kabupaten === kabupatenName);
    if (match) {
      setSelectedProvinsi(match.provinsi);
      setSelectedKabupaten(match.kabupaten);
      // Automatically scroll to the details if necessary or just set states
    }
  };

  // Filtered dataset for sub-indicator graphs based on active province/kabupaten filters
  const chartData = useMemo(() => {
    return dataKerentanan.filter((item) => {
      const matchProv = selectedProvinsi === "Semua Provinsi" || item.provinsi === selectedProvinsi;
      const matchKab = !selectedKabupaten || item.kabupaten === selectedKabupaten;
      return matchProv && matchKab;
    });
  }, [selectedProvinsi, selectedKabupaten]);

  // Carousel slider Navigation
  const prevSlide = () => {
    setSliderIndex((prev) => (prev === 0 ? simulationSlides.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setSliderIndex((prev) => (prev === simulationSlides.length - 1 ? 0 : prev + 1));
  };

  // Download selection Handlers
  const handleCheckboxChange = (id) => {
    setCheckedDownloads(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAllDownloads = (e) => {
    const isChecked = e.target.checked;
    const updated = {};
    if (isChecked) {
      downloadFiles.forEach(f => {
        updated[f.id] = true;
      });
    }
    setCheckedDownloads(updated);
  };

  const isAllDownloadsChecked = useMemo(() => {
    return downloadFiles.every(f => checkedDownloads[f.id]);
  }, [checkedDownloads]);

  const handleDownloadTrigger = () => {
    const selectedFiles = downloadFiles.filter(f => checkedDownloads[f.id]);
    if (selectedFiles.length === 0) {
      setToastMessage({
        type: "warning",
        text: "Peringatan: Pilih setidaknya satu file untuk diunduh."
      });
      return;
    }

    setToastMessage({
      type: "success",
      text: `Memulai unduhan untuk ${selectedFiles.length} file: ${selectedFiles.map(f => f.name).join(", ")}`
    });

    // Auto dismiss toast
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex relative selection:bg-accent-primary/20">

      {/* Dynamic Toast Notification Panel */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-55 animate-bounce-short">
          <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 max-w-md backdrop-blur-md ${toastMessage.type === "success"
            ? "bg-slate-900/95 border-accent-secondary/50 text-white"
            : "bg-slate-900/95 border-accent-warning/50 text-white"
            }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toastMessage.type === "success" ? "bg-accent-secondary/20 text-accent-secondary" : "bg-accent-warning/20 text-accent-warning"
              }`}>
              {toastMessage.type === "success" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <div>
              <h5 className="font-heading font-bold text-sm">Notifikasi Sistem</h5>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed font-sans">{toastMessage.text}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white shrink-0 ml-auto transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* COLLAPSIBLE SIDEBAR NAVIGASI */}
      <aside
        className={`fixed top-0 left-0 h-screen z-40 bg-white/70 backdrop-blur-md border-r border-card-border shadow-lg flex flex-col justify-between transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"
          }`}
      >
        {/* Sidebar Header Toggle */}
        <div className="p-3 border-b border-card-border">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-4 px-3 py-2 rounded-xl transition-all duration-200 group hover:bg-slate-100 cursor-pointer text-left"
            title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/module-4/Frame 1.png" alt="Logo Dashboard" className="w-full h-full object-contain drop-shadow-sm" />
            </div>

            <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col justify-center ${isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"}`}>
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-text-primary">Vulnerability</h4>
              <p className="text-[10px] text-text-secondary font-sans leading-none mt-0.5">Sumatera Profile</p>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          {[
            { id: "overview", label: "Overview", icon: "/module-4/Icons.png" },
            { id: "data", label: "Analisis Data", icon: "/module-4/Icons (1).png" },
            { id: "metadata", label: "Metadata Kamus", icon: "/module-4/Icons (2).png" },
            { id: "unduh", label: "Unduh Data", icon: "/module-4/Icons (3).png" }
          ].map((menu) => {
            const isActive = activeSection === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => scrollToSection(menu.id)}
                className={`w-full flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 group relative cursor-pointer ${isActive
                  ? "bg-accent-primary text-white shadow-md shadow-accent-primary/25"
                  : "hover:bg-slate-100 text-text-secondary hover:text-text-primary"
                  }`}
              >
                {/* Menu Icon */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 overflow-hidden ${!isActive && "group-hover:scale-110 transition-transform"}`}>
                  <img
                    src={menu.icon}
                    alt={menu.label}
                    className="w-5 h-5 object-contain"
                  />
                </div>

                {/* Menu Text */}
                <span
                  className={`font-sans font-medium text-sm transition-opacity duration-300 whitespace-nowrap ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none w-0 overflow-hidden"
                    }`}
                >
                  {menu.label}
                </span>

                {/* Sidebar closed tooltip */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs font-sans rounded-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
                    {menu.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-card-border overflow-hidden">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 text-text-light hover:text-accent-danger transition-colors font-sans text-xs"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className={`${isSidebarOpen ? "opacity-100" : "opacity-0 w-0 pointer-events-none"} transition-opacity duration-350`}>
              Kembali ke Portal
            </span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main
        className={`flex-1 min-h-screen py-8 px-4 sm:px-8 transition-all duration-300 relative ${isSidebarOpen ? "ml-64" : "ml-20"
          }`}
      >
        {/* Background Peta Dekorasi (Full Layar / Kanan Atas) */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-100 mix-blend-multiply overflow-hidden">
          <img
            src="/module-4/Bg%20Peta.png"
            alt="Background Peta Sumatra"
            className="w-full h-full object-cover object-right-top"
          />
        </div>

        <div className="max-w-7xl mx-auto space-y-16 relative z-10">

          {/* OVERVIEW / HERO (Redesigned) */}
          <section id="overview" className="scroll-mt-24 flex flex-col items-center justify-center pt-6 space-y-8 sm:space-y-12">

            {/* Judul Utama (Fluid Viewport Scale - Super Large & Proportional) */}
            <div className="flex flex-col items-center justify-center space-y-0 text-center w-full max-w-7xl mx-auto select-none px-2">
              {/* PROFIL */}
              <h1 className="font-heading font-extrabold text-[7vw] md:text-[5.5rem] lg:text-[6.5rem] text-[#0f8575] tracking-wider leading-none uppercase drop-shadow-sm">
                PROFIL
              </h1>

              {/* KERENTANAN (Gradient Coral-Red to Magenta-Pink) */}
              <h1 className="font-heading font-black text-[13.5vw] md:text-[11.5rem] lg:text-[13rem] bg-gradient-to-r from-[#ea4e3d] via-[#e8395f] to-[#e42978] bg-clip-text text-transparent tracking-tight leading-[0.85] uppercase drop-shadow-sm py-1">
                KERENTANAN
              </h1>

              {/* WILAYAH (Gradient Steel-Blue to Dark-Navy) */}
              <h1 className="font-heading font-extrabold text-[11vw] md:text-[9.5rem] lg:text-[10.8rem] bg-gradient-to-r from-[#678ba7] via-[#456784] to-[#29435b] bg-clip-text text-transparent tracking-normal leading-[0.88] uppercase drop-shadow-sm pb-2">
                WILAYAH
              </h1>
            </div>

            {/* Badge Provinsi */}
            <div className="bg-[#8e9eb2] px-8 sm:px-16 py-2.5 sm:py-3 rounded-full shadow-lg text-center max-w-fit border border-white/30 backdrop-blur-sm mt-2">
              <h2 className="text-white font-serif italic font-bold text-base sm:text-2xl md:text-3xl tracking-wide drop-shadow-sm">
                Provinsi Aceh, Sumatera Utara dan Sumatera Barat
              </h2>
            </div>

            {/* Gallery Images (Interactive 3D Coverflow Style with Navigation) */}
            <div className="w-full max-w-6xl flex flex-col items-center my-6 sm:my-10 relative group select-none">

              {/* Coverflow Main Slider Container */}
              <div className="w-full flex items-center justify-center relative h-[220px] sm:h-[360px] md:h-[450px]">

                {/* Tombol Panah Kiri */}
                <button
                  onClick={prevCover}
                  aria-label="Gambar Sebelumnya"
                  className="absolute left-2 sm:left-6 z-40 bg-white/80 hover:bg-white text-slate-800 p-2.5 sm:p-4 rounded-full shadow-xl border border-white/60 backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Tombol Panah Kanan */}
                <button
                  onClick={nextCover}
                  aria-label="Gambar Selanjutnya"
                  className="absolute right-2 sm:right-6 z-40 bg-white/80 hover:bg-white text-slate-800 p-2.5 sm:p-4 rounded-full shadow-xl border border-white/60 backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Coverflow Cards Rendering (3 Provinsi) */}
                {coverflowItems.map((item, index) => {
                  let offset = index - coverflowIndex;
                  if (offset === -2) offset = 1;
                  if (offset === 2) offset = -1;

                  // Active center card
                  if (offset === 0) {
                    return (
                      <div
                        key={item.id}
                        className="absolute z-30 w-[64%] sm:w-[50%] md:w-[42%] h-[190px] sm:h-[310px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white/90 transform transition-all duration-500 bg-slate-900 group cursor-pointer"
                      >
                        <img src={item.image} alt={item.badge} className="w-full h-full object-cover" />
                        {/* Overlay Badge Only (Tanpa Deskripsi Teks) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-6 text-left pointer-events-none">
                          <span className="bg-[#0f8575] text-white text-xs sm:text-sm font-heading font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg max-w-fit shadow-md">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Left Card (-1)
                  if (offset === -1) {
                    return (
                      <div
                        key={item.id}
                        onClick={prevCover}
                        className="absolute left-4 sm:left-12 md:left-20 z-20 w-[40%] sm:w-[34%] md:w-[32%] h-[160px] sm:h-[270px] md:h-[340px] rounded-2xl overflow-hidden shadow-xl opacity-80 blur-[1px] transform scale-90 -rotate-y-6 brightness-75 hover:brightness-90 transition-all duration-500 cursor-pointer group"
                      >
                        <img src={item.image} alt={item.badge} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-3 text-left">
                          <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded-md max-w-fit">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Right Card (1)
                  if (offset === 1) {
                    return (
                      <div
                        key={item.id}
                        onClick={nextCover}
                        className="absolute right-4 sm:right-12 md:right-20 z-20 w-[40%] sm:w-[35%] md:w-[32%] h-[160px] sm:h-[270px] md:h-[340px] rounded-2xl overflow-hidden shadow-xl opacity-80 blur-[1px] transform scale-90 rotate-y-6 brightness-75 hover:brightness-90 transition-all duration-500 cursor-pointer group"
                      >
                        <img src={item.image} alt={item.badge} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex flex-col justify-end p-3 text-left">
                          <span className="bg-slate-900/80 backdrop-blur-sm text-slate-200 text-[10px] sm:text-xs font-bold uppercase px-2.5 py-1 rounded-md max-w-fit">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>

              {/* Dots Pagination Navigation */}
              <div className="flex items-center justify-center gap-2 mt-4 z-30">
                {coverflowItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCoverflowIndex(i)}
                    aria-label={`Ke Gambar ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${coverflowIndex === i
                        ? "w-8 bg-[#0f8575] shadow-sm"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                      }`}
                  />
                ))}
              </div>

            </div>

            {/* Paragraf Latar Belakang */}
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-justify text-[#1e3a8a] font-sans font-medium text-xs sm:text-base md:text-[16px] leading-relaxed md:leading-loose">
              <p className="text-justify leading-relaxed md:leading-loose">
                Pada tahun 2025, sejumlah wilayah di Pulau Sumatra, khususnya Provinsi Aceh, Sumatera Utara, dan Sumatera Barat, mengalami kejadian banjir dan tanah longsor yang menimbulkan dampak signifikan terhadap masyarakat, infrastruktur, serta aktivitas ekonomi. Kondisi tersebut menunjukkan bahwa tingkat kerentanan suatu wilayah tidak hanya dipengaruhi oleh kejadian bencana alam yang tinggi, tetapi juga oleh karakteristik sensitivitas lingkungan serta masyarakat dan kapasitas wilayah dalam menghadapi bencana. Dashboard Profil Kerentanan Wilayah ini disusun untuk memberikan gambaran komprehensif mengenai faktor-faktor yang memengaruhi kerentanan banjir dan tanah longsor di Aceh, Sumatera Utara, dan Sumatera Barat, sehingga dapat menjadi dasar dalam mendukung upaya mitigasi, perencanaan pembangunan yang lebih tangguh, serta pengambilan keputusan yang berbasis data dalam pengurangan risiko bencana.
              </p>
            </div>

            {/* OVERVIEW STATISTICAL METRIC CARDS (ENHANCED PROPORTIONS & TYPOGRAPHY) */}
            <div className="w-full max-w-6xl mx-auto space-y-10 pt-6 select-none">

              {/* CARD 1: KORBAN JIWA */}
              <div className="w-full bg-gradient-to-r from-sky-50/90 via-white/95 to-sky-50/90 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 transition-transform duration-300 hover:scale-[1.01]">
                {/* Left: Giant Number & Title */}
                <div className="flex flex-col text-left space-y-2 w-full md:w-auto">
                  <div className="flex items-baseline gap-3">
                    <span className="font-heading font-black text-6xl sm:text-7xl md:text-8xl text-[#2c4059] tracking-tight drop-shadow-sm">
                      100.000
                    </span>
                    <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-500">
                      Jiwa
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-[#0b8071] leading-tight sm:leading-snug drop-shadow-sm">
                    Korban Jiwa Akibat Banjir<br className="hidden sm:block" /> dan Tanah Longsor
                  </h3>
                </div>

                {/* Right: Province Stat Pills */}
                <div className="flex flex-col gap-3.5 w-full md:w-[350px]">
                  {/* Aceh */}
                  <div className="bg-[#d9822b] text-white font-serif italic font-bold px-7 py-3 sm:py-3.5 rounded-full shadow-md flex items-center justify-between text-lg sm:text-xl">
                    <span>Aceh</span>
                    <span className="font-sans not-italic font-black text-xl sm:text-2xl tracking-wide">30.000</span>
                  </div>
                  {/* Sumatera Utara */}
                  <div className="bg-[#d9381e] text-white font-serif italic font-bold px-7 py-3 sm:py-3.5 rounded-full shadow-md flex items-center justify-between text-lg sm:text-xl">
                    <span>Sumatera Utara</span>
                    <span className="font-sans not-italic font-black text-xl sm:text-2xl tracking-wide">45.000</span>
                  </div>
                  {/* Sumatera Barat */}
                  <div className="bg-[#e5a93c] text-white font-serif italic font-bold px-7 py-3 sm:py-3.5 rounded-full shadow-md flex items-center justify-between text-lg sm:text-xl">
                    <span>Sumatera Barat</span>
                    <span className="font-sans not-italic font-black text-xl sm:text-2xl tracking-wide">25.000</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: RUMAH RUSAK */}
              <div className="w-full bg-gradient-to-r from-sky-50/90 via-white/95 to-sky-50/90 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 transition-transform duration-300 hover:scale-[1.01]">
                {/* Left: Province Stat Pills */}
                <div className="flex flex-col gap-3.5 w-full md:w-[350px] order-2 md:order-1">
                  {/* Aceh */}
                  <div className="bg-[#d9822b] text-white font-serif italic font-bold px-7 py-3 sm:py-3.5 rounded-full shadow-md flex items-center justify-between text-lg sm:text-xl">
                    <span>Aceh</span>
                    <span className="font-sans not-italic font-black text-xl sm:text-2xl tracking-wide">30.000</span>
                  </div>
                  {/* Sumatera Utara */}
                  <div className="bg-[#d9381e] text-white font-serif italic font-bold px-7 py-3 sm:py-3.5 rounded-full shadow-md flex items-center justify-between text-lg sm:text-xl">
                    <span>Sumatera Utara</span>
                    <span className="font-sans not-italic font-black text-xl sm:text-2xl tracking-wide">45.000</span>
                  </div>
                  {/* Sumatera Barat */}
                  <div className="bg-[#e5a93c] text-white font-serif italic font-bold px-7 py-3 sm:py-3.5 rounded-full shadow-md flex items-center justify-between text-lg sm:text-xl">
                    <span>Sumatera Barat</span>
                    <span className="font-sans not-italic font-black text-xl sm:text-2xl tracking-wide">25.000</span>
                  </div>
                </div>

                {/* Right: Giant Number, Unit & Cracked House Icon + Subtitle */}
                <div className="flex flex-col text-left md:text-right space-y-2 order-1 md:order-2 w-full md:w-auto">
                  <div className="flex items-center justify-start md:justify-end gap-3.5 flex-wrap">
                    <span className="font-heading font-black text-6xl sm:text-7xl md:text-8xl text-[#2c4059] tracking-tight drop-shadow-sm">
                      100.000
                    </span>
                    <span className="font-sans font-bold text-2xl sm:text-3xl text-slate-500">
                      Rumah
                    </span>
                    {/* House with crack icon */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 relative flex items-center justify-center ml-1">
                      <svg className="w-full h-full text-[#d9381e] filter drop-shadow-sm" viewBox="0 0 64 64" fill="currentColor">
                        <path d="M32 6L4 30h8v28h40V30h8L32 6zm16 48H16V28.5l16-13.7 16 13.7V54z" />
                        <path stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M32 18l-4 10 6 8-4 10 4 8" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-[#0b8071] leading-tight sm:leading-snug drop-shadow-sm">
                    Rusak Akibat Banjir<br className="hidden sm:block" /> dan Tanah Longsor
                  </h3>
                </div>
              </div>

              {/* CARD 3: LUAS WILAYAH TERDAMPAK BANJIR */}
              <div className="w-full bg-gradient-to-r from-sky-50/80 via-white/95 to-sky-50/80 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 transition-transform duration-300 hover:scale-[1.01]">
                {/* Left: Title Text */}
                <div className="text-left max-w-lg w-full md:w-auto">
                  <h3 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-[#0b8071] leading-tight tracking-tight drop-shadow-sm">
                    Luas Wilayah<br />Terdampak<br />Banjir
                  </h3>
                </div>

                {/* Right: 3 Donut Gauges */}
                <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
                  {/* Aceh 0.9% */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[12px] sm:border-[16px] border-[#e5a93c] flex items-center justify-center relative shadow-md bg-white">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c0392b] rounded-full absolute -top-2 border-2 border-white shadow-md"></span>
                      <span className="font-sans font-black text-slate-900 text-xl sm:text-3xl">0.9%</span>
                    </div>
                    <span className="font-serif italic font-extrabold text-slate-800 text-base sm:text-xl">Aceh</span>
                  </div>

                  {/* Sumatera Utara 0.2% */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[12px] sm:border-[16px] border-[#e5a93c] flex items-center justify-center relative shadow-md bg-white">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c0392b] rounded-full absolute -top-2 border-2 border-white shadow-md"></span>
                      <span className="font-sans font-black text-slate-900 text-xl sm:text-3xl">0.2%</span>
                    </div>
                    <span className="font-serif italic font-extrabold text-slate-800 text-base sm:text-xl text-center leading-tight">
                      Sumatera<br />Utara
                    </span>
                  </div>

                  {/* Sumatera Barat 0.1% */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[12px] sm:border-[16px] border-[#e5a93c] flex items-center justify-center relative shadow-md bg-white">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c0392b] rounded-full absolute -top-2 border-2 border-white shadow-md"></span>
                      <span className="font-sans font-black text-slate-900 text-xl sm:text-3xl">0.1%</span>
                    </div>
                    <span className="font-serif italic font-extrabold text-slate-800 text-base sm:text-xl text-center leading-tight">
                      Sumatera<br />Barat
                    </span>
                  </div>
                </div>
              </div>

              {/* CARD 4: LUAS WILAYAH TERDAMPAK TANAH LONGSOR */}
              <div className="w-full bg-gradient-to-r from-sky-50/80 via-white/95 to-sky-50/80 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 transition-transform duration-300 hover:scale-[1.01]">
                {/* Left: 3 Donut Gauges */}
                <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap order-2 md:order-1">
                  {/* Aceh 2.4% */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[12px] sm:border-[16px] border-[#e5a93c] flex items-center justify-center relative shadow-md bg-white">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c0392b] rounded-full absolute -top-2 border-2 border-white shadow-md"></span>
                      <span className="font-sans font-black text-slate-900 text-xl sm:text-3xl">2.4%</span>
                    </div>
                    <span className="font-serif italic font-extrabold text-slate-800 text-base sm:text-xl">Aceh</span>
                  </div>

                  {/* Sumatera Utara 0% */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[12px] sm:border-[16px] border-[#e5a93c] flex items-center justify-center relative shadow-md bg-white">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c0392b] rounded-full absolute -top-2 border-2 border-white shadow-md"></span>
                      <span className="font-sans font-black text-slate-900 text-xl sm:text-3xl">0%</span>
                    </div>
                    <span className="font-serif italic font-extrabold text-slate-800 text-base sm:text-xl text-center leading-tight">
                      Sumatera<br />Utara
                    </span>
                  </div>

                  {/* Sumatera Barat 2% */}
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[12px] sm:border-[16px] border-[#e5a93c] flex items-center justify-center relative shadow-md bg-white">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-[#c0392b] rounded-full absolute -top-2 border-2 border-white shadow-md"></span>
                      <span className="font-sans font-black text-slate-900 text-xl sm:text-3xl">2%</span>
                    </div>
                    <span className="font-serif italic font-bold text-slate-800 text-base sm:text-xl text-center leading-tight">
                      Sumatera<br />Barat
                    </span>
                  </div>
                </div>

                {/* Right: Title Text */}
                <div className="text-left md:text-right max-w-lg order-1 md:order-2 w-full md:w-auto">
                  <h3 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-[#0b8071] leading-tight tracking-tight drop-shadow-sm">
                    Luas Wilayah<br />Terdampak<br />Tanah Longsor
                  </h3>
                </div>
              </div>

            </div>

          </section>

          {/* SECTION 2: DATA (ANALISIS INTERAKTIF & PETA) */}
          <section id="data" className="scroll-mt-24 space-y-8">
            <div className="border-b border-card-border pb-3 flex justify-between items-end flex-wrap gap-4">
              <h3 className="font-heading text-xl text-text-primary flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent-primary rounded-full"></span>
                Analisis Interaktif & Peta Tematik
              </h3>

              {/* Cascading Filter Controls */}
              <div className="flex items-center gap-3 flex-wrap bg-slate-50 p-2 rounded-xl border border-card-border">
                {/* Dropdown 1: Provinsi */}
                <div className="flex items-center gap-2">
                  <label htmlFor="prov-filter" className="text-xxs uppercase tracking-wider text-text-secondary font-bold font-sans">
                    Provinsi:
                  </label>
                  <select
                    id="prov-filter"
                    value={selectedProvinsi}
                    onChange={handleProvinsiChange}
                    className="bg-white border border-card-border rounded-lg text-xs font-medium text-text-primary px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                  >
                    <option value="Semua Provinsi">Semua Provinsi</option>
                    <option value="Aceh">Aceh</option>
                    <option value="Sumatera Utara">Sumatera Utara</option>
                    <option value="Sumatera Barat">Sumatera Barat</option>
                  </select>
                </div>

                {/* Dropdown 2: Kabupaten (Cascading) */}
                <div className="flex items-center gap-2">
                  <label htmlFor="kab-filter" className="text-xxs uppercase tracking-wider text-text-secondary font-bold font-sans">
                    Kabupaten:
                  </label>
                  <select
                    id="kab-filter"
                    value={selectedKabupaten}
                    onChange={(e) => setSelectedKabupaten(e.target.value)}
                    disabled={selectedProvinsi === "Semua Provinsi"}
                    className="bg-white border border-card-border rounded-lg text-xs font-medium text-text-primary px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 disabled:bg-slate-100 disabled:text-text-light disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedProvinsi === "Semua Provinsi" ? "Pilih Provinsi Dulu" : "Semua Kabupaten"}
                    </option>
                    {availableKabupatenOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset filters button */}
                {(selectedProvinsi !== "Semua Provinsi" || selectedKabupaten) && (
                  <button
                    onClick={() => {
                      setSelectedProvinsi("Semua Provinsi");
                      setSelectedKabupaten("");
                    }}
                    className="text-xxs text-accent-danger hover:underline font-bold px-2 py-1 font-sans cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Dynamic Map Component (SSR: false wrapped mockup) */}
            <div className="w-full">
              <InteractiveMap
                selectedProvinsi={selectedProvinsi}
                selectedKabupaten={selectedKabupaten}
                onSelectKabupaten={handleMapMarkerSelect}
                dataKerentanan={dataKerentanan}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* TABLE: Top 10 Regencies */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                    Tabel Peringkat Indeks Kerentanan Wilayah
                    <span className="text-xxs text-text-light font-normal font-sans">(Urutan Indeks)</span>
                  </span>

                  {/* Sorting control */}
                  <button
                    onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    className="text-xs text-accent-primary font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Urutkan Indeks: {sortOrder === "desc" ? "Tertinggi ↓" : "Terendah ↑"}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-card-border shadow-xs bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-card-border text-text-secondary font-sans font-semibold">
                        <th className="p-3">Kabupaten/Kota</th>
                        <th className="p-3">Provinsi</th>
                        <th className="p-3 text-center">Banjir (x)</th>
                        <th className="p-3 text-center">Longsor (x)</th>
                        <th className="p-3 text-center">Indeks</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {processedDataKerentanan.map((row) => {
                        // Highlight if this regency is currently selected in filters
                        const isMatchFilter = selectedKabupaten === row.kabupaten;

                        return (
                          <tr
                            key={row.kabupaten}
                            className={`transition-colors cursor-pointer hover:bg-slate-50/50 ${isMatchFilter ? "bg-red-50/70 border-l-4 border-l-accent-danger font-bold text-accent-danger" : "text-text-secondary"
                              }`}
                            onClick={() => handleMapMarkerSelect(row.kabupaten)}
                          >
                            <td className={`p-3 font-medium ${isMatchFilter ? "text-accent-danger" : "text-text-primary"}`}>
                              {row.kabupaten}
                            </td>
                            <td className="p-3 font-sans">{row.provinsi}</td>
                            <td className="p-3 text-center font-sans">{row.banjir}</td>
                            <td className="p-3 text-center font-sans">{row.longsor}</td>
                            <td className={`p-3 text-center font-sans font-bold ${isMatchFilter ? "text-accent-danger" :
                              row.indeks > 0.2 ? "text-accent-warning" : "text-text-primary"
                              }`}>
                              {row.indeks.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xxs font-bold font-sans ${row.status === "Sangat Tinggi"
                                ? "bg-accent-danger/10 text-accent-danger"
                                : row.status === "Tinggi"
                                  ? "bg-accent-warning/10 text-accent-warning"
                                  : "bg-accent-secondary/10 text-accent-secondary"
                                }`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CHARTS: Dynamic Sub-Indicator Graphs */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-sm font-semibold text-text-primary block">
                  Grafik Kerentanan Sub-Indikator
                </span>

                <div className="card p-5 space-y-6">
                  {chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-xs text-text-light text-center font-sans">
                      Pilih provinsi/kabupaten lain untuk melihat grafik data sub-indikator.
                    </div>
                  ) : (
                    <>
                      {/* GRAPH 1: Kemiskinan / Sensitivitas */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-text-primary">Indeks Sensitivitas: Kemiskinan (%)</span>
                          <span className="text-[10px] text-text-light">Batas kritis: 15%</span>
                        </div>
                        <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                          {chartData.map((item) => {
                            const isFocused = selectedKabupaten === item.kabupaten;
                            return (
                              <div key={item.kabupaten} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-sans">
                                  <span className={isFocused ? "text-accent-danger font-bold" : "text-text-secondary"}>
                                    {item.kabupaten}
                                  </span>
                                  <span className={isFocused ? "text-accent-danger font-bold" : "text-text-primary font-semibold"}>
                                    {item.miskinPct}%
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${isFocused
                                      ? "bg-accent-danger"
                                      : item.miskinPct > 15
                                        ? "bg-accent-warning"
                                        : "bg-accent-primary"
                                      }`}
                                    style={{ width: `${Math.min(100, (item.miskinPct / 35) * 100)}%` }} // Max reference 35%
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* GRAPH 2: Jumlah Fasilitas Kesehatan / Adaptasi */}
                      <div className="space-y-3 pt-4 border-t border-card-border">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-text-primary">Kapasitas Adaptasi: Jumlah Faskes</span>
                          <span className="text-[10px] text-text-light">Unit sarana kesehatan</span>
                        </div>
                        <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                          {chartData.map((item) => {
                            const isFocused = selectedKabupaten === item.kabupaten;
                            return (
                              <div key={item.kabupaten} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-sans">
                                  <span className={isFocused ? "text-accent-danger font-bold" : "text-text-secondary"}>
                                    {item.kabupaten}
                                  </span>
                                  <span className={isFocused ? "text-accent-danger font-bold" : "text-text-primary font-semibold"}>
                                    {item.faskes} Unit
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${isFocused
                                      ? "bg-accent-danger"
                                      : "bg-accent-secondary"
                                      }`}
                                    style={{ width: `${Math.min(100, (item.faskes / 200) * 100)}%` }} // Max reference 200 units
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* SECTION 3: METADATA DASHBOARD */}
          <section id="metadata" className="scroll-mt-24 space-y-6">
            <h3 className="font-heading text-xl text-text-primary flex items-center gap-2">
              <span className="w-1.5 h-6 bg-accent-primary rounded-full"></span>
              Metadata Kamus Indikator
            </h3>

            <p className="font-sans text-text-secondary text-sm sm:text-base leading-relaxed">
              Tabel operasional di bawah mendefinisikan batas lingkup indikator, formula representasi, tahun pendataan,
              dan validasi sumber hukum data sekunder hasil ekstraksi (ETL) yang dipergunakan dalam visualisasi dashboard ini.
            </p>

            <div className="overflow-x-auto rounded-xl border border-card-border shadow-xs bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-card-border text-text-secondary font-sans font-semibold">
                    <th className="p-3.5 w-1/4">Indikator</th>
                    <th className="p-3.5 w-2/5">Definisi Operasional</th>
                    <th className="p-3.5 text-center">Unit Analisis</th>
                    <th className="p-3.5 text-center">Tipe</th>
                    <th className="p-3.5 text-center">Tahun</th>
                    <th className="p-3.5">Sumber Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border text-text-secondary leading-relaxed">
                  {metadataRows.map((row) => (
                    <tr key={row.indicator} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3.5 font-bold text-text-primary">{row.indicator}</td>
                      <td className="p-3.5 font-sans">{row.definition}</td>
                      <td className="p-3.5 text-center font-sans">{row.unit}</td>
                      <td className="p-3.5 text-center font-sans">
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
                          {row.dataType}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-sans font-medium">{row.year}</td>
                      <td className="p-3.5 font-sans text-xs">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: UNDUH DATA DASHBOARD */}
          <section id="unduh" className="scroll-mt-24 space-y-6">
            <h3 className="font-heading text-xl text-text-primary flex items-center gap-2">
              <span className="w-1.5 h-6 bg-accent-primary rounded-full"></span>
              Ekspor & Unduh Data Spasial Tabular
            </h3>

            <p className="font-sans text-text-secondary text-sm sm:text-base leading-relaxed">
              Anda dapat memilih berkas peta komposit kebencanaan, rekapitulasi numerik korban bencana, serta database spasial
              kabupaten di bawah ini untuk disimpan di perangkat lokal dalam format standar ekspor data.
            </p>

            <div className="card p-6 space-y-6">

              {/* Checklist Table */}
              <div className="overflow-x-auto rounded-lg border border-card-border">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-card-border text-text-secondary font-sans font-semibold">
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isAllDownloadsChecked}
                          onChange={handleSelectAllDownloads}
                          className="w-4 h-4 rounded-sm border-gray-300 text-accent-primary focus:ring-accent-primary/20 cursor-pointer"
                        />
                      </th>
                      <th className="p-3">Nama Berkas Database / Peta Spasial</th>
                      <th className="p-3 text-center">Format</th>
                      <th className="p-3 text-center">Ukuran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border text-text-secondary">
                    {downloadFiles.map((file) => (
                      <tr
                        key={file.id}
                        className={`hover:bg-slate-50/50 transition-colors ${checkedDownloads[file.id] ? "bg-accent-primary/5 font-medium" : ""
                          }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={!!checkedDownloads[file.id]}
                            onChange={() => handleCheckboxChange(file.id)}
                            className="w-4 h-4 rounded-sm border-gray-300 text-accent-primary focus:ring-accent-primary/20 cursor-pointer"
                          />
                        </td>
                        <td className="p-3 font-sans text-text-primary">{file.name}</td>
                        <td className="p-3 text-center font-sans">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${file.format === "GeoJSON"
                            ? "bg-purple-100 text-purple-700"
                            : file.format === "XLSX"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                            }`}>
                            {file.format}
                          </span>
                        </td>
                        <td className="p-3 text-center font-sans text-text-light">{file.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Downloader buttons */}
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-card-border">
                <span className="text-xs text-text-light font-sans">
                  {downloadFiles.filter(f => checkedDownloads[f.id]).length} dari {downloadFiles.length} berkas dipilih untuk diekspor.
                </span>

                <div className="flex gap-3">
                  {/* Select All shortcut */}
                  <button
                    onClick={() => {
                      const noneChecked = Object.keys(checkedDownloads).length === 0;
                      const updated = {};
                      if (noneChecked) {
                        downloadFiles.forEach(f => {
                          updated[f.id] = true;
                        });
                      }
                      setCheckedDownloads(updated);
                    }}
                    className="btn btn-secondary !px-4 !py-2 text-xs"
                  >
                    Reset Pilihan
                  </button>

                  {/* Primary Download trigger */}
                  <button
                    onClick={handleDownloadTrigger}
                    className="btn btn-primary !px-6 !py-2 text-xs flex items-center gap-2 shadow-md hover:scale-[1.02]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    DOWNLOAD SELEKSI
                  </button>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

    </div>
  );
}