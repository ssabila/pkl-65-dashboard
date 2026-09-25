"use client";

import { motion } from "framer-motion";

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
          <motion.button
            key={scene.label}
            onClick={() => onSelect(index)}
            aria-label={`Ke bagian ${scene.label}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
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

            <span className="relative flex items-center justify-center w-9 h-9">
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-dot"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full border-2 border-sky-900 bg-sky-200"
                />
              )}
              <span
                className={`
                  relative rounded-full border-2 transition-all duration-300
                  ${isActive ? "w-9 h-9 border-transparent" : "w-3.5 h-3.5 border-transparent bg-sky-400 hover:bg-sky-500"}
                `}
              />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
