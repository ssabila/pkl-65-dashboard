"use client";

import { motion } from "framer-motion";

export default function ScrollProgress({ progress }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[70] h-1 bg-slate-900/10">
      <motion.div
        className="h-full bg-gradient-to-r from-sky-400 to-sky-600"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
