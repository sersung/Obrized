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
  CheckCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, Language } from "@/lib/translations";

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>("EN");
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const selectLanguage = (selectedLang: Language) => {
    localStorage.setItem("buildr_lang", selectedLang);
    setLang(selectedLang);
    setShowLangMenu(false);
    window.location.reload();
  };

  const { t } = useTranslations(lang);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { href: "/estimating", icon: Calculator, label: t("estimating") },
    { href: "/contracts", icon: FileText, label: t("contracts") },
    { href: "/safety", icon: ShieldCheck, label: t("safety") },
    { href: "/scheduling", icon: Calendar, label: t("scheduling") },
    { href: "/payments", icon: DollarSign, label: t("payments") },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-72 sm:w-64 bg-slate-950 h-full flex flex-col">
      {/* ── Header ── */}
      <div className="px-5 py-5 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={handleNavClick}
        >
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 shadow-lg shadow-brand-600/25">
            <HardHat className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base leading-none tracking-tight block">
              Obrized
            </span>
            <p className="text-slate-500 text-[10px] mt-0.5 font-medium tracking-wide uppercase">
              {t("intelligent_construction")}
            </p>
          </div>
        </Link>

        {/* Close — visible on mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-white"
                )}
              />
              <span className="flex-1 tracking-wide">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div className="px-3 py-4 border-t border-slate-800/60 space-y-2 flex-shrink-0 relative">
        {/* Language popover */}
        {showLangMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-fade-in">
            {(
              [
                { code: "EN" as Language, label: "English" },
                { code: "FR" as Language, label: "Français" },
                { code: "PT" as Language, label: "Português" },
                { code: "ES" as Language, label: "Español" },
              ] as { code: Language; label: string }[]
            ).map((l) => (
              <button
                key={l.code}
                onClick={() => selectLanguage(l.code)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
                  lang === l.code
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                )}
              >
                <span>{l.label}</span>
                {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        {/* Language toggler */}
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-slate-800/40 transition-all duration-200"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500" />
            <span>Language / Idioma</span>
          </span>
          <span className="bg-brand-600/20 text-brand-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {lang}
          </span>
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          onClick={handleNavClick}
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
            pathname === "/settings"
              ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-800/70"
          )}
        >
          <SettingsIcon className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="tracking-wide">{t("settings")}</span>
        </Link>

        {/* User card */}
        <div className="px-3.5 py-3 bg-slate-900/50 border border-slate-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600/15 text-brand-400 border border-brand-500/20 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
              JC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate">John Carter</p>
              <p className="text-slate-500 text-[10px] font-medium truncate mt-0.5">
                JC Construction Ltd.
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
