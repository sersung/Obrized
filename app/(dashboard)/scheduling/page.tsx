"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronRight,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, Language } from "@/lib/translations";

type TaskStatus = "not_started" | "in_progress" | "delayed" | "completed" | "blocked";

type Task = {
  id: string;
  name: string;
  phase: string;
  planned_start: string;
  planned_end: string;
  progress_pct: number;
  status: TaskStatus;
  is_critical: boolean;
  workers: number;
};

// Multilingual translations for task names and phases
const TASK_NAME_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Projeto Executivo e Aprovações": { 
    EN: "Executive Design & Permits", 
    FR: "Conception Exécutive & Permis", 
    PT: "Projeto Executivo e Aprovações", 
    ES: "Diseño Ejecutivo y Permisos" 
  },
  "Demolição e Terraplanagem": { 
    EN: "Demolition & Excavation", 
    FR: "Démolition & Excavation", 
    PT: "Demolição e Terraplanagem", 
    ES: "Demolición y Excavación" 
  },
  "Fundação — Estacas e Radier": { 
    EN: "Foundation - Piling & Slab", 
    FR: "Fondation - Pieux & Dalle", 
    PT: "Fundação — Estacas e Radier", 
    ES: "Cimentación - Pilotaje y Losa" 
  },
  "Estrutura de Concreto — T.S.S.": { 
    EN: "Concrete Structure - Superstructure", 
    FR: "Structure de Béton - Superstructure", 
    PT: "Estrutura de Concreto — Superestrutura", 
    ES: "Estructura de Hormigón - Superestructura" 
  },
  "Alvenaria Externa": { 
    EN: "Exterior Brickwork / Cladding", 
    FR: "Maçonnerie Extérieure / Bardage", 
    PT: "Alvenaria Externa", 
    ES: "Albañilería Exterior / Revestimiento" 
  },
  "Instalações Elétricas": { 
    EN: "MEP Electrical Rough-ins", 
    FR: "Électricité MEP", 
    PT: "Instalações Elétricas", 
    ES: "Instalaciones Eléctricas MEP" 
  },
  "Instalações Hidrossanitárias": { 
    EN: "MEP Plumbing Rough-ins", 
    FR: "Plomberie MEP", 
    PT: "Instalações Hidrossanitárias", 
    ES: "Instalaciones Hidrosanitarias MEP" 
  },
  "Revestimentos Internos": { 
    EN: "Drywall & Interior Finishes", 
    FR: "Finitions Intérieures", 
    PT: "Revestimentos Internos", 
    ES: "Revestimientos Internos y Acabados" 
  },
  "Fachada e Paisagismo": { 
    EN: "Facade & Landscaping", 
    FR: "Façade & Paysagement", 
    PT: "Fachada e Paisagismo", 
    ES: "Fachada y Paisajismo" 
  },
  "Vistoria Final e Habite-se": { 
    EN: "Final Inspection & Occupancy", 
    FR: "Inspection Finale & Occupation", 
    PT: "Vistoria Final e Habite-se", 
    ES: "Inspección Final y Ocupación" 
  },
};

const PHASE_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Pré-construção": { 
    EN: "Pre-construction", 
    FR: "Pré-construction", 
    PT: "Pré-construção", 
    ES: "Preconstrucción" 
  },
  "Fundação": { 
    EN: "Foundation", 
    FR: "Fondation", 
    PT: "Fundação", 
    ES: "Cimentación" 
  },
  "Estrutural": { 
    EN: "Structural", 
    FR: "Structure", 
    PT: "Estrutural", 
    ES: "Estructural" 
  },
  "Vedação": { 
    EN: "Cladding", 
    FR: "Enveloppe", 
    PT: "Vedação", 
    ES: "Revestimiento" 
  },
  "Instalações": { 
    EN: "MEP Services", 
    FR: "Services MEP", 
    PT: "Instalações", 
    ES: "Instalaciones" 
  },
  "Acabamento": { 
    EN: "Finishes", 
    FR: "Finitions", 
    PT: "Acabamento", 
    ES: "Acabados" 
  },
  "Encerramento": { 
    EN: "Closeout", 
    FR: "Clôture", 
    PT: "Encerramento", 
    ES: "Cierre" 
  },
};

