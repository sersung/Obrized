import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Calendar,
  FileText,
  ShieldCheck,
  Calculator,
} from "lucide-react";

const kpis = [
  {
    label: "Projetos Ativos",
    value: "8",
    change: "+2",
    trend: "up",
    icon: <Calendar className="w-5 h-5" />,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Receita do Mês",
    value: "$347.500",
    change: "+12%",
    trend: "up",
    icon: <DollarSign className="w-5 h-5" />,
    color: "text-green-600 bg-green-50",
  },
  {
    label: "Faturas Pendentes",
    value: "$128.200",
    change: "3 faturas",
    trend: "neutral",
    icon: <FileText className="w-5 h-5" />,
    color: "text-orange-600 bg-orange-50",
  },
  {
    label: "Vence em 7 dias",
    value: "$42.800",
    change: "Urgente",
    trend: "down",
    icon: <Clock className="w-5 h-5" />,
    color: "text-red-600 bg-red-50",
  },
];

const activeProjects = [
  {
    id: "1",
    name: "Condomínio Maple Ridge",
    location: "Toronto, ON",
    status: "active",
    progress: 67,
    value: "$1.2M",
    endDate: "2025-08-15",
    daysLeft: 119,
    phase: "Estrutural",
  },
  {
    id: "2",
    name: "Escritórios Yaletown",
    location: "Vancouver, BC",
    status: "active",
    progress: 34,
    value: "$860K",
    endDate: "2025-11-30",
    daysLeft: 226,
    phase: "Fundação",
  },
  {
    id: "3",
    name: "Reforma Comercial King St",
    location: "Toronto, ON",
    status: "delayed",
    progress: 82,
    value: "$245K",
    endDate: "2025-05-01",
    daysLeft: -16,
    phase: "Acabamento",
  },
  {
    id: "4",
    name: "Residência Westmount",
    location: "Montréal, QC",
    status: "active",
    progress: 18,
    value: "$485K",
    endDate: "2026-01-20",
    daysLeft: 278,
    phase: "Projeto",
  },
];

const alerts = [
  {
    type: "error",
    title: "Fatura #INV-2024-047 vence em 2 dias",
    description: "Projeto Yaletown — $42.800 — Verificar WSIB clearance pendente",
    time: "há 1 hora",
  },
  {
    type: "warning",
    title: "Projeto King St com 16 dias de atraso",
    description: "Cronograma requer recalculação — trabalho de acabamento bloqueado",
    time: "há 3 horas",
  },
  {
    type: "warning",
    title: "Relatório de segurança não submetido",
    description: "Maple Ridge — Relatório diário em aberto há 2 dias",
    time: "há 5 horas",
  },
  {
    type: "success",
    title: "Contrato CCDC-2 analisado",
    description: "Residência Westmount — 3 cláusulas de alto risco identificadas",
    time: "há 1 dia",
  },
];

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

function StatusBadge({ status, daysLeft }: { status: string; daysLeft: number }) {
  if (status === "delayed" || daysLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <AlertTriangle className="w-3 h-3" />
        Atrasado {Math.abs(daysLeft)}d
      </span>
    );
  }
  if (daysLeft <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
        <Clock className="w-3 h-3" />
        {daysLeft}d restantes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
      <CheckCircle2 className="w-3 h-3" />
      {daysLeft}d restantes
    </span>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  kpi.trend === "up"
                    ? "bg-green-50 text-green-700"
                    : kpi.trend === "down"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {kpi.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                ) : kpi.trend === "down" ? (
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                ) : null}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Projetos Ativos</h2>
            <Link
              href="/scheduling"
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeProjects.map((project) => (
              <div key={project.id} className="p-5 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {project.location} · {project.phase}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-gray-900 text-sm">{project.value}</p>
                    <StatusBadge status={project.status} daysLeft={project.daysLeft} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        project.status === "delayed" ? "bg-red-500" : "bg-brand-600"
                      }`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {project.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Alertas</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {alerts.map((alert, i) => (
              <div key={i} className="p-4">
                <div className="flex gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.type === "error"
                        ? "bg-red-500"
                        : alert.type === "warning"
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              </div>
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
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${action.color}`}
              >
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
