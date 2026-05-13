"use client";

import { useState, useCallback } from "react";
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

const riskConfig = {
  low: { label: "Baixo", color: "text-green-700 bg-green-50 border-green-200", icon: <CheckCircle2 className="w-4 h-4" /> },
  medium: { label: "Médio", color: "text-amber-700 bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-4 h-4" /> },
  high: { label: "Alto", color: "text-red-700 bg-red-50 border-red-200", icon: <AlertTriangle className="w-4 h-4" /> },
  critical: { label: "Crítico", color: "text-red-800 bg-red-100 border-red-300", icon: <XCircle className="w-4 h-4" /> },
};

const categoryLabels: Record<string, string> = {
  payment: "Pagamento",
  liability: "Responsabilidade",
  indemnity: "Indenização",
  dispute: "Disputas",
  delay: "Atrasos",
  termination: "Rescisão",
  warranty: "Garantias",
};

export default function NewContractPage() {
  const [file, setFile] = useState<File | null>(null);
  const [contractType, setContractType] = useState("CCDC-2");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [expandedClause, setExpandedClause] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState<Set<string>>(new Set());

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
      toast.error("Faça o upload do contrato em PDF.");
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

      if (!response.ok) throw new Error("Falha na análise");

      const data = await response.json();
      setResult(data);
      toast.success(`Análise concluída: ${data.clauses.length} cláusulas revisadas.`);
      // Save to Supabase
      await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${contractType} — ${file.name.replace(".pdf", "")}`,
          contract_type: contractType,
          counterparty: "",
          value: 0,
          overall_risk: data.overall_risk,
          clauses_count: data.clauses.length,
          analysis: data,
        }),
      });
    } catch {
      toast.error("Erro na análise. Verifique sua chave de API e tente novamente.");
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Análise de Contrato com IA</h2>
        <p className="text-sm text-gray-500 mt-1">
          Envie um contrato CCDC ou personalizado. A IA identifica cláusulas de risco e sugere
          redação para proteção do empreiteiro.
        </p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Tipo de Contrato
            </label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="CCDC-2">CCDC-2 — Empreitada a Preço Fixo</option>
              <option value="CCDC-5A">CCDC-5A — Gestão de Construção por Taxa</option>
              <option value="CCDC-5B">CCDC-5B — Gestão de Construção por Risco</option>
              <option value="CCDC-17">CCDC-17 — Empreitada Unitária</option>
              <option value="CCA-1">CCA-1 — Subcontrato CCDC</option>
              <option value="custom">Contrato Personalizado</option>
            </select>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-purple-400 bg-purple-50"
              : file
              ? "border-green-300 bg-green-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-gray-300" />
              <p className="font-medium text-gray-700">
                {isDragActive ? "Solte o contrato aqui" : "Arraste o PDF do contrato ou clique para selecionar"}
              </p>
              <p className="text-sm text-gray-400">PDF até 50MB · Contratos CCDC, CCA ou personalizados</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isAnalyzing ? "Analisando..." : "Analisar com IA"}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Overall risk */}
          <div
            className={`rounded-xl border p-5 ${overallRiskCfg?.color}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {overallRiskCfg?.icon}
              <span className="font-bold text-lg">
                Risco Geral: {overallRiskCfg?.label}
              </span>
            </div>
            <p className="text-sm opacity-90">{result.summary}</p>
          </div>

          {/* Risk breakdown */}
          <div className="grid grid-cols-4 gap-3">
            {(["critical", "high", "medium", "low"] as RiskLevel[]).map((level) => {
              const count = result.clauses.filter((c) => c.risk_level === level).length;
              const cfg = riskConfig[level];
              return (
                <div key={level} className={`rounded-xl border p-4 ${cfg.color}`}>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs font-medium mt-0.5">{cfg.label}</p>
                </div>
              );
            })}
          </div>

          {/* Clauses */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">
              Cláusulas Sinalizadas ({result.clauses.length})
            </h3>
            {result.clauses.map((clause, i) => {
              const cfg = riskConfig[clause.risk_level];
              const isExpanded = expandedClause === `${i}`;
              const hasSuggestion = !!clause.suggested_text;
              const showingSuggestion = showSuggestion.has(`${i}`);

              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <div
                    className="flex items-start justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedClause(isExpanded ? null : `${i}`)}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 mt-0.5 ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          Cláusula {clause.clause_number} — {clause.clause_title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {categoryLabels[clause.category] ?? clause.category}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{clause.risk_reason}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Texto Original
                        </p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 font-mono leading-relaxed">
                          {clause.original_text}
                        </p>
                      </div>

                      {hasSuggestion && (
                        <div>
                          <button
                            onClick={() => toggleSuggestion(`${i}`)}
                            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                          >
                            {showingSuggestion ? (
                              <>
                                <ChevronUp className="w-4 h-4" /> Ocultar Sugestão da IA
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" /> Ver Redação Sugerida
                              </>
                            )}
                          </button>
                          {showingSuggestion && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">
                                Sugestão de Redação (Redline)
                              </p>
                              <p className="text-sm text-gray-700 bg-purple-50 border border-purple-100 rounded-lg p-4 font-mono leading-relaxed">
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