const PROJECT_TASKS: Task[] = [
  { id: "1", name: "Projeto Executivo e Aprovações", phase: "Pré-construção", planned_start: "2025-01-06", planned_end: "2025-02-14", progress_pct: 100, status: "completed", is_critical: true, workers: 3 },
  { id: "2", name: "Demolição e Terraplanagem", phase: "Fundação", planned_start: "2025-02-17", planned_end: "2025-03-07", progress_pct: 100, status: "completed", is_critical: false, workers: 8 },
  { id: "3", name: "Fundação — Estacas e Radier", phase: "Fundação", planned_start: "2025-03-10", planned_end: "2025-04-04", progress_pct: 100, status: "completed", is_critical: true, workers: 12 },
  { id: "4", name: "Estrutura de Concreto — T.S.S.", phase: "Estrutural", planned_start: "2025-04-07", planned_end: "2025-06-20", progress_pct: 45, status: "in_progress", is_critical: true, workers: 18 },
  { id: "5", name: "Alvenaria Externa", phase: "Vedação", planned_start: "2025-05-05", planned_end: "2025-07-11", progress_pct: 0, status: "not_started", is_critical: false, workers: 10 },
  { id: "6", name: "Instalações Elétricas", phase: "Instalações", planned_start: "2025-06-02", planned_end: "2025-08-01", progress_pct: 0, status: "not_started", is_critical: true, workers: 6 },
  { id: "7", name: "Instalações Hidrossanitárias", phase: "Instalações", planned_start: "2025-06-09", planned_end: "2025-07-25", progress_pct: 0, status: "not_started", is_critical: false, workers: 5 },
  { id: "8", name: "Revestimentos Internos", phase: "Acabamento", planned_start: "2025-07-14", planned_end: "2025-09-12", progress_pct: 0, status: "not_started", is_critical: false, workers: 14 },
  { id: "9", name: "Fachada e Paisagismo", phase: "Acabamento", planned_start: "2025-08-04", planned_end: "2025-09-19", progress_pct: 0, status: "not_started", is_critical: false, workers: 8 },
  { id: "10", name: "Vistoria Final e Habite-se", phase: "Encerramento", planned_start: "2025-09-22", planned_end: "2025-10-03", progress_pct: 0, status: "not_started", is_critical: true, workers: 2 },
];

const PROJECT_START = new Date("2025-01-06");
const PROJECT_END = new Date("2025-10-03");
const TOTAL_DAYS = Math.ceil((PROJECT_END.getTime() - PROJECT_START.getTime()) / 86400000);

