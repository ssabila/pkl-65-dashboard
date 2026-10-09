"use client";

import { motion } from "framer-motion";

const variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function StoryCard({ title, children, className = "", delay = 0 }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={variants}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 }}
      className={`
        absolute z-30
        bg-white/95 backdrop-blur-sm
        rounded-3xl shadow-xl border border-slate-200/60
        p-6 w-[460px] max-w-[85vw]
        max-h-[calc(100vh-220px)] overflow-y-auto
        ${className}
      `}
    >
      {title && <h2 className="text-2xl font-bold mb-3 text-slate-900">{title}</h2>}
      {children}
    </motion.div>
  );
}
