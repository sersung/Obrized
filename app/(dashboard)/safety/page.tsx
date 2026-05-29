"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Activity,
  FileSpreadsheet,
} from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

export default function SafetyPage() {
  const { data: session, status: authStatus } = useSession();
  const [lang, setLang] = useState<Language>("EN");
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchReports();
    }
  }, [authStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/safety").then((r) => r.json());
      setReports(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const incidents = reports.filter((r) => r.report?.incidents && r.report.incidents !== "None" && r.report.incidents !== "Nenhum" && r.report.incidents !== "Nenhum incidente registrado.");
  const totalWorkers = reports.reduce((s, r) => s + (r.report?.workers_on_site || 0), 0);
  const avgTemp = reports.length > 0 ? Math.round(reports.reduce((s, r) => s + (r.report?.temperature_c || 0), 0) / reports.length) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">{lang === "EN" ? "Loading daily logs..." : "Chargement des journaux de chantier..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("daily_logs"), value: reports.length.toString(), color: "text-gray-900" },
          { label: lang === "EN" ? "Incidents Reported" : "Incidents Signalés", value: incidents.length.toString(), color: incidents.length > 0 ? "text-rose-600 animate-pulse" : "text-gray-500" },
          { label: lang === "EN" ? "Total Workers Active" : "Total Travailleurs Actifs", value: totalWorkers.toString(), color: "text-brand-600" },
          { label: lang === "EN" ? "Average Weather Temp" : "Température Moyenne", value: `${avgTemp}°C`, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p className={`text-2xl font-extrabold ${stat.color} tracking-tight`}>{stat.value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-base">{t("safety_title")}</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {t("safety_desc")}
          </p>
        </div>
        <Link
          href="/safety/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          {t("new_report")}
        </Link>
      </div>

      {/* Empty state */}
      {reports.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100/50">
            <ShieldCheck className="w-7 h-7 text-brand-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">{lang === "EN" ? "No daily reports yet" : "Aucun rapport quotidien pour le moment"}</h3>
          <p className="text-xs text-gray-400 font-medium mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">
            {lang === "EN" ? "Dictate a daily report by voice or type quick notes, and the AI will generate formal OHS documentation." : "Dictez un rapport quotidien à la voix ou saisissez des notes rapides, et l'IA générera une documentation SST formelle."}
          </p>
          <Link
            href="/safety/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("new_report")}
          </Link>
        </div>
      )}

      {/* Table */}
      {reports.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {lang === "EN" ? "Report Date" : "Date du Rapport"}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t("project_label")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  {lang === "EN" ? "Weather & Temp" : "Météo & Temp"}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  {t("workers_site")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t("compliance_flags")}
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((r) => {
                const reportDate = r.report?.date || r.report_date;
                const workersOnSite = r.report?.workers_on_site || 0;
                const weatherStr = `${r.report?.weather || "Sunny"} · ${r.report?.temperature_c || 15}°C`;
                const flags = Array.isArray(r.report?.compliance_flags) ? r.report.compliance_flags.length : 0;
                
                return (
                  <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">
                      {new Date(reportDate + "T12:00:00").toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-5 font-semibold text-gray-700">
                      {r.project_name}
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell text-gray-650 font-medium">
                      {weatherStr}
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell text-gray-600 font-semibold">
                      {workersOnSite}
                    </td>
                    <td className="px-6 py-5">
                      {flags === 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t("safety_compliance")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {flags} {lang === "EN" ? "Violations" : "Violations"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-gray-300 flex items-center gap-1 justify-end">
                        <ArrowRight className="w-4 h-4 hover:translate-x-0.5 transition-transform text-gray-400" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* COR audits card */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex gap-4">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">{t("cor_compliance")}</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              {lang === "EN"
                ? "Prepare for provincial OHS audits (IHSA Ontario, WorkSafeBC) using automated COR records generated directly from your daily work logs."
                : "Préparez vos audits SST provinciaux (CNESST, WorkSafeBC) à l'aide de rapports COR automatisés générés directement à partir de vos journaux."}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex gap-4">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight">{t("whmis_compliance")}</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              {lang === "EN"
                ? "The system automatically tags WHMIS hazardous materials (Workplace Hazardous Materials Information System) detected in daily logs, keeping SDS sheets linked."
                : "Le système identifie automatiquement les produits dangereux du SIMDUT signalés sur le chantier pour assurer la mise à jour des fiches signalétiques."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
