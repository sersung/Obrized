"use client";

import { Bell, Search, Plus, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/estimating": "Orçamentação",
  "/estimating/new": "Novo Orçamento",
  "/contracts": "Contratos",
  "/contracts/new": "Novo Contrato",
  "/safety": "Segurança",
  "/safety/new": "Novo Relatório",
  "/scheduling": "Cronograma",
  "/payments": "Pagamentos",
  "/payments/new": "Nova Fatura",
};

const newActionMap: Record<string, { href: string; label: string }> = {
  "/estimating": { href: "/estimating/new", label: "Novo Orçamento" },
  "/contracts": { href: "/contracts/new", label: "Novo Contrato" },
  "/safety": { href: "/safety/new", label: "Novo Relatório" },
  "/payments": { href: "/payments/new", label: "Nova Fatura" },
};

export default function TopNav() {
  const pathname = usePathname();
  const pageTitle = breadcrumbMap[pathname] ?? "BuildrAI";
  const newAction = newActionMap[pathname];
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar projetos..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-56"
          />
        </div>

        {newAction && (
          <Link
            href={newAction.href}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {newAction.label}
          </Link>
        )}

        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-brand-600" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-gray-900 leading-tight">
              {session?.user?.name ?? "Usuário"}
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              {session?.user?.email ?? ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
