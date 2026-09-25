"use client";

import { useEffect, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import StorySidebar from "./StorySidebar";
import ScrollProgress from "./ScrollProgress";
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

const focusVariants = {
  active: { opacity: 1, scale: 1 },
  inactive: { opacity: 0.6, scale: 0.99 },
};

export default function StoryLayout() {
  const [currentScene, setCurrentScene] = useState(0);
  const containerRef = useRef(null);
  const sectionRefs = useRef([]);
  const isProgrammaticScroll = useRef(false);
  const unlockTimeout = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Section aktif = section yang sedang melintasi garis tengah viewport,
    // supaya deteksi tetap akurat walau tiap section lebih tinggi dari 100vh (untuk efek sticky).
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentScene(Number(entry.target.dataset.index));
          }
        });
      },
      { root: container, rootMargin: "-50% 0px -50% 0px", threshold: 0 }
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
    }, 900);
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
    <MotionConfig reducedMotion="user">
      <div className="relative w-screen h-screen overflow-hidden bg-slate-100">
        <ScrollProgress progress={currentScene / (scenes.length - 1)} />

        <div
          ref={containerRef}
          className="story-scroll w-full h-full overflow-y-auto"
        >
          {scenes.map(({ Component }, index) => (
            <section
              key={index}
              ref={(el) => (sectionRefs.current[index] = el)}
              data-index={index}
              className="relative w-full h-[130vh]"
            >
              <motion.div
                className="sticky top-0 w-full h-screen overflow-hidden"
                variants={focusVariants}
                animate={currentScene === index ? "active" : "inactive"}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Component
                  isActive={currentScene === index}
                  sceneIndex={index}
                  goToScene={goToScene}
                  onNext={() => goToScene(index + 1)}
                />
              </motion.div>
            </section>
          ))}
        </div>

        <StorySidebar
          scenes={scenes}
          currentScene={currentScene}
          onSelect={goToScene}
        />
      </div>
    </MotionConfig>
  );
}
