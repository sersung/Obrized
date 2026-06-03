"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calculator,
  FileText,
  ShieldCheck,
  AlignJustify,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onMenuOpen: () => void;
  menuOpen: boolean;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/estimating", icon: Calculator, label: "Estimates" },
  { href: "/contracts", icon: FileText, label: "Contracts" },
  { href: "/safety", icon: ShieldCheck, label: "Safety" },
];

export default function MobileBottomNav({ onMenuOpen, menuOpen }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
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
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
            >
              {/* Active top indicator bar */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-600 rounded-full" />
              )}
              <div
                className={cn(
                  "w-9 h-7 flex items-center justify-center rounded-lg transition-all duration-200",
                  isActive ? "bg-brand-50" : ""
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-brand-600" : "text-gray-400"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold transition-colors duration-200",
                  isActive ? "text-brand-600" : "text-gray-400"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Menu button */}
        <button
          onClick={onMenuOpen}
          className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-colors"
        >
          {menuOpen && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-600 rounded-full" />
          )}
          <div
            className={cn(
              "w-9 h-7 flex items-center justify-center rounded-lg transition-all duration-200",
              menuOpen ? "bg-brand-50" : ""
            )}
          >
            <AlignJustify
              className={cn(
                "w-5 h-5 transition-colors duration-200",
                menuOpen ? "text-brand-600" : "text-gray-400"
              )}
            />
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold transition-colors duration-200",
              menuOpen ? "text-brand-600" : "text-gray-400"
            )}
          >
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
