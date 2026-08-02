"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, Edit2, Save,
  X, Briefcase, FileText, ClipboardList, ExternalLink, Plus,
  CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClientDetail {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  notes: string;
  status: string;
  created_at: string;
  quotes: Array<{ id: string; quote_number: string; status: string; total: number; project_name: string; created_at: string }>;
  jobs: Array<{ id: string; title: string; status: string; total_value: number; scheduled_date: string | null; priority: string }>;
}

const JOB_STATUS_COLORS: Record<string, string> = {
  scheduled:   "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  completed:   "bg-emerald-50 text-emerald-700",
  cancelled:   "bg-gray-100 text-gray-500",
};

const QUOTE_STATUS_COLORS: Record<string, string> = {
  draft:    "bg-gray-100 text-gray-600",
  sent:     "bg-blue-50 text-blue-700",
  viewed:   "bg-purple-50 text-purple-700",
  signed:   "bg-emerald-50 text-emerald-700",
  declined: "bg-red-50 text-red-600",
};

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "jobs" | "quotes">("overview");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ClientDetail>>({});

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then((data) => { setClient(data); setEditForm(data); setLoading(false); })
      .catch(() => { toast.error("Failed to load client"); setLoading(false); });
  }, [id]);

  async function saveEdit() {
    const res = await fetch("/api/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    setClient((prev) => prev ? { ...prev, ...data } : data);
    setEditing(false);
    toast.success("Client updated");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Client not found.</p>
        <Link href="/clients" className="text-brand-600 font-semibold mt-2 inline-block">← Back to Clients</Link>
      </div>
    );
  }

  const initials = (client.name || client.company || "?").slice(0, 2).toUpperCase();
  const totalJobValue = client.jobs.reduce((s, j) => s + (j.total_value ?? 0), 0);
  const totalQuoteValue = client.quotes.reduce((s, q) => s + (q.total ?? 0), 0);

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clients" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{client.name || client.company}</h1>
          {client.company && client.name && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {client.company}
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
            editing ? "bg-gray-100 text-gray-600" : "bg-brand-600 text-white hover:bg-brand-700"
          )}
        >
          {editing ? <><X className="w-4 h-4" /> Cancel</> : <><Edit2 className="w-4 h-4" /> Edit</>}
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-white rounded-2xl border border-brand-200 shadow-sm p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Edit Client</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["name", "company", "email", "phone", "address", "city"].map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">{field}</label>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={(editForm as any)[field] ?? ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={editForm.notes ?? ""}
              onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>
          <button
            onClick={saveEdit}
            className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{client.jobs.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Jobs</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-900">{client.quotes.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Quotes</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm text-center">
          <p className="text-lg font-bold text-gray-900">
            ${(totalJobValue + totalQuoteValue).toLocaleString("en-CA", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Total Value</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(["overview", "jobs", "quotes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors",
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {client.email && (
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`mailto:${client.email}`} className="text-sm text-brand-600 hover:underline">{client.email}</a>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a href={`tel:${client.phone}`} className="text-sm text-gray-700">{client.phone}</a>
            </div>
          )}
          {(client.address || client.city) && (
            <div className="flex items-center gap-3 px-5 py-3.5">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                {[client.address, client.city, client.province].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-3 px-5 py-3.5">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{client.notes}</p>
            </div>
          )}
          <div className="flex items-center gap-3 px-5 py-3.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Client since</span>
            <span className="text-sm text-gray-600">{new Date(client.created_at).toLocaleDateString("en-CA")}</span>
          </div>
        </div>
      )}

      {/* Jobs tab */}
      {tab === "jobs" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/jobs/new?client_id=${client.id}&client_name=${encodeURIComponent(client.name || client.company)}`}
              className="flex items-center gap-1.5 bg-brand-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Job
            </Link>
          </div>
          {client.jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">No jobs yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {client.jobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{job.title}</p>
                    {job.scheduled_date && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(job.scheduled_date).toLocaleDateString("en-CA")}
                      </p>
                    )}
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold capitalize", JOB_STATUS_COLORS[job.status] ?? "bg-gray-100 text-gray-500")}>
                    {job.status.replace("_", " ")}
                  </span>
                  {job.total_value > 0 && (
                    <span className="text-sm font-bold text-gray-800">
                      ${job.total_value.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quotes tab */}
      {tab === "quotes" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/quotes/new`}
              className="flex items-center gap-1.5 bg-brand-600 text-white px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Quote
            </Link>
          </div>
          {client.quotes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <ClipboardList className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-500 font-medium text-sm">No quotes yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {client.quotes.map((q) => (
                <div key={q.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{q.quote_number}</p>
                    <p className="text-xs text-gray-400 truncate">{q.project_name}</p>
                  </div>
                  <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold capitalize", QUOTE_STATUS_COLORS[q.status] ?? "bg-gray-100 text-gray-500")}>
                    {q.status}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    ${q.total.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
                  </span>
                  <Link href={`/quotes`} className="p-1 text-gray-400 hover:text-brand-600 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
