'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ currentMode = 0 }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const markerGroupRef = useRef(null);
  const roadGroupRef = useRef(null);

  const getStyleByMode = (feature, mode) => {
    const name = feature.properties.NAME_2 || feature.properties.KABKOT || "";
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    if (mode === 1) {
      const depthScale = hash % 4; 
      const colorsPuncak = ['#e6f0fa', '#99c2ec', '#4d94de', '#1a66b3']; 
      return {
        color: 'rgba(255, 255, 255, 0.4)',
        weight: 1,
        fillColor: colorsPuncak[depthScale],
        fillOpacity: 0.75
      };
    }

    if (mode === 2) {
      return {
        color: 'rgba(255, 255, 255, 0.4)',
        weight: 1,
        fillColor: '#5b8fbf', 
        fillOpacity: 0.6
      };
    }

    if (mode === 4) {
      const moistureScale = hash % 5;
      const colorsKelembaban = ['#edf5fc', '#edf5fc', '#edf5fc', '#7fb2e5', '#4d94de'];
      return {
        color: 'rgba(255, 255, 255, 0.4)',
        weight: 1,
        fillColor: colorsKelembaban[moistureScale],
        fillOpacity: 0.65
      };
    }

    if (mode === 5 || mode === 6 || mode === 7) {
      return {
        color: 'rgba(255, 255, 255, 0.2)',
        weight: 1,
        fillColor: '#168573', 
        fillOpacity: 0.12
      };
    }

    const statusIdx = hash % 4;
    const colorsChoropleth = ['#D72E38', '#F47B2F', '#FFD47D', '#168573']; 
    return {
      color: 'rgba(255, 255, 255, 0.4)',
      weight: 1,
      fillColor: colorsChoropleth[statusIdx],
      fillOpacity: 0.65
    };
  };

  const getTitleLabel = (mode) => {
    switch(mode) {
      case 0: return 'Peta Genangan Residual';
      case 1: return 'Peta Genangan Puncak Banjir';
      case 2: return 'Peta Genangan Surut';
      case 3: return 'Peta Surutnya Genangan (%)';
      case 4: return 'Peta Kelembaban Tanah | April 2026';
      case 5: return 'Peta Risiko Longsor | Nov - Des 2025';
      case 6: return 'Peta Risiko Longsor | April 2026';
      case 7: return 'Peta Pemulihan Akses Jalan';
      default: return 'Peta Spasial Sumatera';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    let isMounted = true;

    const map = L.map(mapContainerRef.current, {
      center: [2.8, 97.8], 
      zoom: 6.5,
      zoomControl: false, 
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);
    roadGroupRef.current = L.layerGroup().addTo(map);

    fetch('/module-8/batas_wilayah_3_provinsi.geojson')
      .then(res => res.json())
      .then(data => {
        if (isMounted && mapInstanceRef.current && mapInstanceRef.current._panes) {
          const layer = L.geoJSON(data, {
            style: (feature) => getStyleByMode(feature, currentMode),
            onEachFeature: (feature, layer) => {
              const regionName = feature.properties.NAME_2 || feature.properties.KABKOT || "Wilayah";
              layer.bindTooltip(`<strong>${regionName}</strong><br/>Layer: ${getTitleLabel(currentMode)}`, {
                sticky: true,
                direction: 'top'
              });
            }
          }).addTo(mapInstanceRef.current);
          
          geoJsonLayerRef.current = layer;
        }
      })
      .catch(err => console.error("Gagal memuat GeoJSON:", err));

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (geoJsonLayerRef.current && mapInstanceRef.current) {
      geoJsonLayerRef.current.setStyle((feature) => getStyleByMode(feature, currentMode));
    }

    if (markerGroupRef.current && roadGroupRef.current && mapInstanceRef.current) {
      markerGroupRef.current.clearLayers();
      roadGroupRef.current.clearLayers();

      if (currentMode === 5) {
        const highDensityPoints = [
          [5.2, 96.3], [4.9, 96.5], [4.6, 96.7], [4.3, 96.9], [4.0, 97.2],
          [3.7, 97.5], [3.4, 97.8], [3.1, 98.1], [2.8, 98.4], [2.5, 98.7],
          [2.2, 99.0], [1.9, 99.2], [1.6, 99.5], [1.3, 99.7], [0.9, 99.9],
          [0.5, 100.1], [0.1, 100.4], [-0.3, 100.6], [-0.7, 100.8], [-1.2, 101.1]
        ];
        highDensityPoints.forEach((coords) => {
          L.circleMarker(coords, { radius: 6, fillColor: '#D72E38', color: '#ffffff', weight: 1.2, fillOpacity: 0.9 }).addTo(markerGroupRef.current);
        });
      }

      if (currentMode === 6) {
        const lowDensityPoints = [[5.2, 96.3], [4.3, 96.9], [2.8, 98.4], [1.3, 99.7], [-0.7, 100.8]];
        lowDensityPoints.forEach((coords) => {
          L.circleMarker(coords, { radius: 6, fillColor: '#D72E38', color: '#ffffff', weight: 1.2, fillOpacity: 0.9 }).addTo(markerGroupRef.current);
        });
      }

      if (currentMode === 7) {
        const roadSegments = [
          { coords: [[5.5, 95.3], [4.5, 96.2], [3.5, 97.2]], color: '#168573' }, 
          { coords: [[3.5, 97.2], [3.0, 97.7]], color: '#D72E38' }, 
          { coords: [[3.0, 97.7], [2.5, 98.2], [1.5, 99.0]], color: '#168573' }, 
          { coords: [[1.5, 99.0], [1.0, 99.4]], color: '#F47B2F' }, 
          { coords: [[1.0, 99.4], [-0.5, 100.4], [-1.5, 101.0]], color: '#168573' } 
        ];

        roadSegments.forEach((seg) => {
          L.polyline(seg.coords, {
            color: seg.color,
            weight: 3.5,
            opacity: 0.95
          }).addTo(roadGroupRef.current);
        });
      }
    }
  }, [currentMode]);

  return (
    <div className="w-full h-full relative text-slate-800">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      <div className="absolute top-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-700">
          {getTitleLabel(currentMode)}
        </span>
      </div>

      {currentMode === 7 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#168573] block rounded-full" /><span>Pulih</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#F47B2F] block rounded-full" /><span>Tergenang</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-3 h-1 bg-[#D72E38] block rounded-full" /><span>Terputus</span></div>
        </div>
      ) : currentMode === 5 || currentMode === 6 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" />
            <span>Risiko Longsor Tinggi</span>
          </div>
        </div>
      ) : currentMode === 4 ? (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300 block" /><span>Normal</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#5b8fbf] block" /><span>Kelembaban Tinggi</span></div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md flex flex-col gap-2 min-w-[110px]">
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#D72E38] block" /><span>Kritis</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#F47B2F] block" /><span>Parah</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#FFD47D] block" /><span>Sedang</span></div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-700"><span className="w-2.5 h-2.5 rounded-full bg-[#168573] block" /><span>Pulih</span></div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 w-10 h-10 rounded-full shadow-md flex flex-col items-center justify-center font-bold text-slate-800">
        <span className="text-[10px] leading-none mb-[-2px] text-[#F47B2F] font-mono">^</span>
        <span className="text-xs leading-none">U</span>
      </div>
    </div>
  );
}