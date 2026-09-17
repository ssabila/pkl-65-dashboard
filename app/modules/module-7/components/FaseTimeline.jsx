"use client";

import { useEffect, useState } from "react";

const FASES = ["Fase 1", "Fase 2", "Fase 3", "Fase 4"];

export default function FaseTimeline({ activeIndex, isActive, sceneIndex, goToScene }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!isActive) setPlaying(false);
  }, [isActive]);

  useEffect(() => {
    if (!playing || !isActive) return;
    if (activeIndex >= FASES.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => goToScene(sceneIndex + 1), 2500);
    return () => clearTimeout(t);
  }, [playing, isActive, activeIndex, sceneIndex, goToScene]);

  const jump = (i) => goToScene(sceneIndex + (i - activeIndex));

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-3xl flex items-center gap-4">
      <button
        onClick={() => setPlaying((p) => !p)}
        className="w-9 h-9 shrink-0 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center"
        aria-label={playing ? "Jeda" : "Putar semua fase"}
      >
        {playing ? "❚❚" : "▶"}
      </button>

      <div className="relative flex-1 flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-300 -translate-y-1/2 rounded-full" />
        <div
          className="absolute left-0 top-1/2 h-1 bg-sky-500 -translate-y-1/2 rounded-full transition-all duration-700"
          style={{ width: `${(activeIndex / (FASES.length - 1)) * 100}%` }}
        />
        {FASES.map((label, i) => (
          <button key={label} onClick={() => jump(i)} className="relative z-10 flex flex-col items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full border-4 transition-all duration-300 ${
                i === activeIndex ? "bg-sky-500 border-slate-900 scale-110" : "bg-white border-slate-300"
              }`}
            />
            <span className={`text-sm ${i === activeIndex ? "font-semibold text-slate-900" : "text-slate-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}