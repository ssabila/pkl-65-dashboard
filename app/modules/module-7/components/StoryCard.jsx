"use client";

import { useReveal } from "../hooks/useReveal";

export default function StoryCard({ title, children, className = "", delay = 0 }) {
  const [ref, inView] = useReveal(0.4);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={`
        reveal ${inView ? "is-visible" : ""}
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
    </div>
  );
}