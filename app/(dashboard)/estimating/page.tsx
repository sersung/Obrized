import Link from "next/link";
import {
  Plus,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";

const estimates = [
  {
    id: "1",
    name: "Residencial Thornhill - Fase 2",
    project: "Thornhill Developments",
    status: "won",
    createdAt: "2025-04-10",
    value: "$487.300",
    confidence: 94,
    items: 47,
  },
  {
    id: "2",
    name: "Reforma Comercial Bay Street",
    project: "Bay Commercial Inc.",
    status: "submitted",
    createdAt: "2025-04-14",
    value: "$234.800",
    confidence: 89,
    items: 32,
  },
  {
    id: "3",
    name: "Condomínio Burnaby Heights",
    project: "Burnaby Realty Group",
    status: "draft",
    createdAt: "2025-04-16",
    value: "$1.140.000",
    confidence: 76,
    items: 89,
  },
  {
    id: "4",
    name: "Escola Municipal Gatineau",
    project: "Ville de Gatineau",
    status: "lost",
    createdAt: "2025-03-28",
    value: "$892.500",
    confidence: 91,
    items: 63,
  },
  {
    id: "5",
    name: "Armazém Industrial Mississauga",
    project: "Peel Industrial Parks",
    status: "submitted",
    createdAt: "2025-04-15",
    value: "$3.200.000",
    confidence: 88,
    items: 124,
  },
];

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600", icon: <Clock className="w-3 h-3" /> },
  submitted: { label: "Submetido", color: "bg-blue-50 text-blue-700", icon: <FileText className="w-3 h-3" /> },
  won: { label: "Ganho", color: "bg-green-50 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  lost: { label: "Perdido", color: "bg-red-50 text-red-600", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function EstimatingPage() {
  const totalValue = estimates
    .filter((e) => e.status === "won")
    .reduce((sum, e) => sum + parseFloat(e.value.replace(/[$,.]/g, "")) / 100, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Orçamentos", value: estimates.length.toString(), color: "text-gray-900" },
          { label: "Taxa de Sucesso", value: "62%", color: "text-green-600" },
          { label: "Valor Ganho (mês)", value: "$487K", color: "text-brand-600" },
          { label: "Em Avaliação", value: "$3.4M", color: "text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Orçamentos Recentes</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Levantamentos quantitativos gerados por IA a partir de plantas digitais
          </p>
        </div>
        <Link
          href="/estimating/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Orçamento
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                Itens IA
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">
                Confiança IA
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Valor
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {estimates.map((est) => {
              const status = statusConfig[est.status as keyof typeof statusConfig];
              return (
                <tr key={est.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{est.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{est.project} · {est.createdAt}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-gray-700">{est.items} itens</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            est.confidence >= 90
                              ? "bg-green-500"
                              : est.confidence >= 75
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${est.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{est.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900">{est.value}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/estimating/${est.id}`}
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

      {/* Info box */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-semibold text-brand-900 text-sm">Como funciona a extração por IA</h3>
          <p className="text-brand-700 text-sm mt-1">
            Faça upload da planta em PDF. A IA usa Visão Computacional para identificar polígonos,
            contagens de portas, metragens e componentes estruturais — convertendo dias de trabalho
            manual em minutos. Os quantitativos são vinculados automaticamente a preços de materiais
            regionais canadenses.
          </p>
        </div>
      </div>
    </div>
  );
}
