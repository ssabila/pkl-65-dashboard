"use client";

export default function StorySidebar({ scenes, currentScene, onSelect }) {
  return (
    <div
      className="
        absolute right-6 top-1/2 -translate-y-1/2
        flex flex-col items-center gap-5 z-50
      "
    >
      {scenes.map((scene, index) => {
        const isActive = currentScene === index;
        return (
          <button
            key={scene.label}
            onClick={() => onSelect(index)}
            aria-label={`Ke bagian ${scene.label}`}
            className="group relative flex items-center justify-center"
          >
            <span
              className="
                pointer-events-none absolute right-9 whitespace-nowrap
                rounded-md bg-slate-900/90 px-2.5 py-1 text-xs text-white
                opacity-0 transition-opacity duration-200
                group-hover:opacity-100
              "
            >
              {scene.label}
            </span>

            <span
              className={`
                rounded-full border-2 transition-all duration-300
                ${
                  isActive
                    ? "w-9 h-9 border-sky-900 bg-sky-200"
                    : "w-3.5 h-3.5 border-transparent bg-sky-400 hover:bg-sky-500"
                }
              `}
            />
          </button>
        );
      })}
    </div>
  );
}