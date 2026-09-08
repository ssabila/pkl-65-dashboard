export default function Legend({ items, className = "" }) {
  return (
    <div className={`absolute z-30 bg-white/95 rounded-2xl shadow-lg p-4 space-y-2 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm text-slate-800">
          <span className="w-4 h-4 rounded-sm inline-block" style={{ backgroundColor: item.color }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}