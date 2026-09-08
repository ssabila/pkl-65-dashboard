"use client";

export default function EventTimeline({ dates, activeIndex }) {
  return (
    <div className="absolute bottom-8 left-6 right-40 z-30 bg-white/90 rounded-2xl shadow-lg px-6 py-4">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300 -translate-y-1/2" />
        {dates.map((d, i) => (
          <div key={d} className="relative z-10 flex flex-col items-center gap-1">
            <span
              className={`
                w-5 h-5 rounded-full border-2 transition-all duration-300
                ${i === activeIndex ? "bg-sky-500 border-sky-900 scale-110" : "bg-white border-slate-400"}
              `}
            />
            <span className={`text-xs ${i === activeIndex ? "font-semibold text-slate-900" : "text-slate-500"}`}>
              {d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}