"use client";

export default function EventTimeline({ dates, activeIndex, onSelect, formatLabel }) {
  return (
    <div className="absolute bottom-6 left-6 right-44 z-30 bg-white/90 rounded-2xl shadow-lg px-4 py-3 overflow-x-auto">
      <div className="relative flex items-center justify-between gap-1 min-w-[760px]">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-300 -translate-y-1/2" />
        {dates.map((d, i) => (
          <button
            key={d}
            onClick={() => onSelect(i)}
            className="relative z-10 flex flex-col items-center gap-1 px-1"
          >
            <span
              className={`
                w-4 h-4 rounded-full border-2 transition-all duration-300
                ${
                  i === activeIndex
                    ? "bg-sky-500 border-sky-900 scale-125"
                    : "bg-white border-slate-400 hover:border-slate-600"
                }
              `}
            />
            <span
              className={`text-[11px] whitespace-nowrap ${
                i === activeIndex ? "font-semibold text-slate-900" : "text-slate-500"
              }`}
            >
              {formatLabel ? formatLabel(d) : d}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}