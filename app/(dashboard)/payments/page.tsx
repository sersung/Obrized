import Link from "next/link";
import { Plus, Clock, CheckCircle2, AlertTriangle, XCircle, ArrowRight, DollarSign } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const invoices = [
  {
    id: "1",
    number: "INV-2025-051",
    project: "Condomínio Maple Ridge",
    submittedAt: "2025-04-03",
    dueDate: "2025-05-01",
    amount: 87500,
    status: "submitted",
    isProper: true,
    province: "ON",
  },
  {
    id: "2",
    number: "INV-2025-047",
    project: "Escritórios Yaletown",
    submittedAt: "2025-04-05",
    dueDate: "2025-05-03",
    amount: 42800,
    status: "submitted",
    isProper: false,
    province: "BC",
  },
  {
    id: "3",
    number: "INV-2025-042",
    project: "King St Reforma",
    submittedAt: "2025-03-20",
    dueDate: "2025-04-17",
    amount: 31200,
    status: "overdue",
    isProper: true,
    province: "ON",
  },
  {
    id: "4",
    number: "INV-2025-038",
    project: "Condomínio Maple Ridge",
    submittedAt: "2025-03-06",
    dueDate: "2025-04-03",
    amount: 65000,
    status: "paid",
    isProper: true,
    province: "ON",
  },
  {
    id: "5",
    number: "INV-2025-033",
    project: "Escritórios Yaletown",
    submittedAt: "2025-02-20",
    dueDate: "2025-03-20",
    amount: 54300,
    status: "paid",
    isProper: true,
    province: "BC",
  },
];

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600" },
  submitted: { label: "Submetida", color: "bg-blue-50 text-blue-700" },
  certified: { label: "Certificada", color: "bg-teal-50 text-teal-700" },
  paid: { label: "Paga", color: "bg-green-50 text-green-700" },
  disputed: { label: "Disputada", color: "bg-amber-50 text-amber-700" },
  overdue: { label: "Vencida", color: "bg-red-50 text-red-700" },
};

function PaymentCountdown({ dueDate, status }: { dueDate: string; status: string }) {
  if (status === "paid") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-700">
        <CheckCircle2 className="w-3.5 h-3.5" /> Pago
      </span>
    );
  }

  const today = new Date();
  const due = parseISO(dueDate);
  const daysLeft = differenceInDays(due, today);

  if (daysLeft < 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-700 font-medium">
        <XCircle className="w-3.5 h-3.5" /> {Math.abs(daysLeft)}d vencida
      </span>
    );
  }

  const progress = Math.max(0, Math.min(100, ((28 - daysLeft) / 28) * 100));
  const color = daysLeft > 14 ? "bg-green-500" : daysLeft > 7 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${progress}%` }} />
      </div>
      <span className={`text-xs font-medium ${daysLeft <= 7 ? "text-red-700" : daysLeft <= 14 ? "text-amber-700" : "text-gray-600"}`}>
        {daysLeft}d
      </span>
    </div>
  );
}

export default function PaymentsPage() {
  const totalPending = invoices
    .filter((i) => i.status === "submitted" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-orange-600">{fmt(totalPending)}</p>
          <p className="text-sm text-gray-500">A Receber</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-red-600">
            {fmt(invoices.find((i) => i.status === "overdue")?.amount ?? 0)}
          </p>
          <p className="text-sm text-gray-500">Vencidas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-green-600">{fmt(totalPaid)}</p>
          <p className="text-sm text-gray-500">Recebido (mês)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-gray-900">
            {invoices.filter((i) => i.isProper).length}/{invoices.length}
          </p>
          <p className="text-sm text-gray-500">Faturas Válidas</p>
        </div>
      </div>

      {/* Alert */}
      {invoices.some((i) => i.status === "overdue") && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-900 text-sm">
              Fatura vencida — prazo de 28 dias da Lei de Prompt Payment ultrapassado
            </p>
            <p className="text-red-700 text-sm mt-0.5">
              INV-2025-042 · King St Reforma · {fmt(31200)} · Inicie o processo de adjudicação no
              ODACC.
            </p>
          </div>
          <Link
            href="/payments/3"
            className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex-shrink-0"
          >
            Agir Agora
          </Link>
        </div>
      )}

      {/* Table */}
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

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                Fatura
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                Proper Invoice
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                Prazo 28d
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                Valor
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv) => {
              const status = statusConfig[inv.status as keyof typeof statusConfig];
              return (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{inv.number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {inv.project} · {inv.province} · Enviada {inv.submittedAt}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    {inv.isProper ? (
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
                    <PaymentCountdown dueDate={inv.dueDate} status={inv.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="font-semibold text-gray-900">{fmt(inv.amount)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/payments/${inv.id}`}
                      className="text-brand-600 hover:text-brand-700 font-medium text-xs flex items-center gap-1 justify-end"
                    >
                      Ver <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-900 text-sm">Legislação de Prompt Payment</h3>
          <p className="text-brand-700 text-sm mt-1">
            Ontário: proprietários têm 28 dias para pagar após receber uma "proper invoice".
            Empreiteiros gerais têm 7 dias adicionais para repassar aos subempreiteiros. Disputas
            podem ser resolvidas via adjudicação acelerada ODACC. British Columbia: BC Construction
            Prompt Payment Act (Bill 20) segue o mesmo padrão de 28 dias.
          </p>
        </div>
      </div>
    </div>
  );
}
