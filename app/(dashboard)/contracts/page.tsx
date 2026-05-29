"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useTranslations, Language } from "@/lib/translations";

export default function ContractsPage() {
  const { data: session, status: authStatus } = useSession();
  const [lang, setLang] = useState<Language>("EN");
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchContracts();
    }
  }, [authStatus]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/contracts").then((r) => r.json());
      setContracts(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === "EN" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(n);

  const riskStats = {
    critical: contracts.filter((c) => c.overall_risk === "critical").length,
    high: contracts.filter((c) => c.overall_risk === "high").length,
    medium: contracts.filter((c) => c.overall_risk === "medium").length,
    low: contracts.filter((c) => c.overall_risk === "low").length,
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-rose-100 text-rose-700 border-rose-250";
      case "high":
        return "bg-rose-50 text-rose-600 border-rose-200/50";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "low":
        default:
        return "bg-emerald-50 text-emerald-700 border-emerald-250/20";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">{lang === "EN" ? "Loading contracts..." : "Chargement des contrats..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: lang === "EN" ? "Contracts Reviewed" : "Contrats Analysés", value: contracts.length.toString(), color: "text-gray-900" },
          { label: lang === "EN" ? "Critical Risk" : "Risque Critique", value: riskStats.critical.toString(), color: "text-rose-600 animate-pulse" },
          { label: lang === "EN" ? "High Risk" : "Risque Élevé", value: riskStats.high.toString(), color: "text-rose-500" },
          { label: lang === "EN" ? "Low Risk" : "Risque Faible", value: riskStats.low.toString(), color: "text-emerald-600" },
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
          <h2 className="font-bold text-gray-900 text-base">{t("contracts")}</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">
            {lang === "EN" ? "CCDC contracts risk assessment and protective drafting recommendations" : "Évaluation des risques des contrats CCDC et recommandations de rédaction de protection"}
          </p>
        </div>
        <Link
          href="/contracts/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          {t("new_contract")}
        </Link>
      </div>

      {/* Empty state */}
      {contracts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-100/50">
            <FileText className="w-7 h-7 text-brand-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-base">{lang === "EN" ? "No contracts yet" : "Aucun contrat pour le moment"}</h3>
          <p className="text-xs text-gray-400 font-medium mt-1.5 mb-5 max-w-sm mx-auto leading-relaxed">
            {lang === "EN" ? "Upload a standard CCDC contract PDF and the AI will analyze risks in seconds." : "Téléchargez un contrat CCDC au format PDF et l'IA en analysera les risques en quelques secondes."}
          </p>
          <Link
            href="/contracts/new"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("new_contract")}
          </Link>
        </div>
      )}

      {/* Table */}
      {contracts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t("contract_name")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  {t("counterparty")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  {t("value")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t("risk_level")}
                </th>
                <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {t("risk_clauses")}
                </th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contracts.map((c) => {
                const riskColor = getRiskColor(c.overall_risk);
                return (
                  <tr key={c.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{c.name}</p>
                      <p className="text-xs font-semibold text-gray-400 mt-1">
                        {c.contract_type} · {new Date(c.created_at).toLocaleDateString(lang === "EN" ? "en-CA" : "fr-CA")}
                      </p>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell">
                      <span className="text-gray-600 font-semibold">{c.counterparty || "—"}</span>
                    </td>
                    <td className="px-6 py-5 hidden lg:table-cell font-bold text-gray-900">
                      {c.value > 0 ? fmt(c.value) : "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider border ${riskColor}`}>
                        {c.overall_risk}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-gray-600 font-bold">{c.clauses_count} {lang === "EN" ? "flagged" : "signalées"}</span>
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

      {/* Info box */}
      <div className="bg-brand-50 border border-brand-100/50 rounded-2xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5.5 h-5.5 text-brand-600" />
        </div>
        <div>
          <h3 className="font-bold text-brand-900 text-sm">{t("review_risk")}</h3>
          <p className="text-brand-700 text-xs font-medium mt-1 leading-relaxed">
            {lang === "EN"
              ? "Upload CCDC standard contracts. The AI reviews variations in indemnity, changes in work, schedule extensions, and prompt payment clauses to align with CCDC-2, CCDC-5A, CCDC-17, and CCA-1 guidelines."
              : "Téléchargez des contrats CCDC. L'IA examine les variations d'indemnisation, les changements de travaux, les extensions de calendrier et les clauses de paiement rapide pour s'aligner sur les directives CCDC-2, CCDC-5A, CCDC-17 et CCA-1."}
          </p>
        </div>
      </div>
    </div>
  );
}
