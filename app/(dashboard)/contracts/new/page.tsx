"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, Language } from "@/lib/translations";

type RiskLevel = "low" | "medium" | "high" | "critical";

type Clause = {
  clause_number: string;
  clause_title: string;
  original_text: string;
  risk_level: RiskLevel;
  risk_reason: string;
  suggested_text?: string;
  category: string;
};

type AnalysisResult = {
  overall_risk: RiskLevel;
  summary: string;
  clauses: Clause[];
};

export default function NewContractPage() {
  const [lang, setLang] = useState<Language>("EN");
  const [file, setFile] = useState<File | null>(null);
  const [contractType, setContractType] = useState("CCDC-2");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  const riskConfig = {
    low: { label: lang === "EN" ? "Low" : "Faible", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-4 h-4" /> },
    medium: { label: lang === "EN" ? "Medium" : "Moyen", color: "text-amber-700 bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-4 h-4" /> },
    high: { label: lang === "EN" ? "High" : "Élevé", color: "text-rose-700 bg-rose-50 border-rose-200", icon: <AlertTriangle className="w-4 h-4" /> },
    critical: { label: lang === "EN" ? "Critical" : "Critique", color: "text-rose-800 bg-rose-100 border-rose-300", icon: <XCircle className="w-4 h-4" /> },
  };

  const categoryLabels: Record<string, string> = {
    payment: lang === "EN" ? "Payment Terms" : "Conditions de Paiement",
    liability: lang === "EN" ? "Liability" : "Responsabilité",
    indemnity: lang === "EN" ? "Indemnity" : "Indemnisation",
    dispute: lang === "EN" ? "Disputes" : "Différends",
    delay: lang === "EN" ? "Delays" : "Délais",
    termination: lang === "EN" ? "Termination" : "Résiliation",
    warranty: lang === "EN" ? "Warranties" : "Garanties",
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) {
      toast.error(lang === "EN" ? "Please upload the contract PDF." : "Veuillez charger le PDF du contrat.");
      return;
    }
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("contractType", contractType);

    try {
      const response = await fetch("/api/contracts/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setResult(data);
      toast.success(lang === "EN" ? `Analysis completed: ${data.clauses.length} clauses reviewed.` : `Analyse complétée : ${data.clauses.length} clauses révisées.`);
      
      // Save to Mock DB / Supabase
      await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${contractType} — ${file.name.replace(".pdf", "")}`,
          contract_type: contractType,
          counterparty: "General Contractor Corp",
          value: 250000,
          overall_risk: data.overall_risk,
          clauses_count: data.clauses.length,
          analysis: data,
        }),
      });
    } catch {
      toast.error(lang === "EN" ? "Error during analysis. Check your Gemini API Key." : "Erreur d'analyse. Vérifiez votre clé API Gemini.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSuggestion = (id: string) => {
    setShowSuggestion((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const overallRiskCfg = result ? riskConfig[result.overall_risk] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("ccdc_review_title")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {t("ccdc_review_desc")}
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {lang === "EN" ? "Contract Template" : "Modèle de Contrat"}
            </label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="CCDC-2">CCDC-2 — Lump Sum Contract</option>
              <option value="CCDC-5A">CCDC-5A — Construction Management Contract (Fee)</option>
              <option value="CCDC-5B">CCDC-5B — Construction Management Contract (Risk)</option>
              <option value="CCDC-17">CCDC-17 — Unit Price Contract</option>
              <option value="CCA-1">CCA-1 — Subcontract Agreement</option>
              <option value="Custom">Custom Contract</option>
            </select>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-purple-400 bg-purple-50/50"
              : file
              ? "border-emerald-300 bg-emerald-50/20"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/40"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="w-11 h-11 text-emerald-500" />
              <p className="font-bold text-gray-900 text-sm">{file.name}</p>
              <p className="text-xs text-gray-400 font-semibold">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-11 h-11 text-gray-300" />
              <p className="font-bold text-gray-700 text-sm">
                {isDragActive ? t("dropzone_active") : t("dropzone_inactive")}
              </p>
              <p className="text-xs text-gray-400 font-semibold">{t("pdf_max_size")} · CCDC or CCA standards</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 hover:shadow-md hover:shadow-purple-600/10 transition-all duration-200"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-200 animate-pulse" />
            )}
            {isAnalyzing ? t("analyzing_contract") : t("analyze_contract")}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Overall risk */}
          <div
            className={`rounded-2xl border p-6 shadow-sm ${overallRiskCfg?.color}`}
          >
            <div className="flex items-center gap-2.5 mb-3">
              {overallRiskCfg?.icon}
              <span className="font-extrabold text-lg">
                {t("overall_risk")}: {overallRiskCfg?.label}
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-95">{result.summary}</p>
          </div>

          {/* Risk breakdown */}
          <div className="grid grid-cols-4 gap-4">
            {(["critical", "high", "medium", "low"] as RiskLevel[]).map((level) => {
              const count = result.clauses.filter((c) => c.risk_level === level).length;
              const cfg = riskConfig[level];
              return (
                <div key={level} className={`rounded-2xl border p-5 shadow-sm ${cfg.color}`}>
                  <p className="text-3xl font-extrabold tracking-tight">{count}</p>
                  <p className="text-xs font-bold uppercase tracking-wider mt-1">{cfg.label}</p>
                </div>
              );
            })}
          </div>

          {/* Clauses */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-sm">
              {t("risk_clauses")} ({result.clauses.length})
            </h3>
            {result.clauses.map((clause, i) => {
              const cfg = riskConfig[clause.risk_level];
              const isExpanded = expandedClause === `${i}`;
              const hasSuggestion = !!clause.suggested_text;
              const showingSuggestion = showSuggestion.has(`${i}`);

              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200">
                  <div
                    className="flex items-start justify-between p-6 cursor-pointer hover:bg-gray-50/40 transition-colors"
                    onClick={() => setExpandedClause(isExpanded ? null : `${i}`)}
                  >
                    <div className="flex items-start gap-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider border flex-shrink-0 mt-0.5 ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      <div>
                        <p className="font-bold text-gray-900">
                          {lang === "EN" ? "Clause" : "Clause"} {clause.clause_number} — {clause.clause_title}
                        </p>
                        <p className="text-[10px] text-brand-600 font-extrabold uppercase mt-1">
                          {categoryLabels[clause.category] ?? clause.category}
                        </p>
                        <p className="text-sm font-medium text-gray-500 mt-2">{clause.risk_reason}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-50 pt-5 space-y-5 animate-fade-in">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          {t("original_text")}
                        </p>
                        <p className="text-xs text-gray-700 bg-gray-50 border border-gray-100 rounded-xl p-4 font-mono leading-relaxed select-all">
                          {clause.original_text}
                        </p>
                      </div>

                      {hasSuggestion && (
                        <div>
                          <button
                            onClick={() => toggleSuggestion(`${i}`)}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                          >
                            {showingSuggestion ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" /> {lang === "EN" ? "Hide IA Recommendation" : "Masquer la Recommandation IA"}
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-500" /> {lang === "EN" ? "View Suggested Redline" : "Voir la formulation recommandée"}
                              </>
                            )}
                          </button>
                          {showingSuggestion && (
                            <div className="mt-3 animate-fade-in">
                              <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
                                {t("suggested_text")} (Redline)
                              </p>
                              <p className="text-xs text-brand-900 bg-brand-50/40 border border-brand-100/50 rounded-xl p-4 font-mono leading-relaxed select-all shadow-inner">
                                {clause.suggested_text}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
