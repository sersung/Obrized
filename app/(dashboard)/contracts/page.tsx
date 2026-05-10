import Link from "next/link";
import { Plus, AlertTriangle, CheckCircle2, FileText, ArrowRight, Clock } from "lucide-react";

const contracts = [
  {
    id: "1",
    name: "CCDC-2 — Condomínio Maple Ridge",
    type: "CCDC-2",
    counterparty: "Thornhill Developments Inc.",
    value: "$1.200.000",
    risk: "high",
    clauses: 5,
    status: "analyzed",
    date: "2025-04-10",
  },
  {
    id: "2",
    name: "CCDC-5B — Escola Municipal Gatineau",
    type: "CCDC-5B",
    counterparty: "Ville de Gatineau",
    value: "$892.500",
    risk: "medium",
    clauses: 3,
    status: "analyzed",
    date: "2025-03-28",
  },
  {
    id: "3",
    name: "Contrato Personalizado — Yaletown",
    type: "custom",
    counterparty: "Vancouver Premier Corp.",
    value: "$860.000",
    risk: "critical",
    clauses: 9,
    status: "analyzed",
    date: "2025-04-15",
  },
  {
    id: "4",
    name: "CCDC-17 — Armazém Mississauga",
    type: "CCDC-17",
    counterparty: "Peel Industrial Parks Ltd.",
    value: "$3.200.000",
    risk: "low",
    clauses: 1,
    status: "analyzed",
    date: "2025-04-14",
  },
  {
    id: "5",
    name: "CCA-1 — Residência Westmount",
    type: "CCA-1",
    counterparty: "Westmount Developments",
    value: "$485.000",
    risk: "medium",
    clauses: 4,
    status: "pending",
    date: "2025-04-16",
  },
];

const riskConfig = {
  low: { label: "Baixo Risco", color: "bg-green-50 text-green-700", dot: "bg-green-500" },
  medium: { label: "Risco Médio", color: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  high: { label: "Alto Risco", color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  critical: { label: "Crítico", color: "bg-red-100 text-red-800", dot: "bg-red-600" },
};

export default function ContractsPage() {
  const riskCounts = contracts.reduce(
    (acc, c) => ({ ...acc, [c.risk]: (acc[c.risk as keyof typeof acc] || 0) + 1 }),
    { low: 0, medium: 0, high: 0, critical: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Risk overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Crítico", count: riskCounts.critical, color: "text-red-600 bg-red-50 border-red-100" },
          { label: "Alto Risco", count: riskCounts.high, color: "text-red-600 bg-red-50 border-red-100" },
          { label: "Risco Médio", count: riskCounts.medium, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Baixo Risco", count: riskCounts.low, color: "text-green-600 bg-green-50 border-green-100" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-5 ${item.color}`}>
            <p className="text-3xl font-bold">{item.count}</p>
            <p className="text-sm font-medium mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Contratos Analisados pela IA</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Análise de cláusulas CCDC com sugestões de redação para proteção do empreiteiro
          </p>
        </div>
        <Link
          href="/contracts/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Analisar Contrato
        </Link>
      </div>

      <div className="space-y-3">
        {contracts.map((contract) => {
          const risk = riskConfig[contract.risk as keyof typeof riskConfig];
          return (
            <div
              key={contract.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{contract.name}</h3>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded">
                        {contract.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{contract.counterparty}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-semibold text-gray-900">{contract.value}</span>
                      <span className="text-xs text-gray-400">{contract.date}</span>
                      {contract.status === "pending" ? (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Em análise
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {contract.clauses} cláusulas sinalizadas
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${risk.color}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                    {risk.label}
                  </span>
                  <Link
                    href={`/contracts/${contract.id}`}
                    className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-1"
                  >
                    Revisar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-900 text-sm">Análise de Contratos CCDC com IA</h3>
          <p className="text-purple-700 text-sm mt-1">
            A IA é treinada nos modelos CCDC padrão (CCDC-2, CCDC-5A, CCDC-5B, CCDC-17, CCA-1) e
            identifica desvios do padrão da indústria. Cláusulas de responsabilidade ilimitada,
            termos de pagamento desfavoráveis e transferências injustas de risco são sinalizadas
            automaticamente com sugestões de linguagem alternativa.
          </p>
        </div>
      </div>
    </div>
  );
}
