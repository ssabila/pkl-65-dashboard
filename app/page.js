import Link from "next/link";

export const metadata = {
  title: "Dashboard",
  description: "Dashboard Big Data PKL 65",
};

const modules = [
  { id: 1, name: "Modul 1", route: "/modules/module-1" },
  { id: 2, name: "Modul 2", route: "/modules/module-2" },
  { id: 3, name: "Modul 3", route: "/modules/module-3" },
  { id: 4, name: "Modul 4", route: "/modules/module-4" },
  { id: 5, name: "Modul 5", route: "/modules/module-5" },
  { id: 6, name: "Modul 6", route: "/modules/module-6" },
  { id: 7, name: "Modul 7", route: "/modules/module-7" },
  { id: 8, name: "Modul 8", route: "/modules/module-8" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard Big Data PKL 65</h1>
        <p className="text-slate-600 mb-12">Pilih modul yang ingin diakses</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
            <Link key={module.id} href={module.route}>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer border border-slate-200">
                <div className="text-3xl font-bold text-blue-600 mb-3">{module.id}</div>
                <h2 className="text-xl font-semibold text-slate-900">{module.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
