import Link from "next/link";
import { HardHat, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
        <HardHat className="w-8 h-8 text-slate-950" />
      </div>
      <p className="text-amber-500 text-sm font-black uppercase tracking-widest mb-3">404 — Page Not Found</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">
        This page doesn't exist
      </h1>
      <p className="text-slate-400 text-sm font-semibold max-w-sm mb-8">
        The page you're looking for may have moved or been removed. Head back to keep building.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm hover:from-amber-600 hover:to-orange-700 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Obrized
      </Link>
    </div>
  );
}
