import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  DollarSign,
  Clock,
  FileText,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const email = session.user.email;

  // Load all data in parallel
  const [estimatesRes, contractsRes, safetyRes, invoicesRes] = await Promise.all([
    supabase.from("estimates").select("*").eq("user_email", email),
    supabase.from("contracts").select("*").eq("user_email", email),
    supabase.from("safety_reports").select("*").eq("user_email", email),
    supabase.from("invoices").select("*").eq("user_email", email),
  ]);

  const estimates = estimatesRes.data ?? [];
  const contracts = contractsRes.data ?? [];
  const safetyReports = safetyRes.data ?? [];
  const invoicesRaw = invoicesRes.data ?? [];

  // Auto-tag overdue invoices
  const today = new Date();
  const invoices = invoicesRaw.map((inv: any) => {
    if (inv.due_date && inv.status === "submitted" && differenceInDays(today, parseISO(inv.due_date)) > 0) {
      return { ...inv, status: "overdue" };
    }
    return inv;
  });

  // KPIs
  const pendingInvoices = invoices.filter((i: any) => i.status === "submitted" || i.status === "overdue");
  const pendingAmount = pendingInvoices.reduce((s: number, i: any) => s + i.total, 0);
  const urgentInvoices = invoices.filter((i: any) => {
    if (i.status !== "submitted" || !i.due_date) return false;
    const days = differenceInDays(parseISO(i.due_date), today);
    return days <= 7 && days >= 0;
  });
  const urgentAmount = urgentInvoices.reduce((s: number, i: any) => s + i.total, 0);

  // Recent items for activity feed
  const recentEstimates = estimates.slice(0, 3) as any[];
  const recentContracts = contracts.slice(0, 3) as any[];
  const recentSafety = safetyReports.slice(0, 3) as any[];
  const recentInvoices = invoices.slice(0, 3) as any[];

  const isEmpty = estimates.length === 0 && contracts.length === 0 && safetyReports.length === 0 && invoices.length === 0;

  const quickActions = [
    {
      href: "/estimating/new",
      icon: <Calculator className="w-5 h-5" />,
      label: "Novo Orçamento",
      description: "Upload de planta e extração automática",
      color: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      href: "/contracts/new",
      icon: <FileText className="w-5 h-5" />,
      label: "Analisar Contrato",
      description: "Revisão de risco com IA em segundos",
      color: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      href: "/safety/new",
      icon: <ShieldCheck className="w-5 h-5" />,
      label: "Relatório de Segurança",
      description: "Ditado por voz, estruturado pela IA",
      color: "bg-orange-50 text-orange-600 border-orange-100",
    },
    {
      href: "/payments/new",
      icon: <DollarSign className="w-5 h-5" />,
      label: "Nova Fatura",
      description: "Gerar proper invoice com conformidade",
      color: "bg-green-50 text-green-600 border-green-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner for new users */}
      {isEmpty && (
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-1">
            Bem-vindo ao BuildrAI, {session?.user?.name?.split(" ")[0]}! 👷
          </h2>
          <p className="text-brand-100 text-sm mb-4">
            Sua plataforma de IA para construtores canadenses. Comece criando um orçamento ou
            analisando um contrato.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/estimating/new"
              className="bg-white text-brand-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-50 transition-colors"
            >
              Criar primeiro orçamento
            </Link>
            <Link
              href="/contracts/new"
              className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-400 transition-colors"
            >
              Analisar um contrato
            </Link>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{estimates.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Orçamentos</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-green-600 bg-green-50">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
              Pendente
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {pendingAmount > 0 ? fmt(pendingAmount) : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">A Receber</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-orange-600 bg-orange-50">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-50 text-gray-600">
              Total
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
          <p className="text-sm text-gray-500 mt-0.5">Faturas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${urgentInvoices.length > 0 ? "text-red-600 bg-red-50" : "text-gray-400 bg-gray-50"}`}>
              <Clock className="w-5 h-5" />
            </div>
            {urgentInvoices.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-700">
                Urgente
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {urgentAmount > 0 ? fmt(urgentAmount) : "—"}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">Vence em 7 dias</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Atividade Recente</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {isEmpty ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Nenhuma atividade ainda. Use as ações rápidas abaixo para começar.
              </div>
            ) : (
              <>
                {recentEstimates.map((e: any) => (
                  <div key={`est-${e.id}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calculator className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{e.project_name}</p>
                        <p className="text-xs text-gray-500">
                          Orçamento · {fmt(e.total_value)} ·{" "}
                          {new Date(e.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
                        {e.status}
                      </span>
                    </div>
                  </div>
                ))}
                {recentContracts.map((c: any) => (
                  <div key={`ct-${c.id}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">
                          Contrato · {c.clauses_count} cláusulas ·{" "}
                          {new Date(c.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          c.overall_risk === "critical"
                            ? "bg-red-100 text-red-700"
                            : c.overall_risk === "high"
                            ? "bg-red-50 text-red-600"
                            : c.overall_risk === "medium"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {c.overall_risk}
                      </span>
                    </div>
                  </div>
                ))}
                {recentSafety.map((r: any) => (
                  <div key={`sf-${r.id}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{r.project_name}</p>
                        <p className="text-xs text-gray-500">
                          Segurança · {r.report_type} ·{" "}
                          {new Date(r.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {recentInvoices.map((i: any) => (
                  <div key={`inv-${i.id}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{i.invoice_number}</p>
                        <p className="text-xs text-gray-500">
                          {i.project_name} · {fmt(i.total)} ·{" "}
                          {new Date(i.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          i.status === "overdue"
                            ? "bg-red-50 text-red-700"
                            : i.status === "paid"
                            ? "bg-green-50 text-green-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {i.status}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Resumo</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                label: "Orçamentos",
                value: estimates.length,
                sub: `${estimates.filter((e: any) => e.status === "won").length} ganhos`,
                href: "/estimating",
                color: "text-blue-600",
              },
              {
                label: "Contratos",
                value: contracts.length,
                sub: `${contracts.filter((c: any) => c.overall_risk === "critical" || c.overall_risk === "high").length} de alto risco`,
                href: "/contracts",
                color: "text-purple-600",
              },
              {
                label: "Relatórios de Segurança",
                value: safetyReports.length,
                sub: `${safetyReports.filter((r: any) => r.report_type === "incident").length} incidentes`,
                href: "/safety",
                color: "text-orange-600",
              },
              {
                label: "Faturas",
                value: invoices.length,
                sub: `${invoices.filter((i: any) => i.status === "overdue").length} vencidas`,
                href: "/payments",
                color: "text-green-600",
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${item.color}`}>{item.value}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${action.color}`}>
                {action.icon}
              </div>
              <p className="font-medium text-gray-900 text-sm">{action.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 mt-3 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
