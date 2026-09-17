"use client";

import { useReveal, useCountUp } from "../hooks/useReveal";

export default function LuasBadge({ value, decimals = 2 }) {
  const [ref, inView] = useReveal(0.4);
  const display = inView ? value.toFixed(decimals) : "0";

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""} absolute top-6 right-20 z-30 bg-white/95 rounded-full shadow-lg px-6 py-3`}
    >
      <p className="text-lg font-bold text-slate-900 whitespace-nowrap">Luas : {display} km²</p>
    </div>
  );
}