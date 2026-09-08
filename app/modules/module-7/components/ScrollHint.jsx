export default function ScrollHint() {
  return (
    <button
      onClick={(e) => e.currentTarget.closest("section")?.nextElementSibling?.scrollIntoView({ behavior: "smooth" })}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-slate-600"
    >
      <span className="text-xs tracking-wide">Scroll untuk lanjut</span>
      <svg
        className="scroll-hint-bounce w-5 h-5"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}