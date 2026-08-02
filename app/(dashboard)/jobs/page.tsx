"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, Plus, Calendar, DollarSign, User,
  Clock, CheckCircle2, XCircle, AlertTriangle, Trash2,
  ChevronRight, Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Job {
  id: string;
  client_name: string;
  title: string;
  description: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  address: string;
  scheduled_date: string | null;
  total_value: number;
  estimated_hours: number;
  created_at: string;
}

const STATUS_CONFIG = {
  scheduled:   { label: "Scheduled",    icon: Clock,         bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-100"  },
  in_progress: { label: "In Progress",  icon: AlertTriangle, bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-100" },
  completed:   { label: "Completed",    icon: CheckCircle2,  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100"},
  cancelled:   { label: "Cancelled",    icon: XCircle,       bg: "bg-gray-50",    text: "text-gray-500",    border: "border-gray-100"  },
};

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "bg-gray-100 text-gray-500" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | Job["status"]>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/jobs")
      .then((r) => r.json())
      .then((data) => { setJobs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast.error("Failed to load jobs"); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: Job["status"]) {
    const updates: Partial<Job> = { status };
    if (status === "completed") updates.completed_date = new Date().toISOString();
    const res = await fetch("/api/jobs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      setJobs((prev) => prev.map((j) => j.id === id ? { ...j, ...updates } : j));
      toast.success(`Job marked as ${status.replace("_", " ")}`);
    }
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this job?")) return;
    const res = await fetch("/api/jobs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Job deleted");
    }
  }

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.client_name.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    scheduled:   jobs.filter((j) => j.status === "scheduled").length,
    in_progress: jobs.filter((j) => j.status === "in_progress").length,
    completed:   jobs.filter((j) => j.status === "completed").length,
    cancelled:   jobs.filter((j) => j.status === "cancelled").length,
  };

  const activeValue = jobs
    .filter((j) => j.status !== "cancelled" && j.status !== "completed")
    .reduce((s, j) => s + (j.total_value ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">Work orders and job tracking</p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Job</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className="bg-white rounded-2xl border border-blue-100 p-4 shadow-sm cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => setStatusFilter("scheduled")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Scheduled</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : counts.scheduled}</p>
        </div>
        <div
          className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm cursor-pointer hover:border-amber-300 transition-colors"
          onClick={() => setStatusFilter("in_progress")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">In Progress</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : counts.in_progress}</p>
        </div>
        <div
          className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() => setStatusFilter("completed")}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{loading ? "—" : counts.completed}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Active Value</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {loading ? "—" : `$${activeValue.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`}
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn("px-3 py-2.5 font-medium transition-colors", statusFilter === "all" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50")}
          >
            All
          </button>
          {(Object.keys(STATUS_CONFIG) as Job["status"][]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-2.5 font-medium transition-colors",
                statusFilter === s ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No jobs found</p>
          <p className="text-gray-400 text-sm mt-1">Create your first work order to start tracking jobs</p>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 mt-4 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New Job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const cfg = STATUS_CONFIG[job.status];
            const pCfg = PRIORITY_CONFIG[job.priority] ?? PRIORITY_CONFIG.normal;
            const StatusIcon = cfg.icon;
            return (
              <div
                key={job.id}
                className={cn(
                  "bg-white rounded-2xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow group",
                  cfg.border
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Status icon */}
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                    <StatusIcon className={cn("w-5 h-5", cfg.text)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{job.title}</h3>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", pCfg.color)}>
                        {pCfg.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {job.client_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {job.client_name}
                        </span>
                      )}
                      {job.scheduled_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.scheduled_date).toLocaleDateString("en-CA")}
                        </span>
                      )}
                      {job.estimated_hours > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {job.estimated_hours}h est.
                        </span>
                      )}
                      {job.total_value > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <DollarSign className="w-3 h-3" />
                          ${job.total_value.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick status actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {job.status === "scheduled" && (
                      <button
                        onClick={() => updateStatus(job.id, "in_progress")}
                        className="hidden sm:flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-amber-100 transition-colors"
                      >
                        Start
                      </button>
                    )}
                    {job.status === "in_progress" && (
                      <button
                        onClick={() => updateStatus(job.id, "completed")}
                        className="hidden sm:flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1.5 rounded-lg font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => deleteJob(job.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile quick actions */}
                {(job.status === "scheduled" || job.status === "in_progress") && (
                  <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    {job.status === "scheduled" && (
                      <button
                        onClick={() => updateStatus(job.id, "in_progress")}
                        className="flex-1 py-2 text-xs bg-amber-50 text-amber-700 rounded-lg font-semibold"
                      >
                        Start Job
                      </button>
                    )}
                    {job.status === "in_progress" && (
                      <button
                        onClick={() => updateStatus(job.id, "completed")}
                        className="flex-1 py-2 text-xs bg-emerald-50 text-emerald-700 rounded-lg font-semibold"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
