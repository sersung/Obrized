"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardHat,
  Menu,
  X,
  LayoutDashboard,
  Calculator,
  FileText,
  ShieldCheck,
  Calendar,
  DollarSign,
  ClipboardList,
  Settings,
  Bell,
  Plus,
  Globe,
  ChevronRight,
  Users,
  Briefcase,
  BarChart2,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, Language } from "@/lib/translations";

export default function MobileTopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Language>("EN");

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  const { t } = useTranslations(lang);

  const navItems = [
    { href: "/dashboard",  icon: LayoutDashboard, label: t("dashboard") },
    { href: "/clients",    icon: Users,            label: "Clients" },
    { href: "/jobs",       icon: Briefcase,        label: "Jobs" },
    { href: "/team",       icon: UserCog,          label: "Team" },
    { href: "/estimating", icon: Calculator,       label: t("estimating") },
    { href: "/quotes",     icon: ClipboardList,    label: "Quotes" },
    { href: "/payments",   icon: DollarSign,       label: t("payments") },
    { href: "/contracts",  icon: FileText,         label: t("contracts") },
    { href: "/safety",     icon: ShieldCheck,      label: t("safety") },
    { href: "/scheduling", icon: Calendar,         label: t("scheduling") },
    { href: "/reports",    icon: BarChart2,        label: "Reports" },
    { href: "/settings",   icon: Settings,         label: t("settings") },
  ];

  const breadcrumbMap: Record<string, string> = {
    "/dashboard":    t("dashboard"),
    "/clients":      "Clients",
    "/clients/new":  "New Client",
    "/jobs":         "Jobs",
    "/jobs/new":     "New Job",
    "/team":         "Team",
    "/team/new":     "Add Member",
    "/reports":      "Reports",
    "/estimating":   t("estimating"),
    "/estimating/new": t("new_estimate"),
    "/contracts":    t("contracts"),
    "/contracts/new": t("new_contract"),
    "/safety":       t("safety"),
    "/safety/new":   t("new_safety_report"),
    "/scheduling":   t("scheduling"),
    "/payments":     t("payments"),
    "/payments/new": t("new_invoice"),
    "/quotes":       "Quotes",
    "/quotes/new":   "New Quote",
    "/settings":     t("settings"),
  };

  const newActionMap: Record<string, { href: string; label: string }> = {
    "/clients":    { href: "/clients/new",   label: "New Client" },
    "/jobs":       { href: "/jobs/new",      label: "New Job" },
    "/team":       { href: "/team/new",      label: "Add Member" },
    "/estimating": { href: "/estimating/new", label: t("new_estimate") },
    "/contracts":  { href: "/contracts/new",  label: t("new_contract") },
    "/safety":     { href: "/safety/new",     label: t("new_safety_report") },
    "/payments":   { href: "/payments/new",   label: t("new_invoice") },
    "/quotes":     { href: "/quotes/new",     label: "New Quote" },
  };

  const pageTitle = breadcrumbMap[pathname] ?? "Obrized";
  const newAction = newActionMap[pathname];

  return (
    <>
      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm lg:hidden">

        {/* Main bar */}
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Logo */}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center shadow-sm shadow-brand-600/30">
              <HardHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-[15px] tracking-tight">Obrized</span>
          </Link>

          {/* Page title (center) */}
          <div className="flex-1 min-w-0 px-2">
            <p className="text-sm font-semibold text-gray-600 truncate text-center">{pageTitle}</p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {newAction && (
              <Link
                href={newAction.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 bg-brand-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            )}

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Menu toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className={cn(
                "p-2 rounded-xl transition-colors duration-200",
                open
                  ? "bg-brand-600 text-white"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              )}
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Slide-down navigation panel */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            open ? "max-h-[1000px]" : "max-h-0"
          )}
        >
          <div className="bg-white border-t border-gray-100 px-3 pt-2 pb-3">
            <nav className="space-y-0.5">
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
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 active:scale-[0.98]",
                      isActive
                        ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                      isActive ? "bg-white/20" : "bg-gray-100"
                    )}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-[15px] font-semibold flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
                  </Link>
                );
              })}
            </nav>

            {/* Language selector */}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 px-4 py-2">
              <Globe className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-500 flex-1">Idioma / Language</span>
              <div className="flex gap-1">
                {(["EN", "FR", "PT", "ES"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      localStorage.setItem("buildr_lang", l);
                      window.location.reload();
                    }}
                    className={cn(
                      "w-9 h-7 rounded-lg text-[11px] font-bold uppercase transition-all",
                      lang === l
                        ? "bg-brand-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop (closes menu when tapping outside) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          style={{ top: 56 }}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
