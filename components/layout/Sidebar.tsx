"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardHat,
  LayoutDashboard,
  Calculator,
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  Settings as SettingsIcon,
  ChevronRight,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, Language } from "@/lib/translations";

export default function Sidebar() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === "EN" ? "FR" : "EN";
    localStorage.setItem("buildr_lang", nextLang);
    setLang(nextLang);
    window.location.reload();
  };

  const { t } = useTranslations(lang);

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: t("dashboard"),
    },
    {
      href: "/estimating",
      icon: <Calculator className="w-5 h-5" />,
      label: t("estimating"),
    },
    {
      href: "/contracts",
      icon: <FileText className="w-5 h-5" />,
      label: t("contracts"),
    },
    {
      href: "/safety",
      icon: <ShieldCheck className="w-5 h-5" />,
      label: t("safety"),
    },
    {
      href: "/scheduling",
      icon: <Calendar className="w-5 h-5" />,
      label: t("scheduling"),
    },
    {
      href: "/payments",
      icon: <DollarSign className="w-5 h-5" />,
      label: t("payments"),
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/60 min-h-screen flex flex-col justify-between">
      {/* Top Section */}
      <div className="flex flex-col flex-1">
        {/* Logo */}
        <div className="p-6 border-b border-slate-900/60">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 shadow-lg shadow-brand-600/25">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-lg leading-none tracking-tight block">BuildrAI</span>
              <p className="text-slate-500 text-xs mt-1 font-medium tracking-wide uppercase">{t("intelligent_construction")}</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/70"
                )}
              >
                <span className={cn("transition-transform duration-200 group-hover:scale-105", isActive ? "text-white" : "text-slate-400 group-hover:text-white")}>
                  {item.icon}
                </span>
                <span className="flex-1 tracking-wide">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 opacity-75" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-900/60 space-y-3">
        {/* Language Toggler */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-slate-800/40 transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500 animate-pulse" />
            <span>Language / Langue</span>
          </span>
          <span className="bg-brand-600/20 text-brand-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {lang}
          </span>
        </button>

        {/* Settings Link */}
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
            pathname === "/settings"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/10"
              : "text-slate-400 hover:text-white hover:bg-slate-900/70"
          )}
        >
          <SettingsIcon className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="tracking-wide">{t("settings")}</span>
        </Link>

        {/* Active User Card */}
        <div className="px-3.5 py-3.5 bg-slate-900/40 border border-slate-850/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-600/10 text-brand-400 border border-brand-500/20 rounded-full flex items-center justify-center font-bold text-sm">
              JC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">John Carter</p>
              <p className="text-slate-500 text-[10px] font-medium tracking-wide uppercase truncate mt-0.5">JC Construction Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
