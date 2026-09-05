"use client";

import Link from "next/link";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";
import { C } from "./data/constants";

// Import all modular sections
import SectionHero from "./components/SectionHero";
import SectionStory from "./components/SectionStory";
import SectionFlood from "./components/SectionFlood";
import SectionDamage from "./components/SectionDamage";
import SectionRoads from "./components/SectionRoads";
import SectionBridges from "./components/SectionBridges";
import SectionIsolation from "./components/SectionIsolation";
import SectionIKG from "./components/SectionIKG";
import SectionNightLights from "./components/SectionNightLights";
import SectionDashboard from "./components/SectionDashboard";
import MapLibreMap from "./components/MapLibreMap";

export default function Module5Client() {
  const [activeSection, setRef] = useIntersectionObserver({ threshold: 0.5 });

  return (
    <>
      {/* Peta MapLibre statis di background (tanpa data berat) yang akan diatur oleh activeSection */}
      <MapLibreMap activeSection={activeSection} />

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
          .scan-line {
            position: absolute;
            width: 100%;
            height: 4px;
            background: linear-gradient(to bottom, transparent, rgba(217,56,58,0.8), transparent);
            animation: scan 4s linear infinite;
            box-shadow: 0 0 10px rgba(217,56,58,0.5);
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
          @keyframes scan {
            0% { top: -10%; }
            100% { top: 110%; }
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
        `
      }} />

      {/* Scrollytelling Sections Container */}
      <div className="module-container">
        <SectionHero active={activeSection >= 0} setRef={setRef(0)} />
        <SectionStory active={activeSection >= 1} setRef={setRef(1)} />
        <SectionFlood active={activeSection >= 2} setRef={setRef(2)} />
        <SectionDamage active={activeSection >= 3} setRef={setRef(3)} />
        <SectionRoads active={activeSection >= 4} setRef={setRef(4)} />
        <SectionBridges active={activeSection >= 5} setRef={setRef(5)} />
        <SectionIsolation active={activeSection >= 6} setRef={setRef(6)} />
        <SectionIKG active={activeSection >= 7} setRef={setRef(7)} />
        <SectionNightLights active={activeSection >= 8} setRef={setRef(8)} />
        <SectionDashboard active={activeSection >= 9} setRef={setRef(9)} />
      </div>

      {/* Footer */}
      <footer className="py-8 text-center" style={{ background: C.navy }}>
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
