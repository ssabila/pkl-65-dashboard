export default function Legend({ items, className = "", title }) {
  return (
    <div className={`absolute z-30 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-4 space-y-2 ${className}`}>
      {title && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>}
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-slate-800">
          {item.type === "line" ? (
            <span
              className="w-4 inline-block shrink-0"
              style={{ borderTop: `${item.weight ?? 2}px solid ${item.color}` }}
            />
          ) : (
            <span className="w-4 h-4 rounded-sm inline-block shrink-0" style={{ backgroundColor: item.color }} />
          )}
          {item.label}
        </div>
      ))}
    </div>
  );
}