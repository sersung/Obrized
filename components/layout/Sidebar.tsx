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
  ClipboardList,
  Settings as SettingsIcon,
  Globe,
  CheckCircle2,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, Language } from "@/lib/translations";

interface SidebarProps {
  onClose?: () => void;
  mobile?: boolean;
}

export default function Sidebar({ onClose, mobile = false }: SidebarProps) {
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
    { href: "/quotes", icon: ClipboardList, label: "Quotes" },
  ];

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  /* ─── MOBILE full-screen overlay ─── */
  if (mobile) {
    return (
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-14 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/30">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-xl font-bold tracking-tight">Obrized</p>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">
                {t("intelligent_construction")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items — big, tappable */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-4">
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
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 active:bg-slate-800"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  isActive ? "bg-white/20" : "bg-slate-800"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-5 h-5 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: language + settings + user */}
        <div className="px-4 pb-8 space-y-3 border-t border-slate-800 pt-4 flex-shrink-0 relative">
          {/* Language popover */}
          {showLangMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
              {([
                { code: "EN" as Language, label: "English", flag: "🇨🇦" },
                { code: "FR" as Language, label: "Français", flag: "🇫🇷" },
                { code: "PT" as Language, label: "Português", flag: "🇧🇷" },
                { code: "ES" as Language, label: "Español", flag: "🇪🇸" },
              ]).map((l) => (
                <button
                  key={l.code}
                  onClick={() => selectLanguage(l.code)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    lang === l.code
                      ? "bg-brand-600 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  )}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="flex-1 text-left">{l.label}</span>
                  {lang === l.code && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <Globe className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <span className="flex-1 text-left text-sm font-semibold">Language / Idioma</span>
            <span className="bg-brand-600/30 text-brand-400 px-2.5 py-1 rounded-lg text-xs font-bold uppercase">
              {lang}
            </span>
          </button>

          <Link
            href="/settings"
            onClick={handleNavClick}
            className={cn(
              "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors",
              pathname === "/settings"
                ? "bg-brand-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            )}
          >
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">{t("settings")}</span>
          </Link>

          {/* User card */}
          <div className="flex items-center gap-3 px-4 py-4 bg-slate-800/60 rounded-2xl">
            <div className="w-10 h-10 bg-brand-600/20 border border-brand-500/30 rounded-full flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
              JC
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate">John Carter</p>
              <p className="text-slate-500 text-xs font-medium truncate">JC Construction Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── DESKTOP sidebar ─── */
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/60 h-full flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800/60 flex-shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 duration-300 shadow-lg shadow-brand-600/25">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base leading-none tracking-tight block">Obrized</span>
            <p className="text-slate-500 text-[10px] mt-0.5 font-medium tracking-wide uppercase">{t("intelligent_construction")}</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
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
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-white" : "text-slate-500 group-hover:text-white"
              )} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-800/60 space-y-2 flex-shrink-0 relative">
        {showLangMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-fade-in">
            {([
              { code: "EN" as Language, label: "English" },
              { code: "FR" as Language, label: "Français" },
              { code: "PT" as Language, label: "Português" },
              { code: "ES" as Language, label: "Español" },
            ]).map((l) => (
              <button
                key={l.code}
                onClick={() => selectLanguage(l.code)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between",
                  lang === l.code ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800"
                )}
              >
                <span>{l.label}</span>
                {lang === l.code && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900 border border-slate-800/40 transition-all"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-500" />
            Language / Idioma
          </span>
          <span className="bg-brand-600/20 text-brand-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{lang}</span>
        </button>

        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
            pathname === "/settings"
              ? "bg-brand-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800/70"
          )}
        >
          <SettingsIcon className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          <span>{t("settings")}</span>
        </Link>

        <div className="px-3.5 py-3 bg-slate-900/50 border border-slate-800/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600/15 text-brand-400 border border-brand-500/20 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">JC</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">John Carter</p>
              <p className="text-slate-500 text-[10px] font-medium truncate mt-0.5">JC Construction Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
