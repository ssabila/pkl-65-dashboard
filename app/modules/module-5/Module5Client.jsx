"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";
import { C } from "./data/constants";

// Import all modular sections
import SectionHero from "./components/SectionHero";
import SectionStory from "./components/SectionStory";
import SectionFlood from "./components/SectionFlood";
import SectionDamage from "./components/SectionDamage";
import SectionRoads from "./components/SectionRoads";
import SectionIsolation from "./components/SectionIsolation";
import SectionIKG from "./components/SectionIKG";
import SectionNightLights from "./components/SectionNightLights";
import SectionDashboard from "./components/SectionDashboard";
import MapLibreMap from "./components/MapLibreMap";

export default function Module5Client() {
  const [activeSection, setRef] = useIntersectionObserver({ threshold: 0.5 });
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("Semua");

  // Pastikan zoom selalu normal 100%
  useEffect(() => {
    document.body.style.zoom = "100%";
  }, []);

  return (
    <>
      {/* Peta MapLibre statis di background (tanpa data berat) yang akan diatur oleh activeSection */}
      <MapLibreMap activeSection={activeSection} isMapLoaded={isMapLoaded} setIsMapLoaded={setIsMapLoaded} dashboardFilter={dashboardFilter} />

      <style dangerouslySetInnerHTML={{
        __html: `
          /* Base typography styles that apply to module 5 components */
          .data-row:hover { background: rgba(255,255,255,0.08) !important; }
          .shimmer-el { animation: shimmer 2s infinite; }
          .tilt-el { animation: tilt 3s ease-in-out infinite alternate; }
          .live-dot { animation: pulse 1.5s infinite; }
          .scroll-bounce { animation: bounce 2s infinite; }
          
          /* Background and animations */
          .topo-bg {
            background-image: 
              radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,.05) 21%, rgba(255,255,255,.05) 34%, transparent 35%, transparent),
              radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,.05) 21%, rgba(255,255,255,.05) 34%, transparent 35%, transparent);
            background-size: 120px 120px;
            opacity: 0.6;
          }
          .glass {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            box-shadow: 0 8px 32px 0 rgba(44, 62, 80, 0.1);
          }
          .glass-dark {
            background: rgba(44, 62, 80, 0.35);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
          }
          }
          .particle-el {
            position: absolute;
            top: -10px;
            border-radius: 50%;
            opacity: 0.6;
            animation: snowfall linear infinite;
            pointer-events: none;
          }
          
          /* Keyframes */
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          }
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes shimmer {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
          @keyframes tilt {
            0% { transform: rotate(-5deg); }
            100% { transform: rotate(5deg); }
          }
          @keyframes snowfall {
            0% { transform: translateY(-10vh) translateX(0) scale(1); opacity: 0; }
            20% { opacity: 0.8; }
            80% { opacity: 0.8; }
            100% { transform: translateY(110vh) translateX(20px) scale(0.5); opacity: 0; }
          }
          
          /* Entry animations */
          .anim-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
          .anim-fadeInLeft { animation: fadeInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
          .anim-fadeInRight { animation: fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
          .anim-slideInRight { animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
          
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }

          /* ISOLATION MARKERS (HALAMAN 6) */
          .isolated-marker {
            position: relative;
            width: 20px;
            height: 20px;
            pointer-events: none;
          }
          .sos-circle {
            position: absolute;
            top: 50%; left: 50%;
            width: 10px; height: 10px;
            background: rgba(244, 124, 54, 0.6);
            border-radius: 50%;
            animation: sos-pulse 2s infinite cubic-bezier(0, 0, 0.2, 1);
          }
          .sos-circle::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 50%;
            border: 1px solid rgba(244, 124, 54, 0.8);
            animation: sos-pulse-ring 2s infinite cubic-bezier(0, 0, 0.2, 1);
            animation-delay: 0.5s;
          }
          .airdrop-line {
            position: absolute;
            bottom: 50%; left: 50%;
            width: 1px;
            height: 100vh;
            border-left: 1px dashed rgba(255,255,255,0.4);
            transform: translateX(-50%);
            transform-origin: bottom;
            animation: airdrop-drop 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          @keyframes sos-pulse {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
          }
          @keyframes sos-pulse-ring {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes airdrop-drop {
            0% { transform: translateX(-50%) scaleY(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(-50%) scaleY(1); opacity: 1; }
          }
        `
      }} />

      {/* Scrollytelling Sections Container */}
      <div className="module-container">
        <SectionHero active={activeSection >= 0} setRef={setRef(0)} />
        <SectionStory active={activeSection >= 1} setRef={setRef(1)} />
        <SectionFlood active={activeSection >= 2} setRef={setRef(2)} />
        <SectionDamage active={activeSection >= 3} setRef={setRef(3)} />
        <SectionRoads active={activeSection >= 4} setRef={setRef(4)} />
        <SectionIsolation active={activeSection >= 5} setRef={setRef(5)} />
        <SectionIKG active={activeSection >= 6} setRef={setRef(6)} />
        <SectionNightLights active={activeSection >= 7} setRef={setRef(7)} />
        <SectionDashboard active={activeSection >= 8} setRef={setRef(8)} filterActive={dashboardFilter} setFilterActive={setDashboardFilter} />
      </div>

      {/* Footer */}
      <footer ref={setRef(9)} className="relative z-10 py-8 text-center" style={{ background: C.navy }}>
        <p style={{ fontFamily: "var(--font-dm-sans)", color: "rgba(232,235,239,0.4)", fontSize: "0.82rem" }}>
          Modul 5: Dampak &amp; Logistik &nbsp;·&nbsp; Politeknik Statistika STIS &nbsp;·&nbsp; PKL 65
        </p>
        <Link href="/" className="mt-2 inline-block text-sm" style={{ fontFamily: "var(--font-dm-sans)", color: C.blue }}>
          ← Kembali ke Dashboard Utama
        </Link>
      </footer>
    </>
  );
}
