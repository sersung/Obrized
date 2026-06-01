"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Plus, LogOut, User, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, useLogout } from "@/lib/auth-client";
import { useTranslations, Language } from "@/lib/translations";

interface TopNavProps {
  onMenuToggle?: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  const breadcrumbMap: Record<string, string> = {
    "/dashboard": t("dashboard"),
    "/estimating": t("estimating"),
    "/estimating/new": t("new_estimate"),
    "/contracts": t("contracts"),
    "/contracts/new": t("new_contract"),
    "/safety": t("safety"),
    "/safety/new": t("new_safety_report"),
    "/scheduling": t("scheduling"),
    "/payments": t("payments"),
    "/payments/new": t("new_invoice"),
    "/settings": t("settings"),
  };

  const newActionMap: Record<string, { href: string; label: string }> = {
    "/estimating": { href: "/estimating/new", label: t("new_estimate") },
    "/contracts": { href: "/contracts/new", label: t("new_contract") },
    "/safety": { href: "/safety/new", label: t("new_safety_report") },
    "/payments": { href: "/payments/new", label: t("new_invoice") },
  };

  const pageTitle = breadcrumbMap[pathname] ?? "Obrized";
  const newAction = newActionMap[pathname];
  const { data: session } = useSession();
  const logout = useLogout("/login");

  const getLocale = (l: Language) => {
    switch (l) {
      case "EN": return "en-CA";
      case "FR": return "fr-CA";
      case "PT": return "pt-BR";
      case "ES": return "es-ES";
      default: return "en-CA";
    }
  };

  const formattedDate = new Date().toLocaleDateString(getLocale(lang), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight truncate">{pageTitle}</h1>
          <p className="text-[11px] font-medium text-gray-400 capitalize mt-0.5 hidden sm:block truncate">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Search — hidden on small screens */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_projects")}
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-48 lg:w-56 transition-all duration-200"
          />
        </div>

        {newAction && (
          <Link
            href={newAction.href}
            className="flex items-center gap-1.5 bg-brand-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{newAction.label}</span>
          </Link>
        )}

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          {(session?.user as any)?.image ? (
            <img
              src={(session?.user as any).image}
              alt={session?.user?.name ?? "Avatar"}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center border border-brand-200/50 flex-shrink-0">
              <User className="w-4 h-4 text-brand-600" />
            </div>
          )}
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-gray-900 leading-tight">
              {session?.user?.name ?? "John Carter"}
            </p>
            <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">
              {session?.user?.email ?? "john.carter@jcconstruction.ca"}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title={t("sign_out")}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
