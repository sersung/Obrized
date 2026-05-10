"use client";

import { useState } from "react";
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

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  completed: { label: "Concluído", color: "text-green-700", bg: "bg-green-500" },
  in_progress: { label: "Em Andamento", color: "text-blue-700", bg: "bg-blue-500" },
  not_started: { label: "Não Iniciado", color: "text-gray-600", bg: "bg-gray-300" },
  delayed: { label: "Atrasado", color: "text-red-700", bg: "bg-red-500" },
  blocked: { label: "Bloqueado", color: "text-red-700", bg: "bg-red-300" },
};

const PROJECT_START = new Date("2025-01-06");
const PROJECT_END = new Date("2025-10-03");
const TOTAL_DAYS = Math.ceil((PROJECT_END.getTime() - PROJECT_START.getTime()) / 86400000);

function getBarStyle(task: Task) {
  const start = new Date(task.planned_start);
  const end = new Date(task.planned_end);
  const left = Math.max(0, Math.ceil((start.getTime() - PROJECT_START.getTime()) / 86400000));
  const width = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  return {
    left: `${(left / TOTAL_DAYS) * 100}%`,
    width: `${(width / TOTAL_DAYS) * 100}%`,
  };
}

export default function SchedulingPage() {
  const [tasks, setTasks] = useState(PROJECT_TASKS);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [delayedTask, setDelayedTask] = useState<string | null>(null);
  const [delayDays, setDelayDays] = useState(14);
  const [showDelayDialog, setShowDelayDialog] = useState(false);

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

      if (!response.ok) throw new Error("Falha na otimização");
      const data = await response.json();

      setTasks((prev) =>
        prev.map((t) => {
          const updated = data.updatedTasks?.find((u: Task) => u.id === t.id);
          return updated ? { ...t, ...updated } : t;
        })
      );
      toast.success(`Cronograma recalculado pela IA. ${data.affectedCount ?? 0} tarefas ajustadas.`);
    } catch {
      toast.error("Erro ao otimizar cronograma. Verifique sua chave de API.");
    } finally {
      setIsOptimizing(false);
      setDelayedTask(null);
    }
  };

  const phases = [...new Set(tasks.map((t) => t.phase))];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-brand-600">{tasks.filter((t) => t.status === "completed").length}</p>
          <p className="text-sm text-gray-500">Tarefas Concluídas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-blue-600">{tasks.filter((t) => t.status === "in_progress").length}</p>
          <p className="text-sm text-gray-500">Em Andamento</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-amber-600">{tasks.filter((t) => t.is_critical).length}</p>
          <p className="text-sm text-gray-500">Tarefas Críticas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-2xl font-bold text-gray-900">169d</p>
          <p className="text-sm text-gray-500">Dias até Conclusão</p>
        </div>
      </div>

      {/* Project selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Condomínio Maple Ridge</h3>
          <p className="text-sm text-gray-500">Toronto, ON · Jan 2025 – Out 2025 · $1.2M</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Progresso Geral</p>
            <p className="font-bold text-gray-900">38%</p>
          </div>
          <div className="w-20 bg-gray-100 rounded-full h-2">
            <div className="bg-brand-600 h-2 rounded-full" style={{ width: "38%" }} />
          </div>
        </div>
      </div>

      {/* Delay dialog */}
      {showDelayDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Registrar Atraso</h3>
            <p className="text-gray-600 text-sm mb-4">
              Informe quantos dias de atraso ocorreram. A IA irá recalcular automaticamente todo o
              cronograma.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarefa afetada
              </label>
              <select
                value={delayedTask ?? ""}
                onChange={(e) => setDelayedTask(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {tasks
                  .filter((t) => t.status !== "completed")
                  .map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dias de atraso: <span className="text-brand-600 font-bold">{delayDays}</span>
              </label>
              <input
                type="range"
                min={1}
                max={60}
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>1 dia</span>
                <span>60 dias</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelayDialog(false)}
                className="flex-1 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex-1 bg-brand-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {isOptimizing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Recalcular com IA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gantt */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Cronograma Gantt</h3>
          <button
            onClick={() => {
              setDelayedTask(tasks.find((t) => t.status === "in_progress")?.id ?? null);
              setShowDelayDialog(true);
            }}
            className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Registrar Atraso
          </button>
        </div>

        {/* Month headers */}
        <div className="px-[200px] border-b border-gray-100 overflow-x-auto">
          <div className="flex" style={{ minWidth: "800px" }}>
            {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"].map((m) => (
              <div key={m} className="flex-1 text-center text-xs text-gray-400 py-2 border-r border-gray-50 last:border-0">
                {m}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {phases.map((phase) => (
            <div key={phase}>
              <div className="px-5 py-2 bg-gray-50 border-y border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {phase}
                </span>
              </div>
              {tasks
                .filter((t) => t.phase === phase)
                .map((task) => {
                  const barStyle = getBarStyle(task);
                  const cfg = statusConfig[task.status];
                  return (
                    <div
                      key={task.id}
                      className="flex items-center border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      style={{ minWidth: "1000px" }}
                    >
                      {/* Task name */}
                      <div className="w-[200px] flex-shrink-0 px-5 py-3">
                        <div className="flex items-center gap-2">
                          {task.is_critical && (
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          )}
                          <p className="text-sm text-gray-800 font-medium truncate">{task.name}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                          {task.status === "in_progress" && (
                            <span className="text-xs text-gray-400">{task.progress_pct}%</span>
                          )}
                        </div>
                      </div>

                      {/* Gantt bar */}
                      <div className="flex-1 px-2 py-3 relative" style={{ height: "52px" }}>
                        <div className="absolute inset-y-2 inset-x-0">
                          {/* Grid lines */}
                          <div className="absolute inset-0 flex">
                            {Array.from({ length: 10 }).map((_, i) => (
                              <div key={i} className="flex-1 border-r border-gray-100 last:border-0" />
                            ))}
                          </div>
                          {/* Bar */}
                          <div
                            className={`absolute h-6 top-1/2 -translate-y-1/2 rounded-md ${cfg.bg} opacity-80`}
                            style={barStyle}
                          >
                            {task.status === "in_progress" && (
                              <div
                                className="h-full bg-blue-600 rounded-l-md"
                                style={{ width: `${task.progress_pct}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Workers */}
                      <div className="w-16 flex-shrink-0 px-3 text-right">
                        <span className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                          <Users className="w-3 h-3" /> {task.workers}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Caminho Crítico
        </div>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-3 h-2 rounded-sm ${cfg.bg}`} />
            {cfg.label}
          </div>
        ))}
      </div>
    </div>
  );
}
