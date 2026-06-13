export default function StoryCard({
  title,
  children,
  className = "",
}) {
  return (
    <div
      className={`
        absolute
        z-50
        bg-blur/90
        backdrop-blur-sm
        rounded-3xl
        shadow-xl
        border
        p-6
        w-[460px]
        ${className}
      `}
    >
      <h2 className="text-4xl font-bold mb-4">
        {title}
      </h2>

      {children}
    </div>
  );
}