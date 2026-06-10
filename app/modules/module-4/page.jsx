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

export default function Modul4Page() {
  // Navigation Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  // Cascading Filters States
  const [selectedProvinsi, setSelectedProvinsi] = useState("Semua Provinsi");
  const [selectedKabupaten, setSelectedKabupaten] = useState("");

  // Carousel Slider States
  const [sliderIndex, setSliderIndex] = useState(0);

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

        <div className="max-w-6xl mx-auto space-y-16 relative z-10">

          {/* Header Dashboard */}
          <div className="border-b border-card-border pb-6">
            <h1 className="font-heading text-text-primary text-3xl sm:text-4xl">
              Profil Kerentanan Wilayah
            </h1>
            <p className="subheading text-sm sm:text-base mt-2">
              Analisis Komprehensif Risiko Kebencanaan Provinsi Aceh, Sumatera Utara, dan Sumatera Barat Tahun 2025
            </p>
          </div>

          {/* SECTION 1: OVERVIEW */}
          <section id="overview" className="scroll-mt-24 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Background Text & Hero Image */}
              <div className="lg:col-span-7 space-y-6">
                <h3 className="font-heading text-xl text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-accent-primary rounded-full"></span>
                  Latar Belakang & Konteks Wilayah
                </h3>
                <div className="font-sans text-text-secondary leading-relaxed space-y-4 text-sm sm:text-base">
                  <p>
                    Pada tahun 2025, sejumlah wilayah di Pulau Sumatra, khususnya Provinsi <strong>Aceh</strong>, <strong>Sumatera Utara</strong>, dan <strong>Sumatera Barat</strong>,
                    mengalami kejadian banjir dan tanah longsoryang menimbulkan dampak signifikan terhadap masyarakat, infrastruktur, serta aktivitas ekonomi.
                    Kondisi tersebut menunjukkan bahwa tingkat kerentanan suatu wilayah tidak hanya dipengaruhi oleh kejadian bencana alam yang tinggi,
                    tetapi juga oleh karakteristik sensitivitas lingkungan serta masyarakat dan kapasitas wilayah dalam menghadapi bencana.
                  </p>
                  <p>
                    Dashboard Profil Kerentanan Wilayah ini disusun untuk memberikan gambaran komprehensif mengenai faktor-faktor yang memengaruhi
                    kerentanan banjir dan tanah longsor di Aceh, Sumatera Utara, dan Sumatera Barat, sehingga dapat menjadi dasar dalam mendukung
                    upaya mitigasi, perencanaan pembangunan yang lebih tangguh, serta pengambilan keputusan yang berbasis data dalam pengurangan risiko bencana.
                  </p>
                </div>

                {/* Hero Frame Image */}
                <div className="relative rounded-xl overflow-hidden border border-card-border shadow-md aspect-video group bg-slate-100">
                  <img
                    src="/module-4/Frame 1.png"
                    alt="Visualisasi Dekorasi Peta Kerentanan Sumatera"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      // Fallback visual design if the asset doesn't exist
                      e.target.style.display = "none";
                    }}
                  />
                  {/* Backup visual inside if image fails to load */}
                  <div className="absolute inset-0 bg-linear-to-tr from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-end p-6">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent-secondary mb-1">Peta Tematik Utama</span>
                    <h4 className="text-white text-base font-heading">Sistem Pemetaan Koridor Bukit Barisan</h4>
                    <p className="text-slate-400 text-xs mt-1 font-sans">
                      Visualisasi spasial gabungan parameter curah hujan bulanan tinggi dan sebaran kemiringan lereng kritis pulau Sumatra bagian utara.
                    </p>
                  </div>
                </div>
              </div>

              {/* Macro Metrics Visualizations */}
              <div className="lg:col-span-5 space-y-6">
                <h3 className="font-heading text-xl text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-accent-secondary rounded-full"></span>
                  Visualisasi Makro Kebencanaan (2025)
                </h3>

                <div className="card p-6 space-y-6">
                  <div className="border-b border-card-border pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-text-light">Ringkasan Korban & Kerusakan</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-card-border">
                      <span className="text-xxs uppercase tracking-wider text-text-secondary block font-sans">Total Korban Jiwa</span>
                      <span className="text-3xl font-heading text-accent-danger font-bold block mt-1">
                        {Object.values(dataOverview).reduce((a, b) => a + b.korbanJiwa, 0)}
                      </span>
                      <span className="text-[10px] text-text-light font-sans block mt-1">Orang meninggal / hilang</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-card-border">
                      <span className="text-xxs uppercase tracking-wider text-text-secondary block font-sans">Kerusakan Rumah</span>
                      <span className="text-3xl font-heading text-accent-warning font-bold block mt-1">
                        {Object.values(dataOverview).reduce((a, b) => a + b.rumahRusak, 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-text-light font-sans block mt-1">Unit terdampak parah</span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bars for Tiny Percentages */}
                  <div className="space-y-4 pt-2">
                    <span className="text-xs font-semibold text-text-primary block">Rata-rata Proporsi Wilayah Terdampak Bencana</span>

                    {/* FLOOD PCT PROGRESS BAR */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-sans font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
                          Terdampak Banjir
                        </span>
                        <span className="font-bold text-accent-primary font-heading">
                          {(Object.values(dataOverview).reduce((a, b) => a + b.banjirPct, 0) / 3).toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        {/* We use a scaling multiplier since percentages are naturally < 1%, to make it visually informative */}
                        <div
                          className="h-full bg-linear-to-r from-accent-primary to-accent-secondary rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (Object.values(dataOverview).reduce((a, b) => a + b.banjirPct, 0) / 3) * 60)}%` }}
                          title="Visual scale: 1% fills 60% of progress track"
                        ></div>
                      </div>
                      <span className="text-[9px] text-text-light italic font-sans block">
                        *Skala visual disesuaikan (1% terisi 60% bar) untuk memperjelas angka fraksi kecil.
                      </span>
                    </div>

                    {/* LANDSLIDE PCT PROGRESS BAR */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-text-secondary font-sans font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent-danger"></span>
                          Terdampak Tanah Longsor
                        </span>
                        <span className="font-bold text-accent-danger font-heading">
                          {(Object.values(dataOverview).reduce((a, b) => a + b.longsorPct, 0) / 3).toFixed(2)}%
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-linear-to-r from-accent-warning to-accent-danger rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (Object.values(dataOverview).reduce((a, b) => a + b.longsorPct, 0) / 3) * 60)}%` }}
                          title="Visual scale: 1% fills 60% of progress track"
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Province Comparison breakdown */}
                  <div className="mt-4 pt-4 border-t border-card-border space-y-2.5">
                    <span className="text-xs font-semibold text-text-primary block">Rincian Per Provinsi:</span>
                    {Object.entries(dataOverview).map(([prov, stats]) => (
                      <div key={prov} className="flex items-center justify-between text-xs py-1 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                        <span className="text-text-primary font-medium">{prov}</span>
                        <div className="flex gap-4 font-sans text-text-secondary">
                          <span>Korban: <strong className="text-text-primary">{stats.korbanJiwa}</strong></span>
                          <span>Rumah: <strong className="text-text-primary">{stats.rumahRusak.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

            </div>

            {/* Slider Mockup Carousel */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text-primary block">
                  Simulasi Skenario & Rencana Kontinjensi Daerah
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={prevSlide}
                    className="w-9 h-9 rounded-full bg-white border border-card-border hover:bg-slate-100 text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextSlide}
                    className="w-9 h-9 rounded-full bg-white border border-card-border hover:bg-slate-100 text-text-primary flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Slider Content Wrapper */}
              <div className="relative w-full h-[260px] sm:h-[220px] overflow-hidden flex items-center justify-center px-4">
                {simulationSlides.map((slide, idx) => {
                  // Calculate relative offset of slides
                  let position = "translate-x-full opacity-0 pointer-events-none scale-75";
                  if (idx === sliderIndex) {
                    position = "opacity-100 z-20 scale-100 rotate-0 translate-x-0";
                  } else if (idx === (sliderIndex - 1 + simulationSlides.length) % simulationSlides.length) {
                    position = "-translate-x-[40%] opacity-40 z-10 scale-90 blur-xs md:blur-sm pointer-events-none";
                  } else if (idx === (sliderIndex + 1) % simulationSlides.length) {
                    position = "translate-x-[40%] opacity-40 z-10 scale-90 blur-xs md:blur-sm pointer-events-none";
                  }

                  return (
                    <div
                      key={slide.id}
                      className={`absolute w-full max-w-2xl p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between transition-all duration-500 ease-out ${slide.visualStyle} ${slide.glowColor} ${position}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-accent-primary">
                            {slide.region}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${slide.metricColor}`}>
                            {slide.metricLabel}: {slide.metricValue}
                          </span>
                        </div>
                        <h4 className="text-white text-base sm:text-lg font-heading mt-3 leading-snug">
                          {slide.title}
                        </h4>
                        <p className="text-slate-300 text-xs mt-2 font-sans leading-relaxed">
                          {slide.desc}
                        </p>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400">
                        <span>Status: <strong>Siaga Operasional</strong></span>
                        <span>Update: <strong>Real-time</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-1.5 mt-2">
                {simulationSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSliderIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${idx === sliderIndex ? "bg-accent-primary w-6" : "bg-slate-300"
                      }`}
                  ></button>
                ))}
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