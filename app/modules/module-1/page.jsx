"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from "next/link";
import dynamic from 'next/dynamic';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
  LineChart, Line
} from 'recharts';
import { 
  CloudDownload, Mountain, TrendingDown, Droplets, 
  Map as MapIcon, ChevronDown, ShieldAlert
} from 'lucide-react';

// Import peta secara dinamis dengan mematikan SSR
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
      <div className="text-blue-500 font-medium animate-pulse">Memuat Peta...</div>
    </div>
  ),
});

// --- MOCK DATA (Fallback jika data tidak tersedia) ---
const mockPieData = [
  { name: 'Hutan', value: 41, color: '#22c55e' },
  { name: 'Pertanian', value: 28, color: '#eab308' },
  { name: 'Perkebunan', value: 15, color: '#f97316' },
  { name: 'Lahan Terbuka', value: 8, color: '#ef4444' },
  { name: 'Pemukiman', value: 6, color: '#a855f7' },
  { name: 'Perairan', value: 2, color: '#3b82f6' },
];

export default function Modul1Page() {
  const [rawData, setRawData] = useState([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState('Semua');
  const [selectedKabupaten, setSelectedKabupaten] = useState('Semua');

  // Fetch Data
  useEffect(() => {
    fetch('/data/modul1_fisik.json')
      .then(res => res.json())
      .then(data => setRawData(data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  // Extract Dropdown Options
  const provinsiOptions = useMemo(() => {
    return [...new Set(rawData.map(d => d.provinsi))].sort();
  }, [rawData]);

  const kabupatenOptions = useMemo(() => {
    let filtered = rawData;
    if (selectedProvinsi !== 'Semua') {
      filtered = filtered.filter(d => d.provinsi === selectedProvinsi);
    }
    return [...new Set(filtered.map(d => d.nm_kabupaten))].sort();
  }, [rawData, selectedProvinsi]);


  // Handle Dropdown Changes
  const handleProvinsiChange = (val) => {
    setSelectedProvinsi(val);
    setSelectedKabupaten('Semua'); // Reset kabupaten when provinsi changes
  };

  const handleKabupatenChange = (val) => {
    setSelectedKabupaten(val);
  };

  // Filter Data for Metrics
  const filteredData = useMemo(() => {
    let filtered = rawData;
    if (selectedProvinsi !== 'Semua') {
      filtered = filtered.filter(d => d.provinsi === selectedProvinsi);
    }
    if (selectedKabupaten !== 'Semua') {
      filtered = filtered.filter(d => d.nm_kabupaten === selectedKabupaten);
    }
    return filtered;
  }, [rawData, selectedProvinsi, selectedKabupaten]);

  // Compute Metrics
  const metrics = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const count = filteredData.length;
    let maxElev = 0;
    let sumSlope = 0;
    let sumDrainage = 0;
    let sumNdvi = 0;
    let curamCount = 0;
    
    // Akumulasi deforestasi per tahun untuk tren
    let totalDefor2019 = 0;
    let totalDefor2023 = 0;
    
    filteredData.forEach(d => {
      const b = d.biofisik || {};
      const elev = b.elevasi?.max_mdpl || 0;
      const slope = b.topografi?.slope_mean_deg || 0;
      const drain = b.hidrologi?.drainage_density || 0;
      const ndvi = b.vegetasi_ndvi?.ndvi_mean_historis || 0;
      
      if (elev > maxElev) maxElev = elev;
      sumSlope += slope;
      sumDrainage += drain;
      sumNdvi += ndvi;
      if (slope > 15) curamCount++;

      totalDefor2019 += b.deforestasi_ha?.th_2019 || 0;
      totalDefor2023 += b.deforestasi_ha?.th_2023 || 0;
    });

    // Hitung tren deforestasi: perubahan % dari 2019 ke 2023
    let deforestasiTren = null;
    let deforestasiTrenText = 'N/A';
    let deforestasiTrenColor = 'text-slate-500';
    if (totalDefor2019 > 0) {
      deforestasiTren = ((totalDefor2023 - totalDefor2019) / totalDefor2019) * 100;
      const sign = deforestasiTren >= 0 ? '+' : '';
      deforestasiTrenText = `${sign}${deforestasiTren.toFixed(1)}%`;
      // Naik = lebih banyak deforestasi = buruk (merah), turun = membaik (hijau)
      deforestasiTrenColor = deforestasiTren > 0 ? 'text-red-500' : 'text-green-600';
    }

    const sumErosi = filteredData.reduce((acc, d) => acc + (d.model_rusle?.laju_erosi_ton_ha_thn || 0), 0);
    const avgErosi = count > 0 ? (sumErosi / count) : 0;
    
    let erosiKategori = "Rendah";
    let erosiColorText = "text-green-500";
    let erosiColorBg = "bg-green-50";
    let erosiPercent = (avgErosi / 160) * 100;
    if (erosiPercent > 100) erosiPercent = 100;

    if (avgErosi > 130) {
      erosiKategori = "Sangat Tinggi";
      erosiColorText = "text-red-500";
      erosiColorBg = "bg-red-50";
    } else if (avgErosi > 65) {
      erosiKategori = "Tinggi";
      erosiColorText = "text-orange-500";
      erosiColorBg = "bg-orange-50";
    } else if (avgErosi > 30) {
      erosiKategori = "Sedang";
      erosiColorText = "text-yellow-500";
      erosiColorBg = "bg-yellow-50";
    }

    return {
      maxElev: Math.round(maxElev).toLocaleString('id-ID'),
      avgSlope: (sumSlope / count).toFixed(1),
      curamPercent: Math.round((curamCount / count) * 100),
      avgDrainage: (sumDrainage / count).toFixed(2),
      avgNdvi: (sumNdvi / count).toFixed(2),
      avgErosi: avgErosi.toFixed(1),
      erosiKategori,
      erosiColorText,
      erosiColorBg,
      erosiPercent,
      deforestasiTrenText,
      deforestasiTrenColor,
    };
  }, [filteredData]);

  // Compute Charts Data
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return { deforestasi: [], ndvi: [] };
    
    let sumDefor = { '2019': 0, '2020': 0, '2021': 0, '2022': 0, '2023': 0 };
    let sumNdvi = { '2019': 0, '2020': 0, '2021': 0, '2022': 0, '2023': 0, '2024': 0, '2025': 0 };
    
    filteredData.forEach(d => {
      const defor = d.biofisik?.deforestasi_ha || {};
      const ndvi = d.biofisik?.vegetasi_ndvi || {};
      
      sumDefor['2019'] += defor.th_2019 || 0;
      sumDefor['2020'] += defor.th_2020 || 0;
      sumDefor['2021'] += defor.th_2021 || 0;
      sumDefor['2022'] += defor.th_2022 || 0;
      sumDefor['2023'] += defor.th_2023 || 0;

      sumNdvi['2019'] += ndvi.ndvi_2019 || 0;
      sumNdvi['2020'] += ndvi.ndvi_2020 || 0;
      sumNdvi['2021'] += ndvi.ndvi_2021 || 0;
      sumNdvi['2022'] += ndvi.ndvi_2022 || 0;
      sumNdvi['2023'] += ndvi.ndvi_2023 || 0;
      sumNdvi['2024'] += ndvi.ndvi_2024 || 0;
      sumNdvi['2025'] += ndvi.ndvi_2025 || 0;
    });

    const count = filteredData.length;

    return {
      deforestasi: [
        { year: '2019', value: Math.round(sumDefor['2019']) },
        { year: '2020', value: Math.round(sumDefor['2020']) },
        { year: '2021', value: Math.round(sumDefor['2021']) },
        { year: '2022', value: Math.round(sumDefor['2022']) },
        { year: '2023', value: Math.round(sumDefor['2023']) },
      ],
      ndvi: [
        { year: '2019', value: Number((sumNdvi['2019'] / count).toFixed(3)) },
        { year: '2020', value: Number((sumNdvi['2020'] / count).toFixed(3)) },
        { year: '2021', value: Number((sumNdvi['2021'] / count).toFixed(3)) },
        { year: '2022', value: Number((sumNdvi['2022'] / count).toFixed(3)) },
        { year: '2023', value: Number((sumNdvi['2023'] / count).toFixed(3)) },
        { year: '2024', value: Number((sumNdvi['2024'] / count).toFixed(3)) },
        { year: '2025', value: Number((sumNdvi['2025'] / count).toFixed(3)) },
      ]
    };
  }, [filteredData]);

  // Compute Top 5 Kecamatan
  const topKecamatan = useMemo(() => {
    // Top 5 kecamatan tetap mengikuti filter Provinsi dan Kabupaten saja
    let dataForTop5 = rawData;
    if (selectedProvinsi !== 'Semua') {
      dataForTop5 = dataForTop5.filter(d => d.provinsi === selectedProvinsi);
    }
    if (selectedKabupaten !== 'Semua') {
      dataForTop5 = dataForTop5.filter(d => d.nm_kabupaten === selectedKabupaten);
    }

    // Sort by Laju Erosi (Vulnerability)
    const sorted = [...dataForTop5].sort((a, b) => {
      const erosiA = a.model_rusle?.laju_erosi_ton_ha_thn || 0;
      const erosiB = b.model_rusle?.laju_erosi_ton_ha_thn || 0;
      return erosiB - erosiA; // Descending
    });
    
    // Ambil top 5, pastikan ada nilai maksimum untuk skala progress bar
    const top5 = sorted.slice(0, 5);
    const maxErosi = top5.length > 0 ? (top5[0].model_rusle?.laju_erosi_ton_ha_thn || 1) : 1;
    const colors = ['bg-red-600', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-yellow-400'];

    return top5.map((d, idx) => ({
      rank: idx + 1,
      name: d.nm_kecamatan,
      kabupaten: d.nm_kabupaten,
      score: (d.model_rusle?.laju_erosi_ton_ha_thn || 0).toFixed(1),
      percent: Math.min(((d.model_rusle?.laju_erosi_ton_ha_thn || 0) / maxErosi) * 100, 100),
      color: colors[idx] || 'bg-slate-400'
    }));
  }, [filteredData]);

  // Loading state
  if (rawData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Memuat Data Wilayah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed text-slate-800 p-4 md:p-8 font-sans" 
         style={{ backgroundImage: "url('/bg-modul1.png')" }}>
      
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 drop-shadow-sm">
              Konteks Medan Sebelum Bencana
            </h1>
            <p className="text-slate-600 text-lg mt-1">Karakteristik Fisik & Kondisi Lingkungan</p>
            <div className="mt-2 inline-block px-4 py-1 bg-white/60 backdrop-blur-md rounded-full text-blue-800 font-semibold border border-white/50 shadow-sm">
              {selectedProvinsi === 'Semua' ? 'Sumatera' : selectedProvinsi} {selectedKabupaten !== 'Semua' && `> ${selectedKabupaten}`}
            </div>
          </div>
          <button className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-sm border border-white transition-all text-blue-700 font-medium">
            <CloudDownload size={20} />
            Export
          </button>
        </div>

        {/* --- TOP METRICS ROW --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard title="Elevasi Maksimum" value={metrics?.maxElev || "0"} unit="mdpl" icon={<Mountain size={24} className="text-blue-500" />} />
          <MetricCard title="Rata-rata Slope" value={metrics?.avgSlope || "0"} unit="derajat" icon={<TrendingDown size={24} className="text-slate-500" />} />
          <MetricCard title="Wilayah Curam" value={metrics?.curamPercent || "0"} unit="% > 15°" icon={<Mountain size={24} className="text-blue-400" />} />
          <MetricCard title="Drainage Density" value={metrics?.avgDrainage || "0"} unit="km/km²" icon={<Droplets size={24} className="text-blue-300" />} />
          <MetricCard title="NDVI Rata-rata" value={metrics?.avgNdvi || "0"} unit="indeks" icon={<MapIcon size={24} className="text-green-500" />} />
          {/* Trend deforestasi dihitung dari data nyata 2019→2023 */}
          <MetricCard 
            title="Tren Deforestasi" 
            value={metrics?.deforestasiTrenText || 'N/A'} 
            unit="2019→2023" 
            icon={<Mountain size={24} className={metrics?.deforestasiTrenColor?.replace('text-', 'text-') || 'text-orange-500'} />} 
            trendColor={metrics?.deforestasiTrenColor}
          />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SECTION (Charts & Map) */}
          <div className="lg:col-span-9 space-y-6 order-last lg:order-first">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Donut Chart (Mock) */}
              <GlassCard className="flex flex-col">
                <h3 className="font-bold text-slate-800">Estimasi Tutupan Lahan</h3>
                <p className="text-xs text-slate-500 mb-4">Persentase Luas Wilayah</p>
                <div className="flex-1 min-h-[200px] relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mockPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {mockPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-y-0 right-0 flex flex-col justify-center gap-1 text-[10px]">
                     {mockPieData.map(item => (
                       <div key={item.name} className="flex items-center gap-1">
                         <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                         <span>{item.name} {item.value}%</span>
                       </div>
                     ))}
                  </div>
                </div>
              </GlassCard>

              {/* Bar Chart Deforestasi */}
              <GlassCard className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm">Deforestasi (2019-2023)</h3>
                <p className="text-[10px] text-slate-500 mb-2">Total Kehilangan Tutupan (Ha)</p>
                <div className="flex-1 min-h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.deforestasi} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => [`${val.toLocaleString('id-ID')} Ha`, 'Deforestasi']} />
                      <Bar dataKey="value" fill="#69d2a1" radius={[4, 4, 0, 0]} maxBarSize={30}>
                        <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fill: '#475569', fontWeight: 600 }} formatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Line Chart NDVI */}
              <GlassCard className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm">Tren NDVI (2019-2025)</h3>
                <p className="text-[10px] text-slate-500 mb-2">Indeks Kerapatan Vegetasi Rata-rata</p>
                <div className="flex-1 min-h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.ndvi} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(val) => [val, 'NDVI']} />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

            </div>

            {/* Map & Index Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Map Section */}
              <GlassCard className="md:col-span-2 p-0 overflow-hidden relative min-h-[420px]">
                <div className="absolute inset-0">
                  <MapComponent
                    rawData={rawData}
                    selectedProvinsi={selectedProvinsi}
                    selectedKabupaten={selectedKabupaten}
                    onKabupatenClick={(kabName, provName) => {
                      if (kabName === 'Semua') {
                        handleKabupatenChange('Semua');
                      } else {
                        if (provName) setSelectedProvinsi(provName);
                        handleKabupatenChange(kabName);
                      }
                    }}
                    onReset={() => {
                      setSelectedProvinsi('Semua');
                      setSelectedKabupaten('Semua');
                    }}
                  />
                </div>
              </GlassCard>

              {/* Vulnerability Index */}
              <GlassCard className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="font-bold text-slate-800">Indeks Kerentanan Fisik Wilayah</h3>
                {/* Rata-rata Laju Erosi */}
                <div className={`text-5xl font-bold ${metrics?.erosiColorText} my-2`}>
                  {metrics?.avgErosi || "0.0"}
                </div>
                <div className={`text-xs ${metrics?.erosiColorText} ${metrics?.erosiColorBg} px-3 py-1 rounded-full mb-2 font-medium`}>
                  Laju Erosi (Ton/Ha/Thn)
                </div>
                <div className={`text-[10px] font-bold ${metrics?.erosiColorText} uppercase tracking-wider mb-2`}>
                  {metrics?.erosiKategori}
                </div>
                
                <div className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-500 to-red-600 rounded-full relative mt-3">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-300 rounded-full shadow transition-all duration-500"
                    style={{ left: `calc(${metrics?.erosiPercent || 0}% - 8px)` }}
                  ></div>
                </div>
                <div className="flex justify-between w-full text-[10px] text-slate-500 mt-2">
                  <span>Rendah</span>
                  <span>Sedang</span>
                  <span>Tinggi</span>
                  <span>Sangat Tinggi</span>
                </div>
              </GlassCard>
            </div>

          </div>

          {/* RIGHT SECTION (Filters & List) */}
          <div className="lg:col-span-3 space-y-6 order-first lg:order-last">
            
            {/* Filters */}
            <GlassCard className="space-y-4">
               <FilterDropdown 
                 label="Provinsi" 
                 value={selectedProvinsi} 
                 options={provinsiOptions}
                 onChange={handleProvinsiChange} 
               />
               <FilterDropdown 
                 label="Kabupaten/Kota" 
                 value={selectedKabupaten} 
                 options={kabupatenOptions}
                 onChange={handleKabupatenChange} 
               />
            </GlassCard>

            {/* Top 5 List */}
            <GlassCard>
              <h3 className="font-bold text-slate-800 mb-1">Top 5 Kecamatan Rentan</h3>
              <p className="text-[10px] text-slate-500 mb-4">Berdasarkan <span className="bg-white border px-2 py-0.5 rounded text-slate-700">Laju Erosi Tertinggi</span></p>
              
              <div className="space-y-4">
                {topKecamatan.length > 0 ? topKecamatan.map((item) => (
                  <div key={item.rank} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${item.color} text-white flex items-center justify-center text-xs font-bold`}>
                      {item.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 leading-tight">{item.name}</span>
                          <span className="text-[9px] text-slate-400">{item.kabupaten}</span>
                        </div>
                        <span className="text-slate-500 text-xs font-semibold">{item.score}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-4">Data tidak tersedia</p>
                )}
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function MetricCard({ title, value, unit, icon, trendColor }) {
  const valueColor = trendColor || 'text-blue-600';
  return (
    <GlassCard className="flex flex-col justify-between p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shadow-inner">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-medium mb-1 leading-tight">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl md:text-2xl font-bold ${valueColor}`}>{value}</span>
          <span className="text-[10px] text-slate-500">{unit}</span>
        </div>
      </div>
    </GlassCard>
  );
}

function FilterDropdown({ label, value, options = [], onChange }) {
  return (
    <div>
      <label className="text-[11px] text-slate-500 mb-1 block ml-1">{label}</label>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 appearance-none text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Semua">Semua {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}