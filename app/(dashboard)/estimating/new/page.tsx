"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  DollarSign,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, Language } from "@/lib/translations";
import Link from "next/link";

type LineItem = {
  id: string;
  csi_code: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  material_cost: number;
  labour_hours: number;
  labour_rate: number;
  ai_extracted: boolean;
};

type ExtractionState = "idle" | "uploading" | "extracting" | "done" | "error";

const LABOUR_RATE_DEFAULT = 65; // CAD/hr

export default function NewEstimatePage() {
  const [lang, setLang] = useState<Language>("EN");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ExtractionState>("idle");
  const [items, setItems] = useState<LineItem[]>([]);
  const [overhead, setOverhead] = useState(15);
  const [profit, setProfit] = useState(10);
  const [projectName, setProjectName] = useState("");
  const [province, setProvince] = useState("ON");
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setFile(acceptedFiles[0]);
      setItems([]);
      setState("idle");
      setStreamLog([]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleExtract = async () => {
    if (!file || !projectName) {
      toast.error(lang === "EN" ? "Please fill in project name and upload a blueprint." : "Veuillez remplir le nom du projet et télécharger un plan.");
      return;
    }
    setState("uploading");
    setStreamLog([t("stream_reading")]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectName", projectName);
    formData.append("province", province);

    try {
      setState("extracting");
      setStreamLog((prev) => [...prev, t("stream_analyzing")]);

      const response = await fetch("/api/estimating/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Extraction failed");

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      const extractedItems: LineItem[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = JSON.parse(line.replace("data: ", ""));
          if (data.type === "log") {
            // Translate standard log updates
            let msg = data.message;
            if (msg.includes("Lendo arquivo")) msg = t("stream_reading");
            if (msg.includes("Analisando planta")) msg = t("stream_analyzing");
            setStreamLog((prev) => [...prev, msg]);
          } else if (data.type === "item") {
            const item: LineItem = {
              id: Math.random().toString(36).slice(2),
              ...data.item,
              labour_rate: LABOUR_RATE_DEFAULT,
              ai_extracted: true,
            };
            extractedItems.push(item);
            setItems([...extractedItems]);
          } else if (data.type === "done") {
            setState("done");
            setStreamLog((prev) => [...prev, `✓ ${extractedItems.length} ${lang === "EN" ? "items extracted successfully." : "éléments extraits avec succès."}`]);
            
            // Save to Mock DB / Supabase
            const totalMat = extractedItems.reduce((s, i) => s + i.material_cost, 0);
            const totalLab = extractedItems.reduce((s, i) => s + i.labour_hours * i.labour_rate, 0);
            await fetch("/api/estimates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                project_name: projectName,
                province,
                items: extractedItems,
                total_value: totalMat + totalLab,
                confidence: extractedItems.length > 0
                  ? Math.round(extractedItems.reduce((s, i) => s + (i.ai_extracted ? 85 : 100), 0) / extractedItems.length)
                  : 0,
              }),
            });
            toast.success(lang === "EN" ? "Estimate saved successfully!" : "Estimation enregistrée avec succès!");
          }
        }
      }
    } catch (err) {
      setState("error");
      toast.error(lang === "EN" ? "Extraction error. Please verify your Gemini API key and try again." : "Erreur d'extraction. Veuillez vérifier votre clé API Gemini et réessayer.");
      setStreamLog((prev) => [...prev, t("stream_error")]);
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: number | string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totals = items.reduce(
    (acc, item) => ({
      material: acc.material + item.material_cost,
      labour: acc.labour + item.labour_hours * item.labour_rate,
    }),
    { material: 0, labour: 0 }
  );

  const subtotal = totals.material + totals.labour;
  const overheadAmount = subtotal * (overhead / 100);
  const profitAmount = (subtotal + overheadAmount) * (profit / 100);
  
  // Canadian taxes: 13% HST in Ontario, GST/PST in others. Let's calculate dynamically
  const taxRate = province === "ON" ? 0.13 : province === "QC" ? 0.14975 : 0.05; // 5% GST in AB
  const taxLabel = province === "ON" ? "HST (13%)" : province === "QC" ? "TPS + TVQ (14.975%)" : "GST (5%)";
  const taxAmount = (subtotal + overheadAmount + profitAmount) * taxRate;
  const total = subtotal + overheadAmount + profitAmount + taxAmount;

  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === "EN" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(n);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportToCSV = () => {
    if (items.length === 0) return;
    const headers = ["CSI Code", "Description", "Quantity", "Unit", "Material Cost (CAD)", "Labour Hours", "Labour Rate (CAD/hr)", "Line Total (CAD)"];
    const rows = items.map(item => {
      const labourCost = item.labour_hours * item.labour_rate;
      const lineTotal = item.material_cost + labourCost;
      return [
        item.csi_code,
        `"${item.description.replace(/"/g, '""')}"`,
        item.quantity,
        item.unit,
        item.material_cost,
        item.labour_hours,
        item.labour_rate,
        lineTotal
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${projectName.replace(/\s+/g, "_") || "estimate"}_takeoff.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(lang === "EN" ? "CSV proposal exported successfully!" : "Proposition CSV exportée avec succès!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("new_estimate_title")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {t("new_estimate_desc")}
        </p>
      </div>

      {/* Project info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-4">{t("project_info")}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {t("project_name_label")}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={t("project_name_placeholder")}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {t("province_label")}
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="ON">Ontario</option>
              <option value="BC">British Columbia</option>
              <option value="AB">Alberta</option>
              <option value="QC">Québec</option>
              <option value="MB">Manitoba</option>
              <option value="SK">Saskatchewan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload zone */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-4">{t("architectural_drawing")}</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? "border-brand-400 bg-brand-50/50"
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
              <p className="text-xs text-gray-400 font-semibold">
                {(file.size / 1024 / 1024).toFixed(1)} MB · Ready for analysis
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-11 h-11 text-gray-300" />
              <p className="font-bold text-gray-700 text-sm">
                {isDragActive ? t("dropzone_active") : t("dropzone_inactive")}
              </p>
              <p className="text-xs text-gray-400 font-semibold">{t("pdf_max_size")}</p>
            </div>
          )}
        </div>

        {/* Stream log */}
        {streamLog.length > 0 && (
          <div className="mt-5 bg-slate-950 rounded-xl p-5 text-xs font-mono border border-slate-900 shadow-inner max-h-48 overflow-y-auto">
            {streamLog.map((log, i) => (
              <p key={i} className="text-emerald-400/90 leading-6">
                {log}
              </p>
            ))}
            {state === "extracting" && (
              <p className="text-slate-400 flex items-center gap-2 mt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {lang === "EN" ? "Extracting blueprint takeoffs..." : "Extraction en cours..."}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleExtract}
            disabled={!file || !projectName || state === "extracting" || state === "uploading"}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {state === "extracting" || state === "uploading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-brand-200" />
            )}
            {state === "extracting" ? t("extracting") : t("extract_with_ai")}
          </button>
        </div>
      </div>

      {/* Line items */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">
                {t("extracted_quantities")} ({items.length} {lang === "EN" ? "items" : "éléments"})
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                {t("click_to_edit")}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t("csi_description")}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t("qty")}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t("material_cost")}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t("labour")}
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t("total")}
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => {
                  const labourCost = item.labour_hours * item.labour_rate;
                  const lineTotal = item.material_cost + labourCost;
                  const isExpanded = expandedRows.has(item.id);

                  return (
                    <>
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50/40 transition-colors cursor-pointer"
                        onClick={() => toggleRow(item.id)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <span className="text-[10px] text-brand-600 font-mono font-extrabold uppercase tracking-wide">
                                {item.csi_code}
                              </span>
                              <p className="font-bold text-gray-900 mt-0.5">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-gray-600 font-medium">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-600 font-semibold">
                          {fmt(item.material_cost)}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-600 font-semibold">{fmt(labourCost)}</td>
                        <td className="px-5 py-4 text-right font-extrabold text-gray-900">
                          {fmt(lineTotal)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id}-expanded`} className="bg-brand-50/20">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1.5">
                                  {t("material_cost_cad")}
                                </label>
                                <input
                                  type="number"
                                  value={item.material_cost}
                                  onChange={(e) =>
                                    updateItem(item.id, "material_cost", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1.5">
                                  {t("labour_hours")}
                                </label>
                                <input
                                  type="number"
                                  value={item.labour_hours}
                                  onChange={(e) =>
                                    updateItem(item.id, "labour_hours", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1.5">
                                  {t("labour_rate")}
                                </label>
                                <input
                                  type="number"
                                  value={item.labour_rate}
                                  onChange={(e) =>
                                    updateItem(item.id, "labour_rate", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1.5">
                                  {t("unit_price_cad")}
                                </label>
                                <input
                                  type="number"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 text-sm mb-4">{t("estimate_summary")}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">{t("materials")}</span>
                <span className="font-bold text-gray-900">{fmt(totals.material)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">{t("labour")}</span>
                <span className="font-bold text-gray-900">{fmt(totals.labour)}</span>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between text-sm">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">{t("subtotal")}</span>
                <span className="font-extrabold text-gray-900">{fmt(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-400 font-semibold uppercase text-xs tracking-wider flex items-center gap-2">
                  {t("overhead")} (%)
                  <input
                    type="number"
                    value={overhead}
                    onChange={(e) => setOverhead(parseFloat(e.target.value) || 0)}
                    className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-extrabold bg-gray-50/50"
                  />
                </label>
                <span className="font-bold text-gray-900">{fmt(overheadAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-400 font-semibold uppercase text-xs tracking-wider flex items-center gap-2">
                  {t("profit")} (%)
                  <input
                    type="number"
                    value={profit}
                    onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                    className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 font-extrabold bg-gray-50/50"
                  />
                </label>
                <span className="font-bold text-gray-900">{fmt(profitAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">{taxLabel}</span>
                <span className="font-bold text-gray-900">{fmt(taxAmount)}</span>
              </div>

              <div className="border-t-2 border-slate-200 pt-4 flex justify-between">
                <span className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">{t("proposal_total")}</span>
                <span className="font-black text-2xl text-brand-600">{fmt(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-end">
              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2.5 bg-brand-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200"
              >
                <Download className="w-4 h-4 text-brand-200 animate-bounce" />
                {t("export_proposal")}
              </button>
              <Link
                href="/payments/new"
                className="flex items-center justify-center gap-2.5 border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50/60 transition-colors"
              >
                <DollarSign className="w-4 h-4 text-gray-400" />
                {t("convert_to_invoice")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
