import Link from "next/link";
import StoryLayout from "./components/StoryLayout";

export const metadata = {
  title: "Modul 7 — Menelusuri Jejak Bencana",
};

export default function Modul7Page() {
  return (
    <div className="relative min-h-screen bg-slate-50">
      <Link
        href="/"
        className="absolute top-4 left-4 z-[60] text-sm text-slate-700 bg-white/90 rounded-full px-4 py-2 shadow hover:text-slate-900"
      >
        ← Kembali
      </Link>

      <StoryLayout />
    </div>
  );
}