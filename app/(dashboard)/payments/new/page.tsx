"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
  Upload,
  Send,
} from "lucide-react";
import { toast } from "sonner";

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
};

type ValidationResult = {
  is_proper_invoice: boolean;
  compliance_score: number;
  issues: { field: string; issue: string; legislation: string }[];
};

const PROJECTS = [
  "Condomínio Maple Ridge",
  "Escritórios Yaletown",
  "King St Reforma",
  "Residência Westmount",
];

export default function NewPaymentPage() {
  const [project, setProject] = useState(PROJECTS[0]);
  const [province, setProvince] = useState("ON");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`
  );
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, unit_price: 0 },
  ]);
  const [wsibUploaded, setWsibUploaded] = useState(false);
  const [lienWaiverUploaded, setLienWaiverUploaded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), description: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
  const holdback = subtotal * 0.1;
  const hst = subtotal * 0.13;
  const total = subtotal + hst - holdback;

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "CAD" }).format(n);

  const handleValidate = async () => {
    setIsValidating(true);
    setValidation(null);

    try {
      const response = await fetch("/api/payments/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          province,
          invoiceNumber,
          project,
          periodStart,
          periodEnd,
          items,
          wsibUploaded,
          lienWaiverUploaded,
          subtotal,
          total,
        }),
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      setValidation(data);
    } catch {
      toast.error("Erro ao validar. Verifique sua chave de API.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validation?.is_proper_invoice) {
      toast.error("Corrija os problemas antes de submeter a fatura.");
      return;
    }
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          project_name: project,
          province,
          items,
          subtotal,
          total,
          is_proper: validation.is_proper_invoice,
          wsib_uploaded: wsibUploaded,
          lien_waiver_uploaded: lienWaiverUploaded,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Fatura submetida! Relógio de 28 dias iniciado.");
    } catch {
      toast.error("Erro ao salvar fatura.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Nova Fatura — Proper Invoice</h2>
        <p className="text-sm text-gray-500 mt-1">
          A IA valida automaticamente os requisitos da legislação de Prompt Payment (ON/BC) antes
          de submeter.
        </p>
      </div>

      {/* Invoice header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Dados da Fatura</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Número da Fatura
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Projeto</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Província</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ON">Ontario</option>
              <option value="BC">British Columbia</option>
              <option value="AB">Alberta</option>
              <option value="QC">Québec</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Período de Serviço
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Itens da Fatura</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            <Plus className="w-4 h-4" /> Adicionar Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                placeholder="Descrição do serviço"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))}
                className="w-20 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
                placeholder="Qtd"
              />
              <input
                type="number"
                value={item.unit_price}
                onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value))}
                className="w-32 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Preço unit."
              />
              <div className="w-32 py-2.5 text-sm text-right font-medium text-gray-900">
                {fmt(item.quantity * item.unit_price)}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">HST (13%)</span>
            <span className="font-medium">{fmt(hst)}</span>
          </div>
          <div className="flex justify-between text-sm text-amber-700">
            <span>Retenção Estatutária (10%)</span>
            <span>– {fmt(holdback)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
            <span>Total a Receber</span>
            <span className="text-brand-600">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Compliance docs */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Documentos de Conformidade
          <span className="ml-2 text-xs text-gray-500 font-normal">
            Exigidos para "proper invoice" válida
          </span>
        </h3>
        <div className="space-y-3">
          {[
            {
              label: "Certificado de Clearance WSIB / WorkSafeBC",
              required: province === "ON" || province === "BC",
              uploaded: wsibUploaded,
              onToggle: () => setWsibUploaded((v) => !v),
            },
            {
              label: "Lien Waiver dos Subempreiteiros",
              required: true,
              uploaded: lienWaiverUploaded,
              onToggle: () => setLienWaiverUploaded((v) => !v),
            },
          ].map((doc) => (
            <div
              key={doc.label}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                doc.uploaded
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {doc.uploaded ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-300" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                  {doc.required && (
                    <p className="text-xs text-gray-500">Obrigatório para {province}</p>
                  )}
                </div>
              </div>
              <button
                onClick={doc.onToggle}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  doc.uploaded
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {doc.uploaded ? "Enviado" : "Enviar"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Validation */}
      {validation && (
        <div
          className={`rounded-xl border p-5 ${
            validation.is_proper_invoice
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {validation.is_proper_invoice ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <span className="font-bold text-lg">
              {validation.is_proper_invoice ? "Fatura Válida!" : "Fatura Inválida"}
            </span>
            <span className="ml-auto text-sm font-medium">
              Conformidade: {validation.compliance_score}%
            </span>
          </div>

          {validation.issues.length > 0 && (
            <div className="space-y-2">
              {validation.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500">✗</span>
                  <div>
                    <span className="font-medium text-red-900">{issue.field}:</span>{" "}
                    <span className="text-red-800">{issue.issue}</span>
                    <span className="text-red-500 text-xs ml-1">({issue.legislation})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isValidating ? "Validando..." : "Validar com IA"}
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Submeter Fatura
        </button>
      </div>
    </div>
  );
}
