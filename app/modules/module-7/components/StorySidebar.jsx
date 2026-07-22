"use client";

export default function StorySidebar({
  currentScene,
  setCurrentScene,
  total,
}) {

  return (
    <div
      className="
      absolute
      right-8
      top-1/2
      -translate-y-1/2
      flex
      flex-col
      gap-6
      z-50
      "
    >
      {Array.from({ length: total }).map((_, index) => (

        <button
          key={index}
          onClick={() => setCurrentScene(index)}
          className={`
            rounded-full
            transition-all
            duration-300

            ${
              currentScene === index
                ? "w-10 h-10 border-4 border-sky-900 bg-sky-200"
                : "w-5 h-5 bg-sky-400"
            }
          `}
        />

      ))}
    </div>
  );
}