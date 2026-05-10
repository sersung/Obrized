"use client";

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
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
  },
  {
    href: "/estimating",
    icon: <Calculator className="w-5 h-5" />,
    label: "Orçamentação",
  },
  {
    href: "/contracts",
    icon: <FileText className="w-5 h-5" />,
    label: "Contratos",
  },
  {
    href: "/safety",
    icon: <ShieldCheck className="w-5 h-5" />,
    label: "Segurança",
  },
  {
    href: "/scheduling",
    icon: <Calendar className="w-5 h-5" />,
    label: "Cronograma",
  },
  {
    href: "/payments",
    icon: <DollarSign className="w-5 h-5" />,
    label: "Pagamentos",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">BuildrAI</span>
            <p className="text-gray-500 text-xs mt-0.5">Construção Inteligente</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span>Configurações</span>
        </Link>
        <div className="mt-3 px-3 py-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">JC</span>
            </div>
            <div>
              <p className="text-white text-xs font-medium">João Costa</p>
              <p className="text-gray-500 text-xs">JC Construções Ltda</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
