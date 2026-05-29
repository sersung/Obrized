"use client";

import { useState, useEffect } from "react";
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
import { useTranslations, Language } from "@/lib/translations";

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
  "Maple Ridge Condominium",
  "Yaletown Office Tower",
  "King St Renovation",
  "Westmount Residence",
];

export default function NewPaymentPage() {
  const [lang, setLang] = useState<Language>("EN");
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

  useEffect(() => {
    const savedLang = localStorage.getItem("buildr_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  const { t } = useTranslations(lang);

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
  
  // 10% statutory builder's lien holdback is mandatory in Canada (Ontario Construction Act s. 22, BC Builders Lien Act s. 4)
  const holdback = subtotal * 0.1;
  
  // Dynamic tax calculation depending on province
  const taxRate = province === "ON" ? 0.13 : province === "QC" ? 0.14975 : 0.05;
  const taxLabel = province === "ON" ? "HST (13%)" : province === "QC" ? "TPS + TVQ (14.975%)" : "GST (5%)";
  const hst = subtotal * taxRate;
  const total = subtotal + hst - holdback;

  const fmt = (n: number) =>
    new Intl.NumberFormat(lang === "EN" ? "en-CA" : "fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(n);

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
      if (data.is_proper_invoice) {
        toast.success(lang === "EN" ? "Proper Invoice validated!" : "Facture conforme validée !");
      } else {
        toast.error(lang === "EN" ? "Invoice has compliance issues." : "La facture contient des non-conformités.");
      }
    } catch {
      toast.error(lang === "EN" ? "Error during validation. Check API key." : "Erreur de validation. Vérifiez votre clé API.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validation?.is_proper_invoice) {
      toast.error(lang === "EN" ? "Please resolve compliance issues before submitting." : "Veuillez résoudre les non-conformités avant de soumettre.");
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
      toast.success(t("invoice_success"));
    } catch {
      toast.error(lang === "EN" ? "Error saving invoice." : "Erreur lors de la sauvegarde de la facture.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">{t("create_invoice")}</h2>
        <p className="text-xs text-gray-400 font-semibold mt-1">
          {lang === "EN" 
            ? "The AI automatically checks compliance with the Prompt Payment Act requirements (such as active WSIB clearances and sub lien waivers) before submitting."
            : "L'IA valide automatiquement la conformité aux exigences de la Loi sur le paiement rapide (comme les attestations de la CNESST et quittances)."}
        </p>
      </div>

      {/* Invoice header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-4">{lang === "EN" ? "Invoice Details" : "Détails de la Facture"}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {t("invoice_number")}
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("project_label")}</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
            >
              {PROJECTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t("province_label")}</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
            >
              <option value="ON">Ontario</option>
              <option value="BC">British Columbia</option>
              <option value="AB">Alberta</option>
              <option value="QC">Québec</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {lang === "EN" ? "Service Period" : "Période de Facturation"}
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm">{lang === "EN" ? "Billing Items" : "Éléments de Facturation"}</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> {lang === "EN" ? "Add Item" : "Ajouter un Élément"}
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start animate-fade-in">
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                placeholder={lang === "EN" ? "Description of services rendered" : "Description du service fourni"}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-center"
                placeholder={t("qty")}
              />
              <input
                type="number"
                value={item.unit_price}
                onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all bg-white"
                placeholder={lang === "EN" ? "Unit Price" : "Prix unit."}
              />
              <div className="w-32 py-2.5 text-sm text-right font-extrabold text-gray-900">
                {fmt(item.quantity * item.unit_price)}
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2.5 text-gray-305 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 pt-5 border-t border-gray-150 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">{t("subtotal")}</span>
            <span className="font-bold text-gray-900">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">{taxLabel}</span>
            <span className="font-bold text-gray-900">{fmt(hst)}</span>
          </div>
          <div className="flex justify-between text-sm text-amber-700 font-bold bg-amber-50/50 p-2.5 rounded-xl border border-amber-100/50">
            <span className="text-xs uppercase tracking-wider">{lang === "EN" ? "Statutory Holdback (10%)" : "Retenue Statutaire (10%)"}</span>
            <span>– {fmt(holdback)}</span>
          </div>
          <div className="flex justify-between font-black text-lg pt-4 border-t border-gray-200">
            <span className="text-sm uppercase tracking-wider">{lang === "EN" ? "Total Payable" : "Total à Payer"}</span>
            <span className="text-brand-600 text-xl">{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* Compliance docs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 text-sm mb-4">
          {lang === "EN" ? "Statutory Compliance Records" : "Documents de Conformité Légale"}
          <span className="ml-2 text-xs text-gray-400 font-semibold lowercase">
            ({lang === "EN" ? "required for valid Proper Invoice" : "exigés pour une facture conforme"})
          </span>
        </h3>
        <div className="space-y-4">
          {[
            {
              label: lang === "EN" ? "Active WSIB / WorkSafeBC Clearance Certificate" : "Attestation de conformité WSIB / CNESST active",
              required: province === "ON" || province === "BC" || province === "QC",
              uploaded: wsibUploaded,
              onToggle: () => setWsibUploaded((v) => !v),
            },
            {
              label: lang === "EN" ? "Subcontractor Statutory Declaration & Lien Waivers" : "Déclaration solennelle & quittance des sous-traitants",
              required: true,
              uploaded: lienWaiverUploaded,
              onToggle: () => setLienWaiverUploaded((v) => !v),
            },
          ].map((doc) => (
            <div
              key={doc.label}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                doc.uploaded
                  ? "border-emerald-200 bg-emerald-50/20"
                  : "border-gray-200 bg-gray-50/40"
              }`}
            >
              <div className="flex items-center gap-4">
                {doc.uploaded ? (
                  <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />
                ) : (
                  <XCircle className="w-5.5 h-5.5 text-gray-300" />
                )}
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-snug">{doc.label}</p>
                  {doc.required && (
                    <p className="text-[10px] text-brand-600 font-bold uppercase mt-1">Obrigatório para {province}</p>
                  )}
                </div>
              </div>
              <button
                onClick={doc.onToggle}
                className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl font-bold transition-all ${
                  doc.uploaded
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-white border border-gray-200 text-gray-650 hover:bg-gray-100"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {doc.uploaded ? (lang === "EN" ? "Uploaded" : "Transmis") : (lang === "EN" ? "Upload" : "Transmettre")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Validation */}
      {validation && (
        <div
          className={`rounded-2xl border p-6 shadow-sm animate-fade-in ${
            validation.is_proper_invoice
              ? "bg-emerald-50/30 border-emerald-100"
              : "bg-rose-50/30 border-rose-100"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-4">
            {validation.is_proper_invoice ? (
              <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600" />
            ) : (
              <XCircle className="w-5.5 h-5.5 text-rose-600" />
            )}
            <span className="font-extrabold text-lg">
              {validation.is_proper_invoice ? (lang === "EN" ? "Proper Invoice Valid!" : "Facture Conforme Valide !") : (lang === "EN" ? "Invoice Compliance Issues Found" : "Non-conformités détectées")}
            </span>
            <span className="ml-auto text-xs font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50 border px-2.5 py-1 rounded-full">
              Score: {validation.compliance_score}%
            </span>
          </div>

          {validation.issues.length > 0 && (
            <div className="space-y-2">
              {validation.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm font-medium">
                  <span className="text-rose-500 font-bold">✗</span>
                  <div className="text-gray-650 text-xs">
                    <span className="font-bold text-rose-900 uppercase tracking-wider text-[10px] mr-1.5">{issue.field}:</span>{" "}
                    <span className="text-rose-800">{issue.issue}</span>
                    <span className="text-rose-500/80 font-bold text-[10px] uppercase ml-1.5">({issue.legislation})</span>
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
          className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 bg-white"
        >
          {isValidating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
          )}
          {isValidating ? (lang === "EN" ? "Validating..." : "Validation...") : (lang === "EN" ? "Validate with AI" : "Valider avec l'IA")}
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/10 transition-all duration-200"
        >
          <Send className="w-4 h-4 text-brand-200" />
          {lang === "EN" ? "Submit Proper Invoice" : "Soumettre la Facture Conforme"}
        </button>
      </div>
    </div>
  );
}
