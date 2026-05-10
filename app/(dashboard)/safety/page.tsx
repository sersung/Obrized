import Link from "next/link";
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const reports = [
  {
    id: "1",
    project: "Condomínio Maple Ridge",
    date: "2025-04-16",
    type: "daily",
    workers: 18,
    hazards: 2,
    incidents: 0,
    status: "signed",
    aiGenerated: true,
  },
  {
    id: "2",
    project: "Condomínio Maple Ridge",
    date: "2025-04-15",
    type: "daily",
    workers: 22,
    hazards: 1,
    incidents: 0,
    status: "signed",
    aiGenerated: true,
  },
  {
    id: "3",
    project: "Escritórios Yaletown",
    date: "2025-04-16",
    type: "daily",
    workers: 11,
    hazards: 3,
    incidents: 1,
    status: "draft",
    aiGenerated: true,
  },
  {
    id: "4",
    project: "King St Reforma",
    date: "2025-04-14",
    type: "toolbox",
    workers: 6,
    hazards: 0,
    incidents: 0,
    status: "signed",
    aiGenerated: false,
  },
  {
    id: "5",
    project: "Condomínio Maple Ridge",
    date: "2025-04-14",
    type: "daily",
    workers: 20,
    hazards: 1,
    incidents: 0,
    status: "signed",
    aiGenerated: true,
  },
];

const compliance = [
  {
    project: "Condomínio Maple Ridge",
    lastReport: "2025-04-16",
    status: "compliant",
    streak: 12,
  },
  { project: "Escritórios Yaletown", lastReport: "2025-04-16", status: "draft", streak: 7 },
  { project: "King St Reforma", lastReport: "2025-04-14", status: "overdue", streak: 0 },
  { project: "Residência Westmount", lastReport: "2025-04-12", status: "overdue", streak: 0 },
];

const typeLabels: Record<string, string> = {
  daily: "Diário",
  weekly: "Semanal",
  incident: "Incidente",
  toolbox: "Toolbox Talk",
};

export default function SafetyPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Dias sem incidentes", value: "47", color: "text-green-600" },
          { label: "Relatórios este mês", value: "32", color: "text-brand-600" },
          { label: "Gerados por IA", value: "89%", color: "text-purple-600" },
          { label: "Projetos em dia", value: "2/4", color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Compliance overview */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Conformidade por Projeto</h3>
        <div className="space-y-3">
          {compliance.map((c) => (
            <div key={c.project} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-3">
                {c.status === "compliant" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : c.status === "draft" ? (
                  <Clock className="w-5 h-5 text-amber-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{c.project}</p>
                  <p className="text-xs text-gray-500">Último relatório: {c.lastReport}</p>
                </div>
              </div>
              <div className="text-right">
                {c.status === "compliant" ? (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    {c.streak} dias consecutivos
                  </span>
                ) : c.status === "draft" ? (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                    Rascunho pendente
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Atrasado
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports list */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Relatórios Recentes</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerados por voz e estruturados pela IA conforme OHSA/WorkSafeBC
          </p>
        </div>
        <Link
          href="/safety/new"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Relatório
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                Projeto / Data
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                Tipo
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                Trabalhadores
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                Riscos / Incidentes
              </th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{report.project}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    {report.date}
                    {report.aiGenerated && (
                      <span className="bg-purple-50 text-purple-600 text-xs px-1.5 py-0.5 rounded font-medium">
                        IA
                      </span>
                    )}
                  </p>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className="text-gray-600">{typeLabels[report.type]}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-gray-700">{report.workers}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {report.hazards > 0 && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                        {report.hazards} risco{report.hazards > 1 ? "s" : ""}
                      </span>
                    )}
                    {report.incidents > 0 && (
                      <span className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {report.incidents} incidente
                      </span>
                    )}
                    {report.hazards === 0 && report.incidents === 0 && (
                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Limpo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {report.status === "signed" ? (
                    <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full font-medium">
                      Assinado
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                      Rascunho
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/safety/${report.id}`}
                    className="text-brand-600 hover:text-brand-700 font-medium text-xs flex items-center gap-1 justify-end"
                  >
                    Ver <ArrowRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
