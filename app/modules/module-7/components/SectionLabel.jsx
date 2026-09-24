export default function SectionLabel({ children }) {
  return (
    <div className="absolute top-16 left-6 z-30 text-red-600 font-bold text-xl leading-tight drop-shadow-sm max-w-md">
      {children}
    </div>
  );
}