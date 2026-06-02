"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Plus, Clock, CheckCircle2, AlertTriangle, XCircle, DollarSign, Loader2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { useTranslations, Language } from "@/lib/translations";

export default function PaymentsPage() {
  const { data: session, status: authStatus } = useSession();
  const [lang, setLang] = useState<Language>("EN");
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchInvoices();
    }
  }, [authStatus]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices").then((r) => r.json());
      setInvoices(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: lang === "EN" ? "Draft" : "Brouillon", color: "bg-slate-100 text-slate-600" },
    submitted: { label: lang === "EN" ? "Submitted" : "Soumise", color: "bg-blue-50 text-blue-700" },
    certified: { label: lang === "EN" ? "Certified" : "Certifiée", color: "bg-teal-50 text-teal-700" },
    paid: { label: lang === "EN" ? "Paid" : "Payée", color: "bg-emerald-50 text-emerald-700" },
    disputed: { label: lang === "EN" ? "Disputed" : "Contestée", color: "bg-amber-50 text-amber-700" },
    overdue: { label: lang === "EN" ? "Overdue" : "Vencida", color: "bg-rose-50 text-rose-700" },
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === "EN" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(n);

  const today = new Date();
  const processedList = invoices.map((inv) => {
    if (
      inv.due_date &&
      inv.status === "submitted" &&
      differenceInDays(today, parseISO(inv.due_date)) > 0
    ) {
      return { ...inv, status: "overdue" as const };
    }
    return inv;
  });

  const pending = processedList.filter((i) => i.status === "submitted" || i.status === "overdue");
  const totalPending = pending.reduce((s, i) => s + i.total, 0);
  const totalOverdue = processedList.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0);
  const totalPaid = processedList.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const properCount = processedList.filter((i) => i.is_proper).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">{lang === "EN" ? "Loading invoices..." : "Chargement des factures..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-orange-655 tracking-tight">{totalPending > 0 ? fmt(totalPending) : "—"}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("accounts_receivable")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-rose-600 tracking-tight">{totalOverdue > 0 ? fmt(totalOverdue) : "—"}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("overdue")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{totalPaid > 0 ? fmt(totalPaid) : "—"}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("received")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {processedList.length > 0 ? `${properCount}/${processedList.length}` : "—"}
          </p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("proper_invoices")}</p>
        </div>
      </div>

      {/* Overdue alert */}
      {processedList.some((i) => i.status === "overdue") && (
        <div className="bg-rose-50 border border-rose-150 rounded-xl p-5 flex items-start gap-4 shadow-sm shadow-rose-100/50">
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-900 text-sm">
              {t("overdue_invoices_alert")}
            </p>
            <p className="text-rose-700 text-sm mt-1">
              {t("odacc_action_alert")}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-bold text-gray-900 text-base">{t("payments_title")}</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {t("payments_desc")}
          </p>
        </div>
        <Link
          href="/payments/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          {t("create_invoice")}
        </Link>
      </div>

      {/* Empty state */}
      {processedList.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100/50">
            <DollarSign className="w-7 h-7 text-emerald-500 animate-pulse" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">{t("empty_invoices")}</h3>
          <p className="text-xs text-gray-400 font-medium mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">
            {lang === "EN" ? "Generate a proper invoice with automatic statutory prompt payment countdown validations." : "Générez une facture conforme avec une validation automatique du compte à rebours de paiement rapide."}
          </p>
          <Link
            href="/payments/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("create_invoice")}
          </Link>
        </div>
      )}

      {processedList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[580px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === "EN" ? "Invoice" : "Facture"}</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">{t("proper_invoice_status")}</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">{lang === "EN" ? "28d Clock" : "Horloge 28j"}</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t("total")}</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {processedList.map((inv) => {
                const status = statusConfig[inv.status] ?? statusConfig.draft;
                const daysLeft = inv.due_date
                  ? differenceInDays(parseISO(inv.due_date), today)
                  : null;

                return (
                  <tr key={inv.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{inv.invoice_number}</p>
                      <p className="text-xs font-semibold text-gray-450 mt-1">
                        {inv.project_name} · {inv.province}
                        {inv.submitted_at && ` · ${lang === "EN" ? "Submitted" : "Soumise"} ${new Date(inv.submitted_at).toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA")}`}
                      </p>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      {inv.is_proper ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("valid")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-rose-700 font-semibold bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full w-fit">
                          <XCircle className="w-3.5 h-3.5" /> {t("discrepancies")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell">
                      {inv.status === "paid" ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {t("paid")}
                        </span>
                      ) : daysLeft !== null ? (
                        daysLeft < 0 ? (
                          <span className="flex items-center gap-1 text-xs text-rose-700 font-extrabold bg-rose-50 px-2 py-0.5 rounded w-fit animate-pulse">
                            <XCircle className="w-3.5 h-3.5" /> {Math.abs(daysLeft)}d {t("overdue")}
                          </span>
                        ) : (
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded w-fit ${daysLeft <= 7 ? "bg-rose-50 text-rose-700" : daysLeft <= 14 ? "bg-amber-50 text-amber-700" : "bg-gray-50 text-gray-650"}`}>
                            {daysLeft}d {t("days_remaining")}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right font-extrabold text-gray-900">
                      {fmt(inv.total)}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Info panel */}
      <div className="bg-brand-50 border border-brand-100/50 rounded-2xl p-6 flex gap-4">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Clock className="w-5.5 h-5.5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold text-brand-900 text-sm">{t("proper_invoice_status")}</h3>
          <p className="text-brand-700 text-xs font-medium mt-1 leading-relaxed">
            {t("odacc_info")}
          </p>
        </div>
      </div>
    </div>
  );
}
