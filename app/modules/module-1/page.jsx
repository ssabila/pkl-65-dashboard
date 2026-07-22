"use client";

import React from 'react';
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

// --- MOCK DATA ---
const pieData = [
  { name: 'Hutan', value: 41, color: '#22c55e' },
  { name: 'Pertanian', value: 28, color: '#eab308' },
  { name: 'Perkebunan', value: 15, color: '#f97316' },
  { name: 'Lahan Terbuka', value: 8, color: '#ef4444' },
  { name: 'Pemukiman', value: 6, color: '#a855f7' },
  { name: 'Perairan', value: 2, color: '#3b82f6' },
];

const deforestasiData = [
  { year: '2019', value: 32.1 },
  { year: '2020', value: 29.7 },
  { year: '2021', value: 27.5 },
  { year: '2022', value: 25.3 },
  { year: '2023', value: 23.6 },
  { year: '2024', value: 21.8 },
  { year: '2025', value: 20.1 },
];

const curahHujanData = [
  { year: '2019', value: 1850 },
  { year: '2020', value: 1980 },
  { year: '2021', value: 2015 },
  { year: '2022', value: 1970 },
  { year: '2023', value: 2090 },
  { year: '2024', value: 2340 },
  { year: '2025', value: 2106 },
];

export default function Modul1Page() {
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
              2019 - 2025
            </div>
          </div>
          <button className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-2.5 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-sm border border-white transition-all text-blue-700 font-medium">
            <CloudDownload size={20} />
            Export
          </button>
        </div>

        {/* --- TOP METRICS ROW --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard title="Elevasi Maksimum" value="3.800" unit="mdpl" icon={<Mountain size={24} className="text-blue-500" />} />
          <MetricCard title="Rata-rata slope" value="18" unit="derajat" icon={<TrendingDown size={24} className="text-slate-500" />} />
          <MetricCard title="Wilayah Curam" value="67%" unit=">15" icon={<Mountain size={24} className="text-blue-400" />} />
          <MetricCard title="Drainage Density" value="2,43" unit="km/km2" icon={<Droplets size={24} className="text-blue-300" />} />
          <MetricCard title="NDVI Rata-rata" value="0,62" unit="indeks" icon={<MapIcon size={24} className="text-green-500" />} />
          <MetricCard title="Elevasi Maksimum" value="-21.3%" unit="per tahun" icon={<Mountain size={24} className="text-orange-500" />} isTrend />
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SECTION (Charts & Map) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Donut Chart */}
              <GlassCard className="flex flex-col">
                <h3 className="font-bold text-slate-800">Distribusi Tutupan Lahan</h3>
                <p className="text-xs text-slate-500 mb-4">Persentase Luas Wilayah</p>
                <div className="flex-1 min-h-[200px] relative">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-y-0 right-0 flex flex-col justify-center gap-1 text-[10px]">
                     {pieData.map(item => (
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
                <h3 className="font-bold text-slate-800 text-sm">Deforestasi Historis (2019-2025)</h3>
                <p className="text-[10px] text-slate-500 mb-2">Perubahan Luas Tutupan Hutan</p>
                <div className="flex-1 min-h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deforestasiData} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val}K`} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Bar dataKey="value" fill="#69d2a1" radius={[4, 4, 0, 0]} maxBarSize={30}>
                        <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fill: '#475569', fontWeight: 600 }} formatter={(val) => `${val}K`} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Line Chart Curah Hujan */}
              <GlassCard className="flex flex-col">
                <h3 className="font-bold text-slate-800 text-sm">Curah Hujan Tahunan (2019-2025)</h3>
                <p className="text-[10px] text-slate-500 mb-2">Rata-rata curah hujan (mm/tahun)</p>
                <div className="flex-1 min-h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={curahHujanData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

            </div>

            {/* Map & Index Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Map Section */}
              <GlassCard className="md:col-span-2 p-0 overflow-hidden relative min-h-[350px]">
                
                {/* Map Component */}
                <div className="absolute inset-0 z-0">
                  <MapComponent />
                </div>
                
                {/* Overlay Options */}
                <div className="absolute left-4 top-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg w-48 z-10 border border-white">
                  <p className="text-xs font-bold text-blue-900 mb-2">OPSI TAMPILAN</p>
                  <div className="space-y-3 text-xs">
                    {['Batas Provinsi', 'Batas Kabupaten', 'Batas Kecamatan', 'Nama Wilayah'].map((opt, i) => (
                      <div key={opt} className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">{opt}</span>
                        <div className={`w-7 h-4 rounded-full relative cursor-pointer transition-colors ${i < 3 ? 'bg-blue-500' : 'bg-slate-300'}`}>
                           <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${i < 3 ? 'right-0.5' : 'left-0.5'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute left-4 bottom-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg z-10 border border-white text-[10px]">
                  <p className="font-bold text-slate-800 mb-2">Legenda Elevasi (mdpl)</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-red-600"></span>{'> 3.500'}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-red-400"></span>{'2.500 - 3.500'}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-yellow-400"></span>{'1.500 - 2.500'}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-300"></span>{'500 - 1.500'}</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-600"></span>{'0 - 500'}</div>
                  </div>
                </div>

              </GlassCard>

              {/* Vulnerability Index */}
              <GlassCard className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                  <ShieldAlert size={24} />
                </div>
                <h3 className="font-bold text-slate-800">Indeks Kerentanan Fisik Aceh</h3>
                <div className="text-5xl font-bold text-red-500 my-2">73,2</div>
                <div className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full mb-4">Kategori: Tinggi</div>
                
                <div className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full relative mt-4">
                  <div className="absolute top-1/2 -translate-y-1/2 right-[25%] w-4 h-4 bg-white border-2 border-red-500 rounded-full shadow"></div>
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
          <div className="lg:col-span-3 space-y-6">
            
            {/* Filters */}
            <GlassCard className="space-y-4">
               <FilterDropdown label="Provinsi" value="Aceh" />
               <FilterDropdown label="Kabupaten/Kota" value="Semua" />
               <FilterDropdown label="Provinsi" value="Semua" />
            </GlassCard>

            {/* Top 5 List */}
            <GlassCard>
              <h3 className="font-bold text-slate-800 mb-1">Top 5 Kecamatan Rentan</h3>
              <p className="text-[10px] text-slate-500 mb-4">Berdasarkan <span className="bg-white border px-2 py-0.5 rounded text-slate-700">Elevasi</span></p>
              
              <div className="space-y-4">
                {[
                  { rank: 1, name: 'Kec. Kuta Alam', score: 0.812, color: 'bg-red-500' },
                  { rank: 2, name: 'Kec. Kuta Alam', score: 0.782, color: 'bg-orange-500' },
                  { rank: 3, name: 'Kec. Kuta Alam', score: 0.602, color: 'bg-yellow-500' },
                  { rank: 4, name: 'Kec. Kuta Alam', score: 0.534, color: 'bg-green-400' },
                  { rank: 5, name: 'Kec. Kuta Alam', score: 0.431, color: 'bg-green-500' },
                ].map((item) => (
                  <div key={item.rank} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${item.color} text-white flex items-center justify-center text-xs font-bold`}>
                      {item.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="text-slate-500 text-xs">{item.score}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.score * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
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

function MetricCard({ title, value, unit, icon, isTrend }) {
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
          <span className={`text-xl md:text-2xl font-bold ${isTrend ? 'text-orange-500' : 'text-blue-600'}`}>{value}</span>
          <span className="text-[10px] text-slate-500">{unit}</span>
        </div>
      </div>
    </GlassCard>
  );
}

function FilterDropdown({ label, value }) {
  return (
    <div>
      <label className="text-[11px] text-slate-500 mb-1 block ml-1">{label}</label>
      <div className="w-full bg-white border border-slate-200 rounded-lg p-2.5 flex justify-between items-center text-sm text-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
        {value}
        <ChevronDown size={16} className="text-slate-400" />
      </div>
    </div>
  );
}