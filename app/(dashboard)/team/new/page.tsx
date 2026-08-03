"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Phone, Wrench, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLES = ["technician", "supervisor", "apprentice", "owner"];
const SPECIALITIES = [
  "General Construction", "Electrical", "Plumbing", "HVAC", "Framing",
  "Roofing", "Flooring", "Drywall", "Painting", "Concrete", "Landscaping", "Other",
];

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    role: "technician", speciality: "", hourly_rate: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hourly_rate: parseFloat(form.hourly_rate) || 0, status: "active" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${form.name} added to the team!`);
      router.push("/team");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/team" className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Team Member</h1>
          <p className="text-sm text-gray-500">Add a crew member to assign jobs to</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
              <input
                type="text" placeholder="Mike Johnson"
                value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
              <input
                type="email" placeholder="mike@example.com"
                value={form.email} onChange={(e) => set("email", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
              <input
                type="tel" placeholder="416-555-0100"
                value={form.phone} onChange={(e) => set("phone", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-brand-500" /> Role & Skills
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Role</label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => set("role", r)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
                      form.role === r ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Speciality</label>
              <select
                value={form.speciality} onChange={(e) => set("speciality", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">— Select —</option>
                {SPECIALITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Hourly Rate (CAD)
              </label>
              <input
                type="number" min="0" step="0.5" placeholder="35.00"
                value={form.hourly_rate} onChange={(e) => set("hourly_rate", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/team" className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center transition-colors">
          Cancel
        </Link>
        <button
          onClick={save} disabled={saving}
          className="flex-1 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Add to Team"}
        </button>
      </div>
    </div>
  );
}
