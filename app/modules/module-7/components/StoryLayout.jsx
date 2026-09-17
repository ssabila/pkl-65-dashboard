"use client";

import { useEffect, useRef, useState } from "react";
import StorySidebar from "./StorySidebar";
import "../story.css";

import Scene01Pembuka from "../scenes/Scene01Pembuka";
import Scene02Siklon from "../scenes/Scene02Siklon";
import Scene03CurahHujan from "../scenes/Scene03CurahHujan";
import Scene04KronologiBencana from "../scenes/Scene04KronologiBencana";
import Scene06AwalBanjir from "../scenes/Scene06AwalBanjir";
import Scene07PuncakBanjir from "../scenes/Scene07PuncakBanjir";
import Scene08SurutBertahap from "../scenes/Scene08SurutBertahap";
import Scene09Pemulihan from "../scenes/Scene09Pemulihan";

const scenes = [
  { Component: Scene01Pembuka, label: "Pembuka" },
  { Component: Scene02Siklon, label: "Siklon" },
  { Component: Scene03CurahHujan, label: "Curah Hujan" },
  { Component: Scene04KronologiBencana, label: "Kronologi Bencana" },
  { Component: Scene06AwalBanjir, label: "Awal Banjir" },
  { Component: Scene07PuncakBanjir, label: "Puncak Banjir" },
  { Component: Scene08SurutBertahap, label: "Surut Bertahap" },
  { Component: Scene09Pemulihan, label: "Pemulihan" },
];

export default function StoryLayout() {
  const [currentScene, setCurrentScene] = useState(0);
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const isProgrammaticScroll = useRef(false);
  const unlockTimeout = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            setCurrentScene(Number(entry.target.dataset.index));
          }
        });
      },
      { root: container, threshold: [0.55] }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const goToScene = (index) => {
    const clamped = Math.max(0, Math.min(scenes.length - 1, index));
    isProgrammaticScroll.current = true;
    setCurrentScene(clamped);
    sectionRefs.current[clamped]?.scrollIntoView({ behavior: "smooth" });

    clearTimeout(unlockTimeout.current);
    unlockTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 700);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goToScene(currentScene + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goToScene(currentScene - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentScene]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100">
      <div
        ref={containerRef}
        className="story-scroll w-full h-full overflow-y-scroll snap-y snap-mandatory"
      >
        {scenes.map(({ Component }, index) => (
          <section
            key={index}
            ref={(el) => (sectionRefs.current[index] = el)}
            data-index={index}
            className="w-full h-screen snap-start snap-always relative overflow-hidden"
          >
            <Component
              isActive={currentScene === index}
              sceneIndex={index}
              goToScene={goToScene}
              onNext={() => goToScene(index + 1)}
            />
          </section>
        ))}
      </div>

      <StorySidebar
        scenes={scenes}
        currentScene={currentScene}
        onSelect={goToScene}
      />
    </div>
  );
}