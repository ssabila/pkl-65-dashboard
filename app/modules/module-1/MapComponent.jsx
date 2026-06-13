"use client";

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent() {
  // Koordinat tengah Provinsi Aceh
  const centerPosition = [4.6951, 96.7494];

  return (
    <MapContainer 
      center={centerPosition} 
      zoom={7} 
      scrollWheelZoom={true} 
      style={{ height: '100%', width: '100%', minHeight: '350px', zIndex: 0 }}
      zoomControl={false} // Kita matikan zoom bawaan agar lebih rapi atau bisa dinyalakan nanti
    >
      {/* Base map menggunakan OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Nanti jika kamu punya data GeoJSON untuk peta panas (heatmap) elevasi atau deforestasi, 
        kamu bisa menambahkannya di sini menggunakan komponen <GeoJSON data={dataKamu} /> 
      */}
    </MapContainer>
  );
}