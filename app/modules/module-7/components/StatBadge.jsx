"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

const variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function StatBadge({ value, label, suffix = "", decimals = 0, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const animated = useCountUp(value, inView);
  const display = decimals > 0 ? (inView ? value : 0).toFixed(decimals) : animated;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 }}
      className="bg-white/95 rounded-2xl shadow-lg px-6 py-3 text-center min-w-[150px]"
    >
      <p className="text-3xl font-bold text-slate-900 leading-none">
        {display}
        {suffix}
      </p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </motion.div>
  );
}

export function StatBadgeGroup({ children, className = "" }) {
  return (
    <div className={`absolute top-6 right-6 z-30 flex flex-col gap-3 ${className}`}>
      {children}
    </div>
  );
}
