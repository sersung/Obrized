import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import type { SafetyReport } from "@/lib/supabase";
import { Plus, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

const typeLabels: Record<string, string> = {
  daily: "Diário de Obra",
  weekly: "Semanal",
  incident: "Incidente",
  toolbox: "Toolbox Talk",
};

export default async function SafetyPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';
  const { data: reports = [] } = await supabase
    .from("safety_reports")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  const list = reports as SafetyReport[];
  const thisWeek = list.filter((r) => {
    const diff = (new Date().getTime() - new Date(r.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Relatórios", value: list.length.toString(), color: "text-gray-900" },
          { label: "Esta Semana", value: thisWeek.length.toString(), color: "text-brand-600" },
          { label: "Incidentes", value: list.filter((r) => r.report_type === "incident").length.toString(), color: "text-red-600" },
          { label: "Toolbox Talks", value: list.filter((r) => r.report_type === "toolbox").length.toString(), color: "text-orange-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Relatórios de Segurança</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerados por IA via voz ou texto — conformidade OHSA / WorkSafeBC
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

      {/* Empty state */}
      {list.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-orange-400" />
          </div>
          <h3 className="font-semibold text-gray-900">Nenhum relatório ainda</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Dite as atividades do dia por voz e a IA gera o relatório completo.
          </p>
          <Link
            href="/safety/new"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar primeiro relatório
          </Link>
        </div>
      )}

      {list.length > 0 && (
        <div className="space-y-3">
          {list.map((report) => {
            const hasFlags =
              report.report &&
              Array.isArray((report.report as any).compliance_flags) &&
              (report.report as any).compliance_flags.length > 0;
            const workers = report.report ? (report.report as any).workers_on_site : null;

            return (
              <div
                key={report.id}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        report.report_type === "incident" ? "bg-red-50" : "bg-orange-50"
                      }`}
                    >
                      {report.report_type === "incident" ? (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{report.project_name}</h3>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded font-medium">
                          {typeLabels[report.report_type] ?? report.report_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-500">
                          {new Date(report.report_date).toLocaleDateString("pt-BR")}
                        </span>
                        {workers !== null && (
                          <span className="text-xs text-gray-500">{workers} trabalhadores</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {hasFlags ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        <AlertTriangle className="w-3 h-3" />
                        Alertas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Conforme
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="font-semibold text-orange-900 text-sm">Conformidade OHSA / WorkSafeBC</h3>
          <p className="text-orange-700 text-sm mt-1">
            Dite as atividades do dia por voz. A IA estrutura o relatório conforme OHSA (Ontario) ou
            WorkSafeBC, identifica riscos e sinaliza não-conformidades automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
