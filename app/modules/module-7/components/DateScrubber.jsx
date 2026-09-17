"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function DateScrubber({ dates, index, setIndex, formatLabel }) {
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i >= dates.length - 1 ? 0 : i + 1));
    }, 250);
    return () => clearInterval(intervalRef.current);
  }, [playing, dates.length, setIndex]);

  return (
    <div className="absolute bottom-8 left-8 right-8 z-30 bg-white/95 rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4">
      <motion.button
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
        aria-label="Hari sebelumnya"
      >
        ‹
      </motion.button>

      <motion.button
        onClick={() => setPlaying((p) => !p)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-9 h-9 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center"
        aria-label={playing ? "Jeda" : "Putar"}
      >
        {playing ? "❚❚" : "▶"}
      </motion.button>

      <motion.button
        onClick={() => setIndex((i) => Math.min(dates.length - 1, i + 1))}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700"
        aria-label="Hari berikutnya"
      >
        ›
      </motion.button>

      <input
        type="range"
        min={0}
        max={dates.length - 1}
        value={index}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
        className="flex-1 accent-sky-500"
      />

      <span className="text-sm font-semibold text-slate-800 w-32 text-right">
        {formatLabel(dates[index])}
      </span>
    </div>
  );
}