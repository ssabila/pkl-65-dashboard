"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function LuasBadge({ value, decimals = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const display = inView ? value.toFixed(decimals) : "0";

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-6 right-20 z-30 bg-white/95 rounded-full shadow-lg px-6 py-3"
    >
      <p className="text-lg font-bold text-slate-900 whitespace-nowrap">Luas : {display} km²</p>
    </motion.div>
  );
}
