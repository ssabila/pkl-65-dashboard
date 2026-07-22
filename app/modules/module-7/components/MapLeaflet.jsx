"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapLeaflet(
{
  geojsonFiles,
  center,
  zoom,
}) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
  Promise.all([
    fetch("/map/aceh.json").then(res => res.json()),
    fetch("/map/sumbar.json").then(res => res.json()),
    fetch("/map/sumut.json").then(res => res.json())
  ]).then(([aceh, sumbar, sumut]) => {
    setGeoData([aceh, sumbar, sumut]);
  });
}, []);

  return (
    <MapContainer
      center={center}
      zoom={zoom}

      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}

      className="w-full h-full"
    >
      {geoData?.map((item, index) => (
        <GeoJSON key={index} data={item} 
            style={{
                fillColor: "#ffffff",
                color: "#000000",
                weight: 1,
                fillOpacity: 1
            }}
        />
        ))}
    </MapContainer>
  );
}