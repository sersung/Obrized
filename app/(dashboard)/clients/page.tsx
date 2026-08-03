"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Plus, Search, Phone, Mail, MapPin,
  ChevronRight, Trash2, TrendingUp, Star, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  province: string;
  status: "active" | "inactive";
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => { setClients(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { toast.error("Failed to load clients"); setLoading(false); });
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  async function deleteClient(id: string) {
    if (!confirm("Delete this client? All linked jobs will remain.")) return;
    const res = await fetch("/api/clients", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Client deleted");
    } else {
      toast.error("Failed to delete client");
    }
  }

  const now = Date.now();
  const thisMonth = clients.filter(
    (c) => new Date(c.created_at).getTime() > now - 30 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your client relationships</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Client</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Total</span>
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{loading ? "—" : clients.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500">Active</span>
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {loading ? "—" : clients.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-500">New (30d)</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{loading ? "—" : thisMonth}</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden self-stretch sm:self-auto">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 sm:flex-none px-3 sm:px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Client List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-semibold">No clients yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first client to start tracking relationships</p>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 mt-4 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Add Client
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="flex items-center gap-3 sm:gap-4 p-4 hover:bg-gray-50/60 transition-colors group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-brand-600/10 text-brand-700 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(client.name || client.company || "?").slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                      {client.name || "—"}
                    </p>
                    {client.company && (
                      <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {client.company}
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        client.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {client.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {client.company && (
                      <span className="sm:hidden flex items-center gap-1 text-xs text-gray-400">
                        <Building2 className="w-3 h-3" /> {client.company}
                      </span>
                    )}
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
                      >
                        <Mail className="w-3 h-3" /> {client.email}
                      </a>
                    )}
                    {client.phone && (
                      <a
                        href={`tel:${client.phone}`}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-600"
                      >
                        <Phone className="w-3 h-3" /> {client.phone}
                      </a>
                    )}
                    {client.city && (
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" /> {client.city}, {client.province}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/clients/${client.id}`}
                    className="p-2 rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteClient(client.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
