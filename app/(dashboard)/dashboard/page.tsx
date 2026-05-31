"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import {
  DollarSign,
  Clock,
  FileText,
  ArrowRight,
  Calendar,
  ShieldCheck,
  Calculator,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { useTranslations, Language } from "@/lib/translations";

export default function DashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const [lang, setLang] = useState<Language>("EN");
  const [loading, setLoading] = useState(true);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [safetyReports, setSafetyReports] = useState<any[]>([]);
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
      fetchData();
    }
  }, [authStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [estRes, ctRes, sfRes, invRes] = await Promise.all([
        fetch("/api/estimates").then((r) => r.json()),
        fetch("/api/contracts").then((r) => r.json()),
        fetch("/api/safety").then((r) => r.json()),
        fetch("/api/invoices").then((r) => r.json()),
      ]);

      setEstimates(Array.isArray(estRes) ? estRes : []);
      setContracts(Array.isArray(ctRes) ? ctRes : []);
      setSafetyReports(Array.isArray(sfRes) ? sfRes : []);
      setInvoices(Array.isArray(invRes) ? invRes : []);
    } catch (e) {
      console.error("Error loading dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === "EN" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(n);

  const today = new Date();
  const processedInvoices = invoices.map((inv: any) => {
    if (inv.due_date && inv.status === "submitted" && differenceInDays(today, parseISO(inv.due_date)) > 0) {
      return { ...inv, status: "overdue" };
    }
    return inv;
  });

  const pendingInvoices = processedInvoices.filter((i: any) => i.status === "submitted" || i.status === "overdue");
  const pendingAmount = pendingInvoices.reduce((s: number, i: any) => s + i.total, 0);
  const urgentInvoices = processedInvoices.filter((i: any) => {
    if (i.status !== "submitted" || !i.due_date) return false;
    const days = differenceInDays(parseISO(i.due_date), today);
    return days <= 7 && days >= 0;
  });
  const urgentAmount = urgentInvoices.reduce((s: number, i: any) => s + i.total, 0);

  const recentEstimates = estimates.slice(0, 2);
  const recentContracts = contracts.slice(0, 2);
  const recentSafety = safetyReports.slice(0, 2);
  const recentInvoices = processedInvoices.slice(0, 2);

  const isEmpty = estimates.length === 0 && contracts.length === 0 && safetyReports.length === 0 && invoices.length === 0;

  const quickActions = [
    {
      href: "/estimating/new",
      icon: <Calculator className="w-5 h-5" />,
      label: t("new_estimate"),
      description: t("new_estimate_desc"),
      color: "bg-blue-50 text-blue-600 border-blue-150/40 hover:bg-blue-100/30",
    },
    {
      href: "/contracts/new",
      icon: <FileText className="w-5 h-5" />,
      label: t("new_contract"),
      description: t("ccdc_review_desc"),
      color: "bg-purple-50 text-purple-600 border-purple-150/40 hover:bg-purple-100/30",
    },
    {
      href: "/safety/new",
      icon: <ShieldCheck className="w-5 h-5" />,
      label: t("new_safety_report"),
      description: t("new_report_desc"),
      color: "bg-orange-50 text-orange-600 border-orange-150/40 hover:bg-orange-100/30",
    },
    {
      href: "/payments/new",
      icon: <DollarSign className="w-5 h-5" />,
      label: t("new_invoice"),
      description: t("payments_desc"),
      color: "bg-green-50 text-green-600 border-green-150/40 hover:bg-green-100/30",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">{lang === "EN" ? "Loading workspace..." : "Chargement de l'espace de travail..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      {isEmpty && (
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 text-white shadow-xl shadow-brand-600/10">
          <h2 className="text-2xl font-bold mb-2 tracking-tight">
            {t("welcome_title")}, {session?.user?.name?.split(" ")[0] || "John"}! 👷
          </h2>
          <p className="text-brand-100 text-sm mb-6 max-w-xl leading-relaxed">
            {t("welcome_subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/estimating/new"
              className="bg-white text-brand-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-50 hover:scale-102 transition-all duration-200"
            >
              {t("create_first_estimate")}
            </Link>
            <Link
              href="/contracts/new"
              className="bg-brand-500/50 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-500/80 hover:scale-102 transition-all duration-200"
            >
              {t("analyze_a_contract")}
            </Link>
          </div>
        </div>
      )}

      {/* Overdue alert */}
      {processedInvoices.some((i) => i.status === "overdue") && (
        <div className="bg-rose-50 border border-rose-150 rounded-xl p-5 flex items-start gap-4 shadow-sm shadow-rose-100/50">
          <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-rose-900 text-sm">
              {t("overdue_invoices_alert")}
            </p>
            <p className="text-rose-700 text-sm mt-1">
              {t("odacc_action_alert")}
            </p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200/60 transition-all duration-250">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.75 rounded-full bg-slate-50 text-slate-500">
              {t("total")}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{estimates.length}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("estimates")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200/60 transition-all duration-250">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50">
              <DollarSign className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.75 rounded-full bg-slate-50 text-slate-500">
              {t("pending")}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {pendingAmount > 0 ? fmt(pendingAmount) : "—"}
          </p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("accounts_receivable")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200/60 transition-all duration-250">
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.75 rounded-full bg-slate-50 text-slate-500">
              {t("total")}
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{invoices.length}</p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("invoices")}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-gray-200/60 transition-all duration-250">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${urgentInvoices.length > 0 ? "text-rose-600 bg-rose-50 animate-pulse" : "text-gray-400 bg-gray-50"}`}>
              <Clock className="w-5.5 h-5.5" />
            </div>
            {urgentInvoices.length > 0 && (
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.75 rounded-full bg-rose-50 text-rose-700">
                {t("urgent")}
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {urgentAmount > 0 ? fmt(urgentAmount) : "—"}
          </p>
          <p className="text-xs font-semibold text-gray-400 mt-1">{t("due_in_7_days")}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-base">{t("recent_activity")}</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {isEmpty ? (
                <div className="p-10 text-center text-gray-400 text-sm font-medium">
                  {t("no_activity")}
                </div>
              ) : (
                <>
                  {recentEstimates.map((e: any) => (
                    <div key={`est-${e.id}`} className="p-5 hover:bg-gray-50/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calculator className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{e.project_name}</p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {t("estimating")} · {fmt(e.total_value)} ·{" "}
                            {new Date(e.created_at).toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA")}
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-slate-50 text-slate-500 text-[10px]">
                          {e.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentContracts.map((c: any) => (
                    <div key={`ct-${c.id}`} className="p-5 hover:bg-gray-50/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {t("contracts")} · {c.clauses_count} {lang === "EN" ? "clauses" : "clauses"} ·{" "}
                            {new Date(c.created_at).toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA")}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${
                            c.overall_risk === "critical"
                              ? "bg-rose-100 text-rose-700"
                              : c.overall_risk === "high"
                              ? "bg-rose-50 text-rose-600"
                              : c.overall_risk === "medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {c.overall_risk}
                        </span>
                      </div>
                    </div>
                  ))}
                  {recentSafety.map((r: any) => (
                    <div key={`sf-${r.id}`} className="p-5 hover:bg-gray-50/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{r.project_name}</p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {t("safety")} · {r.report_type} ·{" "}
                            {new Date(r.created_at).toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentInvoices.map((i: any) => (
                    <div key={`inv-${i.id}`} className="p-5 hover:bg-gray-50/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{i.invoice_number}</p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">
                            {i.project_name} · {fmt(i.total)} ·{" "}
                            {new Date(i.created_at).toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA")}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${
                            i.status === "overdue"
                              ? "bg-rose-50 text-rose-700"
                              : i.status === "paid"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {i.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="p-6 border-b border-gray-50">
              <h2 className="font-bold text-gray-900 text-base">{t("summary")}</h2>
            </div>
            <div className="p-6 space-y-5">
              {[
                {
                  label: t("estimates"),
                  value: estimates.length,
                  sub: `${estimates.filter((e: any) => e.status === "won").length} ${t("won")}`,
                  href: "/estimating",
                  color: "text-blue-600",
                },
                {
                  label: t("contracts"),
                  value: contracts.length,
                  sub: `${contracts.filter((c: any) => c.overall_risk === "critical" || c.overall_risk === "high").length} ${t("high_risk")}`,
                  href: "/contracts",
                  color: "text-purple-600",
                },
                {
                  label: t("safety_reports"),
                  value: safetyReports.length,
                  sub: `${safetyReports.filter((r: any) => r.report_type === "incident").length} ${t("incidents")}`,
                  href: "/safety",
                  color: "text-orange-600",
                },
                {
                  label: t("invoices"),
                  value: invoices.length,
                  sub: `${invoices.filter((i: any) => i.status === "overdue").length} ${t("overdue")}`,
                  href: "/payments",
                  color: "text-emerald-600",
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:opacity-80 transition-all duration-200 group"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{item.label}</p>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{item.sub}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-extrabold ${item.color}`}>{item.value}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:translate-x-0.75 transition-all duration-200" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div>
        <h2 className="font-bold text-gray-900 text-base mb-4">{t("quick_actions")}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-250/70 hover:shadow-md hover:shadow-gray-200/10 hover:translate-y-[-2px] transition-all duration-250 group"
            >
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-all duration-200 ${action.color}`}>
                {action.icon}
              </div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-brand-600 transition-colors">{action.label}</p>
              <p className="text-xs text-gray-400 mt-1 font-semibold leading-relaxed line-clamp-2">{action.description}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs text-gray-300 font-bold tracking-wide group-hover:text-brand-600 transition-colors uppercase">
                <span>{lang === "EN" ? "Open" : "Ouvrir"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.75 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
