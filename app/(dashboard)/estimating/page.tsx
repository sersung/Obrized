import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import type { Estimate } from "@/lib/supabase";
import {
  Plus,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-600", icon: <Clock className="w-3 h-3" /> },
  submitted: { label: "Submetido", color: "bg-blue-50 text-blue-700", icon: <FileText className="w-3 h-3" /> },
  won: { label: "Ganho", color: "bg-green-50 text-green-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  lost: { label: "Perdido", color: "bg-red-50 text-red-600", icon: <AlertCircle className="w-3 h-3" /> },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

export default async function EstimatingPage() {
  const session = await getServerSession(authOptions);
  const { data: estimates = [] } = await supabase
    .from("estimates")
    .select("*")
    .eq("user_email", session?.user?.email ?? "")
    .order("created_at", { ascending: false });

  const list = estimates as Estimate[];
  const won = list.filter((e) => e.status === "won");
  const wonValue = won.reduce((s, e) => s + e.total_value, 0);
  const submitted = list.filter((e) => e.status === "submitted");
  const submittedValue = submitted.reduce((s, e) => s + e.total_value, 0);
  const successRate = list.length > 0 ? Math.round((won.length / list.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Orçamentos", value: list.length.toString(), color: "text-gray-900" },
          { label: "Taxa de Sucesso", value: `${successRate}%`, color: "text-green-600" },
          { label: "Valor Ganho", value: wonValue > 0 ? fmt(wonValue) : "—", color: "text-brand-600" },
          { label: "Em Avaliação", value: submittedValue > 0 ? fmt(submittedValue) : "—", color: "text-orange-600" },
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
          <h2 className="font-semibold text-gray-900">Orçamentos</h2>
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

      {/* Empty state */}
      {list.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-brand-400" />
          </div>
          <h3 className="font-semibold text-gray-900">Nenhum orçamento ainda</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Faça upload de uma planta em PDF e a IA extrairá os quantitativos em minutos.
          </p>
          <Link
            href="/estimating/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar primeiro orçamento
          </Link>
        </div>
      )}

      {/* Table */}
      {list.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Orçamento
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">
                  Itens
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
              {list.map((est) => {
                const status = statusConfig[est.status as keyof typeof statusConfig] ?? statusConfig.draft;
                const itemCount = Array.isArray(est.items) ? est.items.length : 0;
                return (
                  <tr key={est.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{est.project_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {est.province} · {new Date(est.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-gray-700">{itemCount} itens</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      {est.confidence > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${
                                est.confidence >= 90 ? "bg-green-500" : est.confidence >= 75 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${est.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{est.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-gray-900">{fmt(est.total_value)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-gray-300 text-xs flex items-center gap-1 justify-end">
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
            manual em minutos.
          </p>
        </div>
      </div>
    </div>
  );
}
