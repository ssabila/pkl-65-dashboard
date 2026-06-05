import Link from "next/link";

export const metadata = {
  title: "Modul 8",
};

export default function Modul8Page() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
        >
          ← Kembali
        </Link>

        <h8 className="text-4xl font-bold text-slate-900 mb-8">
          Modul 8
        </h8>

        <div className="bg-white p-8 rounded-lg shadow border border-slate-200">
          <p className="text-slate-600 text-lg">
            Konten Modul 8 ada di sini
          </p>
        </div>
      </div>
    </div>
  );
}