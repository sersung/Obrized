"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  XCircle,
  Loader2,
  Copy,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  client_name: string;
  client_email: string;
  project_name: string;
  total: number;
  advance_percent: number;
  valid_until: string;
  signed_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  draft:    { label: "Draft",    color: "bg-slate-100 text-slate-600",   icon: <FileText className="w-3 h-3" /> },
  sent:     { label: "Sent",     color: "bg-blue-50 text-blue-700",      icon: <Send className="w-3 h-3" /> },
  viewed:   { label: "Viewed",   color: "bg-purple-50 text-purple-700",  icon: <Eye className="w-3 h-3" /> },
  signed:   { label: "Signed",   color: "bg-emerald-50 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  declined: { label: "Declined", color: "bg-rose-50 text-rose-700",      icon: <XCircle className="w-3 h-3" /> },
  expired:  { label: "Expired",  color: "bg-amber-50 text-amber-700",    icon: <Clock className="w-3 h-3" /> },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);

export default function QuotesPage() {
  const { data: session, status: authStatus } = useSession();
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "authenticated") fetchQuotes();
  }, [authStatus]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotes").then((r) => r.json());
      setQuotes(Array.isArray(res) ? res : []);
    } catch {
      toast.error("Failed to load quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch("/api/quotes", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } });
      setQuotes((q) => q.filter((x) => x.id !== id));
      toast.success("Quote deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}/q/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Client link copied to clipboard");
  };

  const totals = {
    all: quotes.length,
    sent: quotes.filter((q) => ["sent", "viewed"].includes(q.status)).length,
    signed: quotes.filter((q) => q.status === "signed").length,
    value: quotes.reduce((s, q) => s + (q.total ?? 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create, send, and track client quotes</p>
        </div>
        <Link
          href="/quotes/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Quote
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Quotes", value: totals.all, color: "text-gray-900" },
          { label: "Awaiting Response", value: totals.sent, color: "text-blue-700" },
          { label: "Signed", value: totals.signed, color: "text-emerald-700" },
          { label: "Total Value", value: fmt(totals.value), color: "text-brand-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{s.label}</p>
            <p className={`text-xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : quotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-brand-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No quotes yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">Create your first quote to send to a client. It includes all Ontario legal terms automatically.</p>
            <Link
              href="/quotes/new"
              className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Create First Quote
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["Quote #", "Client", "Project", "Total", "Status", "Valid Until", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.map((q) => {
                  const cfg = statusConfig[q.status] ?? statusConfig.draft;
                  const isExpired = q.valid_until && new Date(q.valid_until) < new Date() && q.status !== "signed";
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 pl-6">
                        <Link href={`/quotes/${q.id}`} className="font-mono font-bold text-brand-600 hover:underline text-xs">
                          {q.quote_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{q.client_name}</p>
                        <p className="text-xs text-gray-400">{q.client_email}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-700 truncate max-w-[160px]">{q.project_name}</p>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-gray-900">{fmt(q.total)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isExpired ? "bg-amber-50 text-amber-700" : cfg.color}`}>
                          {isExpired ? <Clock className="w-3 h-3" /> : cfg.icon}
                          {isExpired ? "Expired" : cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs">
                        {q.valid_until ? format(parseISO(q.valid_until), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-4 py-3.5 pr-6">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyLink(q.id)}
                            title="Copy client link"
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={`/q/${q.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open client view"
                            className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(q.id)}
                            disabled={deleting === q.id}
                            title="Delete quote"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleting === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
