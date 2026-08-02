"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Briefcase, User, Calendar,
  MapPin, Clock, DollarSign, Flag, FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ClientOption {
  id: string;
  name: string;
  company: string;
}

function NewJobForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [form, setForm] = useState({
    client_id: params.get("client_id") ?? "",
    client_name: params.get("client_name") ?? "",
    title: "",
    description: "",
    status: "scheduled",
    priority: "normal",
    address: "",
    scheduled_date: "",
    estimated_hours: "",
    total_value: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []));
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function selectClient(id: string) {
    const c = clients.find((cl) => cl.id === id);
    setForm((prev) => ({
      ...prev,
      client_id: id,
      client_name: c ? (c.name || c.company) : "",
    }));
  }

  async function save() {
    if (!form.title.trim()) { toast.error("Job title is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimated_hours: parseFloat(form.estimated_hours) || 0,
          total_value: parseFloat(form.total_value) || 0,
          scheduled_date: form.scheduled_date || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Job created!");
      router.push("/jobs");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save job");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/jobs" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Job</h1>
          <p className="text-sm text-gray-500">Create a work order</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Job Details */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-500" /> Job Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Job Title *</label>
              <input
                type="text"
                placeholder="Kitchen renovation, Electrical rough-in, Roof replacement..."
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Scope of work, materials, special instructions..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> Client
          </h2>
          {clients.length > 0 ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Select from CRM</label>
                <select
                  value={form.client_id}
                  onChange={(e) => selectClient(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">— Pick a client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name || c.company}
                      {c.name && c.company ? ` — ${c.company}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400">Or type a name below if client not in CRM</p>
            </div>
          ) : null}
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Client Name</label>
            <input
              type="text"
              placeholder="Client name"
              value={form.client_name}
              onChange={(e) => set("client_name", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-500" /> Schedule & Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Scheduled Date
              </label>
              <input
                type="date"
                value={form.scheduled_date}
                onChange={(e) => set("scheduled_date", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Estimated Hours
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="8"
                value={form.estimated_hours}
                onChange={(e) => set("estimated_hours", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Job Address
            </label>
            <input
              type="text"
              placeholder="123 Main St, Toronto ON"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Priority, Value, Notes */}
        <div className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Flag className="w-4 h-4 text-brand-500" /> Priority & Value
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Priority</label>
              <div className="flex gap-2 flex-wrap">
                {(["low", "normal", "high", "urgent"] as const).map((p) => {
                  const colors = {
                    low: "bg-gray-100 text-gray-600",
                    normal: "bg-blue-50 text-blue-700",
                    high: "bg-orange-50 text-orange-700",
                    urgent: "bg-red-50 text-red-700",
                  };
                  const selected = {
                    low: "bg-gray-600 text-white",
                    normal: "bg-blue-600 text-white",
                    high: "bg-orange-600 text-white",
                    urgent: "bg-red-600 text-white",
                  };
                  return (
                    <button
                      key={p}
                      onClick={() => set("priority", p)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
                        form.priority === p ? selected[p] : colors[p]
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Total Value (CAD)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                placeholder="0.00"
                value={form.total_value}
                onChange={(e) => set("total_value", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Internal Notes
              </label>
              <textarea
                rows={2}
                placeholder="Notes for your team..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/jobs"
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center transition-colors"
        >
          Cancel
        </Link>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Create Job"}
        </button>
      </div>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense>
      <NewJobForm />
    </Suspense>
  );
}
