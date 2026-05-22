import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import type { Invoice } from "@/lib/supabase";
import { Plus, Clock, CheckCircle2, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600" },
  submitted: { label: "Submetida", color: "bg-blue-50 text-blue-700" },
  certified: { label: "Certificada", color: "bg-teal-50 text-teal-700" },
  paid: { label: "Paga", color: "bg-green-50 text-green-700" },
  disputed: { label: "Disputada", color: "bg-amber-50 text-amber-700" },
  overdue: { label: "Vencida", color: "bg-red-50 text-red-700" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

export default async function PaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';
  const { data: invoices = [] } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  // Auto-mark overdue invoices
  const today = new Date();
  const list = (invoices as Invoice[]).map((inv) => {
    if (
      inv.due_date &&
      inv.status === "submitted" &&
      differenceInDays(today, parseISO(inv.due_date)) > 0
    ) {
      return { ...inv, status: "overdue" as const };
    }
    return inv;
  });

  const pending = list.filter((i) => i.status === "submitted" || i.status === "overdue");
  const totalPending = pending.reduce((s, i) => s + i.total, 0);
  const totalOverdue = list.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const totalPaid = list.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const properCount = list.filter((i) => i.is_proper).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-orange-600">{totalPending > 0 ? fmt(totalPending) : "—"}</p>
          <p className="text-sm text-gray-500">A Receber</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-red-600">{totalOverdue > 0 ? fmt(totalOverdue) : "—"}</p>
          <p className="text-sm text-gray-500">Vencidas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-green-600">{totalPaid > 0 ? fmt(totalPaid) : "—"}</p>
          <p className="text-sm text-gray-500">Recebido</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-gray-900">
            {list.length > 0 ? `${properCount}/${list.length}` : "—"}
          </p>
          <p className="text-sm text-gray-500">Faturas Válidas</p>
        </div>
      </div>

      {/* Overdue alert */}
      {list.some((i) => i.status === "overdue") && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900 text-sm">
              Fatura(s) vencida(s) — prazo de 28 dias ultrapassado
            </p>
            <p className="text-red-700 text-sm mt-0.5">
              Inicie o processo de adjudicação no ODACC se necessário.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Faturas</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Controle do relógio de 28 dias — Ontário Construction Act e BC Prompt Payment Act
          </p>
        </div>
        <Link
          href="/payments/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Fatura
        </Link>
      </div>

      {/* Empty state */}
      {list.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-7 h-7 text-green-400" />
          </div>
          <h3 className="font-semibold text-gray-900">Nenhuma fatura ainda</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Gere uma proper invoice com validação automática da legislação de Prompt Payment.
          </p>
          <Link
            href="/payments/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar primeira fatura
          </Link>
        </div>
      )}

      {list.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Fatura</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Proper Invoice</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Prazo 28d</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {list.map((inv) => {
                const status = statusConfig[inv.status] ?? statusConfig.draft;
                const daysLeft = inv.due_date
                  ? differenceInDays(parseISO(inv.due_date), today)
                  : null;

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{inv.invoice_number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {inv.project_name} · {inv.province}
                        {inv.submitted_at && ` · Enviada ${new Date(inv.submitted_at).toLocaleDateString("pt-BR")}`}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {inv.is_proper ? (
                        <span className="flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Válida
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-700">
                          <XCircle className="w-3.5 h-3.5" /> Pendências
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {inv.status === "paid" ? (
                        <span className="flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                        </span>
                      ) : daysLeft !== null ? (
                        daysLeft < 0 ? (
                          <span className="flex items-center gap-1 text-xs text-red-700 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> {Math.abs(daysLeft)}d vencida
                          </span>
                        ) : (
                          <span className={`text-xs font-medium ${daysLeft <= 7 ? "text-red-700" : daysLeft <= 14 ? "text-amber-700" : "text-gray-600"}`}>
                            {daysLeft}d restantes
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-gray-900">{fmt(inv.total)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-900 text-sm">Legislação de Prompt Payment</h3>
          <p className="text-brand-700 text-sm mt-1">
            Ontário: proprietários têm 28 dias para pagar após receber uma proper invoice. BC: BC
            Construction Prompt Payment Act segue o mesmo padrão de 28 dias.
          </p>
        </div>
      </div>
    </div>
  );
}
