import Link from "next/link";
import StoryLayout  from "./components/StoryLayout";

export const metadata = {
  title: "Modul 7",
};

export default function Modul7Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Kembali
        </Link>
      </div>

      <StoryLayout />
    </div>
  );
}