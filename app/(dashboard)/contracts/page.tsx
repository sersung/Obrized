import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Contract } from "@/lib/supabase";
import { Plus, AlertTriangle, FileText, ArrowRight, Clock } from "lucide-react";

const riskConfig = {
  low: { label: "Baixo Risco", color: "bg-green-50 text-green-700", dot: "bg-green-500" },
  medium: { label: "Risco Médio", color: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  high: { label: "Alto Risco", color: "bg-red-50 text-red-700", dot: "bg-red-500" },
  critical: { label: "Crítico", color: "bg-red-100 text-red-800", dot: "bg-red-600" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const { data: contracts = [] } = await supabase
    .from("contracts")
    .select("*")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });

  const list = contracts as Contract[];
  const riskCounts = list.reduce(
    (acc, c) => ({ ...acc, [c.overall_risk]: (acc[c.overall_risk as keyof typeof acc] || 0) + 1 }),
    { low: 0, medium: 0, high: 0, critical: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Risk overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Crítico", count: riskCounts.critical, color: "text-red-700 bg-red-50 border-red-100" },
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

      {/* Empty state */}
      {list.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-purple-400" />
          </div>
          <h3 className="font-semibold text-gray-900">Nenhum contrato analisado ainda</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Envie um contrato CCDC ou personalizado para identificar cláusulas de risco.
          </p>
          <Link
            href="/contracts/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Analisar primeiro contrato
          </Link>
        </div>
      )}

      {list.length > 0 && (
        <div className="space-y-3">
          {list.map((contract) => {
            const risk = riskConfig[contract.overall_risk as keyof typeof riskConfig] ?? riskConfig.low;
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
                          {contract.contract_type}
                        </span>
                      </div>
                      {contract.counterparty && (
                        <p className="text-sm text-gray-500 mt-0.5">{contract.counterparty}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {contract.value > 0 && (
                          <span className="text-sm font-semibold text-gray-900">{fmt(contract.value)}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(contract.created_at).toLocaleDateString("pt-BR")}
                        </span>
                        {contract.status === "pending" ? (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Em análise
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {contract.clauses_count} cláusulas sinalizadas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                      {risk.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-purple-900 text-sm">Análise de Contratos CCDC com IA</h3>
          <p className="text-purple-700 text-sm mt-1">
            A IA identifica desvios dos modelos CCDC padrão. Cláusulas de responsabilidade ilimitada,
            termos de pagamento desfavoráveis e transferências injustas de risco são sinalizadas
            automaticamente com sugestões de linguagem alternativa.
          </p>
        </div>
      </div>
    </div>
  );
}