export default function SchedulingPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [tasks, setTasks] = useState(PROJECT_TASKS);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [delayedTask, setDelayedTask] = useState<string | null>(null);
  const [delayDays, setDelayDays] = useState(14);
  const [showDelayDialog, setShowDelayDialog] = useState(false);
  const [showCriticalPathOnly, setShowCriticalPathOnly] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
    completed: { 
      label: lang === "EN" ? "Completed" : 
             lang === "FR" ? "Terminée" : 
             lang === "PT" ? "Concluída" : 
             "Completada", 
      color: "text-emerald-700", 
      bg: "bg-emerald-500" 
    },
    in_progress: { 
      label: lang === "EN" ? "In Progress" : 
             lang === "FR" ? "En cours" : 
             lang === "PT" ? "Em Andamento" : 
             "En Progreso", 
      color: "text-blue-700", 
      bg: "bg-blue-500" 
    },
    not_started: { 
      label: lang === "EN" ? "Not Started" : 
             lang === "FR" ? "Non démarrée" : 
             lang === "PT" ? "Não Iniciada" : 
             "No Iniciada", 
      color: "text-gray-500", 
      bg: "bg-gray-300" 
    },
    delayed: { 
      label: lang === "EN" ? "Delayed" : 
             lang === "FR" ? "Retardée" : 
             lang === "PT" ? "Atrasada" : 
             "Retrasada", 
      color: "text-rose-700", 
      bg: "bg-rose-500" 
    },
    blocked: { 
      label: lang === "EN" ? "Blocked" : 
             lang === "FR" ? "Bloquée" : 
             lang === "PT" ? "Bloqueada" : 
             "Bloqueada", 
      color: "text-rose-700", 
      bg: "bg-rose-300" 
    },
  };

  const getBarStyle = (task: Task) => {
    const start = new Date(task.planned_start);
    const end = new Date(task.planned_end);
    const left = Math.max(0, Math.ceil((start.getTime() - PROJECT_START.getTime()) / 86400000));
    const width = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    return {
      left: `${(left / TOTAL_DAYS) * 100}%`,
      width: `${(width / TOTAL_DAYS) * 100}%`,
    };
  };

  const handleOptimize = async () => {
    if (!delayedTask) return;
    setIsOptimizing(true);
    setShowDelayDialog(false);

    try {
      const response = await fetch("/api/scheduling/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          delayedTaskId: delayedTask,
          delayDays,
        }),
      });

      if (!response.ok) throw new Error("Optimization failed");
      const data = await response.json();

      setTasks((prev) =>
        prev.map((t) => {
          const updated = data.updatedTasks?.find((u: Task) => u.id === t.id);
          return updated ? { ...t, ...updated } : t;
        })
      );
      toast.success(
        lang === "EN" ? `Schedule recalculated. ${data.affectedCount ?? 0} tasks adjusted.` :
        lang === "FR" ? `Calendrier recalculé. ${data.affectedCount ?? 0} tâches ajustées.` :
        lang === "PT" ? `Cronograma recalculado. ${data.affectedCount ?? 0} tarefas ajustadas.` :
        `Cronograma recalculado. Se ajustaron ${data.affectedCount ?? 0} tareas.`
      );
    } catch {
      toast.error(
        lang === "EN" ? "Error optimizing schedule. Verify API key." :
        lang === "FR" ? "Erreur d'optimisation du calendrier. Vérifiez votre clé API." :
        lang === "PT" ? "Erro ao otimizar o cronograma. Verifique a chave da API." :
        "Error al optimizar el cronograma. Verifique la clave API."
      );
    } finally {
      setIsOptimizing(false);
      setDelayedTask(null);
    }
  };

  const phases = [...new Set(tasks.map((t) => t.phase))];
  const months = 
    lang === "EN" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"] :
    lang === "FR" ? ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct"] :
    lang === "PT" ? ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"] :
    ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{tasks.filter((t) => t.status === "completed").length}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("tasks_completed")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-blue-600 tracking-tight">{tasks.filter((t) => t.status === "in_progress").length}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("in_progress_tasks")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-rose-500 tracking-tight">{tasks.filter((t) => t.is_critical).length}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("critical_tasks")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">169d</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("days_to_completion")}</p>
        </div>
      </div>

      {/* Project selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center justify-between shadow-sm">
        <div>
          <h3 className="font-bold text-gray-900 text-base">Maple Ridge Condominium</h3>
          <p className="text-xs text-gray-400 font-semibold mt-1">Toronto, ON · Jan 2025 – Oct 2025 · $1.2M</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("general_progress")}</p>
            <p className="font-extrabold text-gray-900 text-lg mt-0.5">38%</p>
          </div>
          <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200/50">
            <div className="bg-brand-600 h-2 rounded-full" style={{ width: "38%" }} />
          </div>
        </div>
      </div>

      {/* Delay dialog */}
      {showDelayDialog && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl border border-gray-150">
            <h3 className="font-bold text-gray-900 text-lg mb-2">{t("register_delay")}</h3>
            <p className="text-gray-400 font-medium text-xs mb-5 leading-relaxed">
              {lang === "EN" ? "Enter the delay period below. Obrized will automatically adjust dependent paths using predictive resource allocation." :
               lang === "FR" ? "Indiquez la durée du retard. Obrized ajustera automatiquement les chemins dépendants à l'aide de l'IA." :
               lang === "PT" ? "Insira o período de atraso abaixo. O Obrized ajustará automaticamente os caminhos dependentes usando alocação preditiva de recursos de IA." :
               "Indique el período de retraso a continuación. Obrized ajustará automáticamente las rutas dependientes utilizando la asignación predictiva de recursos de IA."}
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {lang === "EN" ? "Delayed Task" : lang === "FR" ? "Tâche Retardée" : lang === "PT" ? "Tarefa Atrasada" : "Tarea Retrasada"}
              </label>
              <select
                value={delayedTask ?? ""}
                onChange={(e) => setDelayedTask(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium text-gray-700"
              >
                {tasks
                  .filter((t) => t.status !== "completed")
                  .map((t) => {
                    const transName = TASK_NAME_TRANSLATIONS[t.name]?.[lang] || t.name;
                    return <option key={t.id} value={t.id}>{transName}</option>;
                  })}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t("delay_days")} <span className="text-brand-600 font-extrabold">{delayDays} {lang === "EN" ? "days" : lang === "FR" ? "jours" : lang === "PT" ? "dias" : "días"}</span>
              </label>
              <input
                type="range"
                min={1}
                max={60}
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                <span>1 {lang === "EN" ? "day" : lang === "FR" ? "jour" : lang === "PT" ? "dia" : "día"}</span>
                <span>60 {lang === "EN" ? "days" : lang === "FR" ? "jours" : lang === "PT" ? "dias" : "días"}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelayDialog(false)}
                className="flex-1 border border-gray-250 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex-1 bg-brand-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-brand-700 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2"
              >
                {isOptimizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-brand-200" />
                )}
                {t("recalculate")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gantt Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-gray-900 text-base">{t("gantt_chart")}</h3>
            {/* Critical Path Toggle */}
            <button
              onClick={() => setShowCriticalPathOnly(!showCriticalPathOnly)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                showCriticalPathOnly
                  ? "bg-rose-50 border-rose-200 text-rose-700 font-extrabold"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              ⚠️ {t("critical_path")}
            </button>
          </div>
          <button
            onClick={() => {
              setDelayedTask(tasks.find((t) => t.status === "in_progress")?.id ?? null);
              setShowDelayDialog(true);
            }}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-600 hover:shadow-md transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            {t("register_delay")}
          </button>
        </div>

        {/* Month headers */}
        <div className="pl-[220px] pr-6 border-b border-gray-150 overflow-x-auto bg-slate-50/20">
          <div className="flex" style={{ minWidth: "800px" }}>
            {months.map((m) => (
              <div key={m} className="flex-1 text-center text-[10px] font-bold text-gray-400 py-3.5 border-r border-gray-100 last:border-0 uppercase tracking-wider">
                {m}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {phases.map((phase) => {
            const transPhase = PHASE_TRANSLATIONS[phase]?.[lang] || phase;
            const phaseTasks = tasks.filter((t) => t.phase === phase && (!showCriticalPathOnly || t.is_critical));
            
            if (phaseTasks.length === 0) return null;

            return (
              <div key={phase}>
                <div className="px-6 py-2.5 bg-gray-50/50 border-y border-gray-100 shadow-inner">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {transPhase}
                  </span>
                </div>
                {phaseTasks.map((task) => {
                  const barStyle = getBarStyle(task);
                  const cfg = statusConfig[task.status];
                  const transName = TASK_NAME_TRANSLATIONS[task.name]?.[lang] || task.name;
                  
                  return (
                    <div
                      key={task.id}
                      className="flex items-center border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
                      style={{ minWidth: "1020px" }}
                    >
                      {/* Task name */}
                      <div className="w-[220px] flex-shrink-0 px-6 py-4.5 border-r border-gray-50">
                        <div className="flex items-center gap-2">
                          {task.is_critical && (
                            <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" title="Critical Path" />
                          )}
                          <p className="text-sm font-bold text-gray-800 truncate" title={transName}>{transName}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                          {task.status === "in_progress" && (
                            <span className="text-[10px] font-bold text-gray-400">{task.progress_pct}%</span>
                          )}
                        </div>
                      </div>

                      {/* Gantt bar */}
                      <div className="flex-1 px-4 py-3.5 relative" style={{ height: "64px" }}>
                        <div className="absolute inset-y-2 inset-x-0">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} className="flex-1 border-r border-gray-100 last:border-0" />
                            ))}
                          </div>
                          {/* Bar */}
                          <div
                            className={`absolute h-7 top-1/2 -translate-y-1/2 rounded-lg ${cfg.bg} opacity-85 shadow-sm transition-all duration-300 ${
                              task.is_critical && showCriticalPathOnly ? "ring-2 ring-rose-500 shadow-lg shadow-rose-500/20" : ""
                            }`}
                            style={barStyle}
                          >
                            {task.status === "in_progress" && (
                              <div
                                className="h-full bg-blue-600 rounded-l-lg"
                                style={{ width: `${task.progress_pct}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Workers */}
                      <div className="w-20 flex-shrink-0 px-6 text-right">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 justify-end">
                          <Users className="w-3.5 h-3.5 text-slate-300" /> {task.workers}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-[10px] font-bold text-gray-450 uppercase tracking-wider bg-slate-50/50 border border-gray-100 rounded-2xl p-4 shadow-inner">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span>{t("critical_path")}</span>
        </div>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-4 h-2.5 rounded-sm ${cfg.bg}`} />
            <span>{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
