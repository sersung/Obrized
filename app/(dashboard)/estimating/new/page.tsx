"use client";

import { useState, useCallback } from "react";
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
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ExtractionState>("idle");
  const [items, setItems] = useState<LineItem[]>([]);
  const [overhead, setOverhead] = useState(15);
  const [profit, setProfit] = useState(10);
  const [projectName, setProjectName] = useState("");
  const [province, setProvince] = useState("ON");
  const [streamLog, setStreamLog] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
      toast.error("Preencha o nome do projeto e faça o upload de uma planta.");
      return;
    }
    setState("uploading");
    setStreamLog(["Preparando arquivo para análise..."]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectName", projectName);
    formData.append("province", province);

    try {
      setState("extracting");
      setStreamLog((prev) => [...prev, "Enviando para análise de IA..."]);

      const response = await fetch("/api/estimating/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Falha na extração");

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
            setStreamLog((prev) => [...prev, data.message]);
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
            setStreamLog((prev) => [...prev, `✓ ${extractedItems.length} itens extraídos com sucesso.`]);
          }
        }
      }
    } catch (err) {
      setState("error");
      toast.error("Erro na extração. Verifique sua chave de API e tente novamente.");
      setStreamLog((prev) => [...prev, "✗ Erro durante a extração."]);
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
  const hst = (subtotal + overheadAmount + profitAmount) * 0.13;
  const total = subtotal + overheadAmount + profitAmount + hst;

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Novo Orçamento com IA</h2>
        <p className="text-sm text-gray-500 mt-1">
          Faça upload de uma planta em PDF e a IA extrairá automaticamente os quantitativos de
          construção.
        </p>
      </div>

      {/* Project info */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Informações do Projeto</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome do Projeto *
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Condomínio Maple Ridge"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Província</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
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
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Planta Arquitetônica (PDF)</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-brand-400 bg-brand-50"
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
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(1)} MB · Pronto para análise
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-gray-300" />
              <p className="font-medium text-gray-700">
                {isDragActive ? "Solte o arquivo aqui" : "Arraste a planta ou clique para selecionar"}
              </p>
              <p className="text-sm text-gray-400">PDF até 50MB</p>
            </div>
          )}
        </div>

        {/* Stream log */}
        {streamLog.length > 0 && (
          <div className="mt-4 bg-gray-900 rounded-lg p-4 text-sm font-mono">
            {streamLog.map((log, i) => (
              <p key={i} className="text-green-400 text-xs leading-5">
                {log}
              </p>
            ))}
            {state === "extracting" && (
              <p className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analisando...
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleExtract}
            disabled={!file || !projectName || state === "extracting" || state === "uploading"}
            className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state === "extracting" || state === "uploading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {state === "extracting" ? "Extraindo..." : "Extrair com IA"}
          </button>
        </div>
      </div>

      {/* Line items */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                Quantitativos Extraídos ({items.length} itens)
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Clique em um item para editar os valores
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    CSI / Descrição
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Qtd
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Custo Material
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Mão de Obra
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3" />
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
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => toggleRow(item.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <div>
                              <span className="text-xs text-brand-600 font-mono font-medium">
                                {item.csi_code}
                              </span>
                              <p className="font-medium text-gray-900">{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {fmt(item.material_cost)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmt(labourCost)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {fmt(lineTotal)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${item.id}-expanded`} className="bg-blue-50/30">
                          <td colSpan={6} className="px-4 py-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Custo Material (CAD)
                                </label>
                                <input
                                  type="number"
                                  value={item.material_cost}
                                  onChange={(e) =>
                                    updateItem(item.id, "material_cost", parseFloat(e.target.value))
                                  }
                                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Horas M.O.
                                </label>
                                <input
                                  type="number"
                                  value={item.labour_hours}
                                  onChange={(e) =>
                                    updateItem(item.id, "labour_hours", parseFloat(e.target.value))
                                  }
                                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Taxa M.O. ($/hr)
                                </label>
                                <input
                                  type="number"
                                  value={item.labour_rate}
                                  onChange={(e) =>
                                    updateItem(item.id, "labour_rate", parseFloat(e.target.value))
                                  }
                                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">
                                  Preço Unit. (CAD)
                                </label>
                                <input
                                  type="number"
                                  value={item.unit_price}
                                  onChange={(e) =>
                                    updateItem(item.id, "unit_price", parseFloat(e.target.value))
                                  }
                                  className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
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
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Resumo do Orçamento</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Materiais</span>
                <span className="font-medium text-gray-900">{fmt(totals.material)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mão de Obra</span>
                <span className="font-medium text-gray-900">{fmt(totals.labour)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{fmt(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-600 flex items-center gap-2">
                  Overhead (%)
                  <input
                    type="number"
                    value={overhead}
                    onChange={(e) => setOverhead(parseFloat(e.target.value))}
                    className="w-14 border border-gray-200 rounded px-2 py-0.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </label>
                <span className="font-medium text-gray-900">{fmt(overheadAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="text-gray-600 flex items-center gap-2">
                  Lucro (%)
                  <input
                    type="number"
                    value={profit}
                    onChange={(e) => setProfit(parseFloat(e.target.value))}
                    className="w-14 border border-gray-200 rounded px-2 py-0.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </label>
                <span className="font-medium text-gray-900">{fmt(profitAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">HST (13%)</span>
                <span className="font-medium text-gray-900">{fmt(hst)}</span>
              </div>

              <div className="border-t-2 border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total da Proposta</span>
                <span className="font-bold text-xl text-brand-600">{fmt(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 justify-end">
              <button className="flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors">
                <Download className="w-4 h-4" />
                Exportar Orçamento (PDF)
              </button>
              <button className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <DollarSign className="w-4 h-4" />
                Converter em Fatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
