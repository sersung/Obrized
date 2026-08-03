"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Building2, Mail, Phone, MapPin, FileText, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PROVINCES = ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];

export default function NewClientPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "ON",
    notes: "",
    status: "active",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function save() {
    if (!form.name && !form.company) {
      toast.error("Enter at least a name or company");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Client created!");
      router.push(`/clients/${data.id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save client");
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/clients"
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Client</h1>
          <p className="text-sm text-gray-500">Add a client to your CRM</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Contact Info */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-500" /> Contact Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="John Smith"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Company
              </label>
              <input
                type="text"
                placeholder="Maple Construction Inc."
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <input
                type="email"
                placeholder="john@maple.ca"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </label>
              <input
                type="tel"
                placeholder="416-555-0100"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="p-5 sm:p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" /> Address
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Street Address</label>
              <input
                type="text"
                placeholder="123 Main St"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
                <input
                  type="text"
                  placeholder="Toronto"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Province</label>
                <select
                  value={form.province}
                  onChange={(e) => set("province", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Notes + Status */}
        <div className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-500" /> Notes & Status
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Internal Notes</label>
              <textarea
                rows={3}
                placeholder="Any internal notes about this client..."
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
              <div className="flex gap-2">
                {(["active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => set("status", s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors",
                      form.status === s
                        ? s === "active"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/clients"
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
          {saving ? "Saving..." : "Save Client"}
        </button>
      </div>
    </div>
  );
}
