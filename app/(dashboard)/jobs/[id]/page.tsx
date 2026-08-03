"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, User, Calendar, MapPin, DollarSign,
  Plus, Trash2, CheckCircle2, AlertTriangle, Save, X,
  Flag, FileText, Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  client_name: string;
  address: string;
  scheduled_date: string | null;
  estimated_hours: number;
  actual_hours: number;
  total_value: number;
  assigned_to: string;
  notes: string;
}

interface TimeEntry {
  id: string;
  worker_name: string;
  work_date: string;
  hours: number;
  notes: string;
}

interface TeamMember {
  id: string;
  name: string;
  hourly_rate: number;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled:   "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed:   "bg-emerald-50 text-emerald-700",
  cancelled:   "bg-gray-100 text-gray-500",
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ worker_name: "", work_date: new Date().toISOString().split("T")[0], hours: "", notes: "" });
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs/${id}`).then((r) => r.json()),
      fetch(`/api/time-entries?job_id=${id}`).then((r) => r.json()),
      fetch("/api/team").then((r) => r.json()),
    ]).then(([jobData, entryData, teamData]) => {
      setJob(jobData);
      setEntries(Array.isArray(entryData) ? entryData : []);
      setTeam(Array.isArray(teamData) ? teamData : []);
      setLoading(false);
    }).catch(() => { toast.error("Failed to load job"); setLoading(false); });
  }, [id]);

  async function updateStatus(status: string) {
    const res = await fetch("/api/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, ...(status === "completed" ? { completed_date: new Date().toISOString() } : {}) }),
    });
    if (res.ok) {
      setJob((prev) => prev ? { ...prev, status } : prev);
      toast.success(`Job marked as ${status.replace("_", " ")}`);
    }
  }

  async function logTime() {
    if (!logForm.hours || parseFloat(logForm.hours) <= 0) { toast.error("Enter valid hours"); return; }
    setSavingLog(true);
    const res = await fetch("/api/time-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ job_id: id, ...logForm, hours: parseFloat(logForm.hours) }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); setSavingLog(false); return; }
    setEntries((prev) => [data, ...prev]);
    setJob((prev) => prev ? { ...prev, actual_hours: (prev.actual_hours ?? 0) + parseFloat(logForm.hours) } : prev);
    setLogForm({ worker_name: "", work_date: new Date().toISOString().split("T")[0], hours: "", notes: "" });
    setShowLogForm(false);
    setSavingLog(false);
    toast.success("Time logged");
  }

  async function deleteEntry(entryId: string, hours: number) {
    const res = await fetch("/api/time-entries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId, job_id: id }),
    });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      setJob((prev) => prev ? { ...prev, actual_hours: Math.max(0, (prev.actual_hours ?? 0) - hours) } : prev);
      toast.success("Entry removed");
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!job) return (
    <div className="p-6 text-center">
      <p className="text-gray-500">Job not found.</p>
      <Link href="/jobs" className="text-brand-600 font-semibold mt-2 inline-block">← Back to Jobs</Link>
    </div>
  );

  const hourlyRate = team.find((t) => t.name === job.assigned_to)?.hourly_rate ?? 0;
  const labourCost = (job.actual_hours ?? 0) * hourlyRate;
  const efficiency = job.estimated_hours > 0 && job.actual_hours > 0
    ? Math.round((job.estimated_hours / job.actual_hours) * 100)
    : null;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/jobs" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0 mt-0.5">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{job.title}</h1>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold capitalize", STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-500")}>
              {job.status.replace("_", " ")}
            </span>
          </div>
          {job.client_name && (
            <p className="text-sm text-gray-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> {job.client_name}</p>
          )}
        </div>
      </div>

      {/* Status action */}
      {job.status !== "completed" && job.status !== "cancelled" && (
        <div className="flex gap-2">
          {job.status === "scheduled" && (
            <button
              onClick={() => updateStatus("in_progress")}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" /> Start Job
            </button>
          )}
          {job.status === "in_progress" && (
            <button
              onClick={() => updateStatus("completed")}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark Complete
            </button>
          )}
          <button
            onClick={() => updateStatus("cancelled")}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel Job
          </button>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Value</p>
          <p className="text-lg font-bold text-gray-900">
            {job.total_value > 0 ? `$${job.total_value.toLocaleString("en-CA", { maximumFractionDigits: 0 })}` : "—"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Est. Hours</p>
          <p className="text-lg font-bold text-gray-900">{job.estimated_hours > 0 ? `${job.estimated_hours}h` : "—"}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Actual Hours</p>
          <p className="text-lg font-bold text-gray-900">{(job.actual_hours ?? 0) > 0 ? `${job.actual_hours}h` : "0h"}</p>
        </div>
        <div className={cn("bg-white rounded-2xl border p-4 shadow-sm", efficiency ? (efficiency >= 100 ? "border-emerald-100" : "border-amber-100") : "border-gray-100")}>
          <p className="text-xs text-gray-400 mb-1">Efficiency</p>
          <p className={cn("text-lg font-bold", efficiency ? (efficiency >= 100 ? "text-emerald-600" : "text-amber-600") : "text-gray-400")}>
            {efficiency ? `${efficiency}%` : "—"}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {job.description && (
          <div className="flex items-start gap-3 px-5 py-3.5">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">{job.description}</p>
          </div>
        )}
        {job.scheduled_date && (
          <div className="flex items-center gap-3 px-5 py-3.5">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{new Date(job.scheduled_date).toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        )}
        {job.address && (
          <div className="flex items-center gap-3 px-5 py-3.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">{job.address}</span>
          </div>
        )}
        {job.assigned_to && (
          <div className="flex items-center gap-3 px-5 py-3.5">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700">Assigned to: <strong>{job.assigned_to}</strong></span>
          </div>
        )}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Flag className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 capitalize">Priority: <strong>{job.priority}</strong></span>
        </div>
        {job.notes && (
          <div className="flex items-start gap-3 px-5 py-3.5">
            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-500 italic">{job.notes}</p>
          </div>
        )}
      </div>

      {/* Labour cost summary */}
      {hourlyRate > 0 && (job.actual_hours ?? 0) > 0 && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-brand-700 mb-1">Labour Cost Estimate</p>
          <p className="text-2xl font-bold text-brand-800">${labourCost.toLocaleString("en-CA", { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-brand-500 mt-0.5">{job.actual_hours}h × ${hourlyRate}/hr for {job.assigned_to}</p>
        </div>
      )}

      {/* Time Entries */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Timer className="w-4 h-4 text-brand-500" /> Time Log
            <span className="text-sm font-normal text-gray-400">({(job.actual_hours ?? 0).toFixed(1)}h total)</span>
          </h2>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Log Time
          </button>
        </div>

        {/* Log time form */}
        {showLogForm && (
          <div className="bg-white rounded-2xl border border-brand-200 p-4 mb-3 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Worker</label>
                {team.length > 0 ? (
                  <select
                    value={logForm.worker_name}
                    onChange={(e) => setLogForm((p) => ({ ...p, worker_name: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">— Select or type —</option>
                    {team.filter((t) => t.name).map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                ) : (
                  <input
                    type="text" placeholder="Worker name"
                    value={logForm.worker_name}
                    onChange={(e) => setLogForm((p) => ({ ...p, worker_name: e.target.value }))}
                    className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date</label>
                <input
                  type="date" value={logForm.work_date}
                  onChange={(e) => setLogForm((p) => ({ ...p, work_date: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hours</label>
                <input
                  type="number" min="0.5" step="0.5" placeholder="8"
                  value={logForm.hours}
                  onChange={(e) => setLogForm((p) => ({ ...p, hours: e.target.value }))}
                  className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
            <input
              type="text" placeholder="Notes (optional)"
              value={logForm.notes}
              onChange={(e) => setLogForm((p) => ({ ...p, notes: e.target.value }))}
              className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowLogForm(false)} className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={logTime} disabled={savingLog} className="flex-1 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60">
                {savingLog ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No time logged yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3.5 group">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{entry.hours}h</p>
                    {entry.worker_name && <span className="text-xs text-gray-500">by {entry.worker_name}</span>}
                    <span className="text-xs text-gray-400">{new Date(entry.work_date).toLocaleDateString("en-CA")}</span>
                  </div>
                  {entry.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.notes}</p>}
                </div>
                <button
                  onClick={() => deleteEntry(entry.id, entry.hours)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
