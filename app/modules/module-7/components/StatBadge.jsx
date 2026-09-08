"use client";

import { useReveal, useCountUp } from "../hooks/useReveal";

export default function StatBadge({ value, label, suffix = "", decimals = 0, delay = 0 }) {
  const [ref, inView] = useReveal(0.4);
  const animated = useCountUp(value, inView);
  const display = decimals > 0 ? (inView ? value : 0).toFixed(decimals) : animated;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className="reveal ${inView ? 'is-visible' : ''} bg-white/95 rounded-2xl shadow-lg px-6 py-3 text-center min-w-[150px]"
    >
      <p className="text-3xl font-bold text-slate-900 leading-none">
        {display}
        {suffix}
      </p>
      <p className="text-sm text-slate-600 mt-1">{label}</p>
    </div>
  );
}

export function StatBadgeGroup({ children, className = "" }) {
  return (
    <div className={`absolute top-6 right-6 z-30 flex flex-col gap-3 ${className}`}>
      {children}
    </div>
  );
}