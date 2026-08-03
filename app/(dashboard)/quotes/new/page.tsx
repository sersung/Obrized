"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building,
  User,
  MapPin,
  Mail,
  Phone,
  Plus,
  Trash2,
  ChevronRight,
  Send,
  Save,
  Eye,
  DollarSign,
  FileText,
  Shield,
  Info,
  CheckCircle2,
  Hash,
} from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

const UNITS = ["sq ft", "lin ft", "hours", "units", "lot", "m²", "m", "days", "each"];

const PAYMENT_METHODS = [
  { id: "e-transfer", label: "E-Transfer (Interac)" },
  { id: "cheque",     label: "Cheque" },
  { id: "credit_card", label: "Credit Card (+2.5% fee)" },
  { id: "eft",        label: "EFT / Wire Transfer" },
  { id: "cash",       label: "Cash" },
];

const TAX_RATES: Record<string, number> = {
  ON: 13, BC: 12, AB: 5, QC: 14.975, MB: 12, SK: 11, NS: 15, NB: 15, NL: 15, PE: 15,
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);

const uid = () => Math.random().toString(36).slice(2, 9);

export default function NewQuotePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);

  // --- Provider ---
  const [providerCompany, setProviderCompany]   = useState("");
  const [providerName, setProviderName]         = useState("");
  const [providerEmail, setProviderEmail]       = useState("");
  const [providerPhone, setProviderPhone]       = useState("");
  const [providerAddress, setProviderAddress]   = useState("");
  const [providerLicense, setProviderLicense]   = useState("");
  const [providerHst, setProviderHst]           = useState("");

  // --- Client ---
  const [clientName, setClientName]       = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail]     = useState("");
  const [clientPhone, setClientPhone]     = useState("");
  const [clientAddress, setClientAddress] = useState("");

  // --- Project ---
  const [projectName, setProjectName]           = useState("");
  const [projectAddress, setProjectAddress]     = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [province, setProvince]                 = useState("ON");
  const validUntilDefault = new Date();
  validUntilDefault.setDate(validUntilDefault.getDate() + 30);
  const [validUntil, setValidUntil] = useState(validUntilDefault.toISOString().split("T")[0]);

  // --- Line Items ---
  const [items, setItems] = useState<LineItem[]>([
    { id: uid(), description: "", quantity: 1, unit: "units", unit_price: 0, total: 0 },
  ]);

  // --- Payment Terms ---
  const [advancePercent, setAdvancePercent]         = useState(20);
  const [paymentMethods, setPaymentMethods]         = useState<string[]>(["e-transfer", "cheque"]);
  const [paymentDueDays, setPaymentDueDays]         = useState(30);
  const [includeCollection, setIncludeCollection]   = useState(true);
  const [includeLien, setIncludeLien]               = useState(true);
  const [customNotes, setCustomNotes]               = useState("");

  // Pre-fill from localStorage (settings)
  useEffect(() => {
    setProviderCompany(localStorage.getItem("obrized_company_name") ?? "");
    setProviderName(localStorage.getItem("obrized_contractor_name") ?? "");
    setProviderEmail(localStorage.getItem("obrized_email") ?? "");
    const savedProv = localStorage.getItem("obrized_province") ?? "ON";
    setProvince(savedProv);
  }, []);

  // --- Computed totals ---
  const taxRate = TAX_RATES[province] ?? 13;
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const depositAmount = total * (advancePercent / 100);

  // --- Line item helpers ---
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          updated.total = Number(updated.quantity) * Number(updated.unit_price);
        }
        return updated;
      })
    );
  };

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: uid(), description: "", quantity: 1, unit: "units", unit_price: 0, total: 0 },
    ]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const toggleMethod = (id: string) =>
    setPaymentMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const buildPayload = (status: string) => ({
    status,
    provider_company:  providerCompany,
    provider_name:     providerName,
    provider_email:    providerEmail,
    provider_phone:    providerPhone,
    provider_address:  providerAddress,
    provider_license:  providerLicense,
    provider_hst:      providerHst,
    client_name:       clientName,
    client_company:    clientCompany,
    client_email:      clientEmail,
    client_phone:      clientPhone,
    client_address:    clientAddress,
    project_name:      projectName,
    project_address:   projectAddress,
    project_description: projectDescription,
    valid_until:       validUntil,
    items:             items.map(({ id: _id, ...rest }) => rest),
    subtotal,
    tax_rate:          taxRate,
    tax_amount:        taxAmount,
    total,
    advance_percent:   advancePercent,
    payment_methods:   paymentMethods,
    payment_due_days:  paymentDueDays,
    include_collection_clause: includeCollection,
    include_lien_clause: includeLien,
    custom_notes:      customNotes,
  });

  const save = async (status: "draft" | "sent") => {
    if (!clientName || !clientEmail || !projectName || items.length === 0) {
      toast.error("Please fill in client name, email, project name, and at least one line item.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(status)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(status === "sent" ? "Quote sent to client!" : "Quote saved as draft");
      if (status === "sent") {
        // Copy link to clipboard automatically
        const link = `${window.location.origin}/q/${data.id}`;
        navigator.clipboard.writeText(link).catch(() => {});
        toast.success(`Client link copied: ${link}`, { duration: 6000 });
      }
      router.push("/quotes");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save quote");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { n: 1, label: "Info" },
    { n: 2, label: "Items" },
    { n: 3, label: "Terms" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Quote</h1>
          <p className="text-sm text-gray-500 mt-0.5">Ontario standard terms included automatically</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.n as 1 | 2 | 3)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                step === s.n
                  ? "bg-brand-600 text-white shadow-sm"
                  : step > s.n
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : <span className="w-5 h-5 flex items-center justify-center text-xs">{s.n}</span>}
              {s.label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Provider + Client + Project ── */}
      {step === 1 && (
        <div className="space-y-5">
          {/* Provider */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <Building className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Your Company (Provider)</h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <Field label="Company Name *" value={providerCompany} onChange={setProviderCompany} placeholder="JC Construction Ltd." icon={<Building className="w-4 h-4" />} />
              <Field label="Contact Name *" value={providerName} onChange={setProviderName} placeholder="John Carter" icon={<User className="w-4 h-4" />} />
              <Field label="Email *" value={providerEmail} onChange={setProviderEmail} placeholder="info@jcconstruction.ca" type="email" icon={<Mail className="w-4 h-4" />} />
              <Field label="Phone" value={providerPhone} onChange={setProviderPhone} placeholder="(416) 555-0100" icon={<Phone className="w-4 h-4" />} />
              <div className="sm:col-span-2">
                <Field label="Business Address" value={providerAddress} onChange={setProviderAddress} placeholder="123 King St W, Toronto, ON M5X 1A1" icon={<MapPin className="w-4 h-4" />} />
              </div>
              <Field label="Master Contractor License #" value={providerLicense} onChange={setProviderLicense} placeholder="OCOT-12345678" icon={<Hash className="w-4 h-4" />} />
              <Field label="HST / GST Business Number" value={providerHst} onChange={setProviderHst} placeholder="123456789 RT0001" icon={<Hash className="w-4 h-4" />} />
            </div>
          </div>

          {/* Client */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <User className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Client Information</h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <Field label="Client Name *" value={clientName} onChange={setClientName} placeholder="Sarah Thompson" icon={<User className="w-4 h-4" />} />
              <Field label="Company (optional)" value={clientCompany} onChange={setClientCompany} placeholder="Thompson Developments Inc." icon={<Building className="w-4 h-4" />} />
              <Field label="Email *" value={clientEmail} onChange={setClientEmail} placeholder="s.thompson@email.com" type="email" icon={<Mail className="w-4 h-4" />} />
              <Field label="Phone" value={clientPhone} onChange={setClientPhone} placeholder="(647) 555-0200" icon={<Phone className="w-4 h-4" />} />
              <div className="sm:col-span-2">
                <Field label="Billing / Site Address *" value={clientAddress} onChange={setClientAddress} placeholder="456 Bay St, Toronto, ON M5H 2S3" icon={<MapPin className="w-4 h-4" />} />
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <FileText className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Project Details</h2>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <Field label="Project Name *" value={projectName} onChange={setProjectName} placeholder="Kitchen Renovation — 456 Bay St" icon={<FileText className="w-4 h-4" />} />
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Province *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {Object.entries(TAX_RATES).map(([p, r]) => (
                    <option key={p} value={p}>{p} — {r}% {p === "ON" ? "HST" : p === "QC" ? "QST+GST" : "tax"}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Field label="Site Address" value={projectAddress} onChange={setProjectAddress} placeholder="456 Bay St, Toronto, ON M5H 2S3" icon={<MapPin className="w-4 h-4" />} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Scope of Work</label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe the work to be performed..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Quote Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
            >
              Next: Line Items <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Line Items ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Line Items</h2>
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1" />
            </div>

            <div className="divide-y divide-gray-50">
              {items.map((item, idx) => (
                <div key={item.id} className="px-5 py-3 grid sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-4">
                    <input
                      placeholder={`Item ${idx + 1} description`}
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-200 rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-1 text-right font-bold text-gray-900 text-sm">
                    {fmt(item.total)}
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="p-1.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col items-end gap-1 text-sm max-w-xs ml-auto">
                <div className="flex justify-between w-full text-gray-600">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between w-full text-gray-600">
                  <span className="font-semibold">HST / Tax ({taxRate}%)</span>
                  <span className="font-bold">{fmt(taxAmount)}</span>
                </div>
                <div className="flex justify-between w-full text-gray-900 border-t border-gray-300 pt-2 mt-1">
                  <span className="font-black text-base">Total (CAD)</span>
                  <span className="font-black text-base text-brand-600">{fmt(total)}</span>
                </div>
                <div className="flex justify-between w-full text-emerald-700 mt-1">
                  <span className="font-semibold text-xs">Deposit ({advancePercent}%)</span>
                  <span className="font-bold text-xs">{fmt(depositAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors"
            >
              Next: Payment Terms <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Payment Terms & Legal ── */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Payment Terms</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Advance deposit */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Advance / Deposit Required — <span className="text-brand-600">{advancePercent}% ({fmt(total * advancePercent / 100)})</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 10, 20, 25, 30, 40, 50].map((p) => (
                    <button
                      key={p}
                      onClick={() => setAdvancePercent(p)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        advancePercent === p
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-brand-400"
                      }`}
                    >
                      {p === 0 ? "No deposit" : `${p}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment due days */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
                  Balance Due — Net <span className="text-brand-600">{paymentDueDays} days</span> after invoice
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map((d) => (
                    <button
                      key={d}
                      onClick={() => setPaymentDueDays(d)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                        paymentDueDays === d
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                          : "bg-white text-gray-600 border-gray-200 hover:border-brand-400"
                      }`}
                    >
                      Net {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Accepted Payment Methods</label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMethod(m.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        paymentMethods.includes(m.id)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {paymentMethods.includes(m.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Clauses */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <Shield className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Legal Clauses — Toronto, Ontario</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <input
                  type="checkbox"
                  id="collection"
                  checked={includeCollection}
                  onChange={(e) => setIncludeCollection(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-brand-600 flex-shrink-0"
                />
                <div>
                  <label htmlFor="collection" className="text-sm font-bold text-gray-900 cursor-pointer block mb-1">
                    Late Interest + Collection Agency Clause
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    "Overdue balances accrue interest at 2% per month (24% p.a.). Accounts outstanding 90+ days will be referred to a collection agency without further notice. Client agrees to pay all collection costs including legal fees."
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <input
                  type="checkbox"
                  id="lien"
                  checked={includeLien}
                  onChange={(e) => setIncludeLien(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-brand-600 flex-shrink-0"
                />
                <div>
                  <label htmlFor="lien" className="text-sm font-bold text-gray-900 cursor-pointer block mb-1">
                    Construction Lien Rights — Ontario Construction Act
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    "Contractor reserves the right to register a construction lien against the property under the Construction Act, R.S.O. 1990, c. C.30, as amended, for any outstanding balance. A 10-day written notice will be provided before lien registration."
                  </p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  The following are automatically included: HST disclosure ({taxRate}%), governing law (Province of Ontario), deposit terms, and payment method instructions.
                </p>
              </div>
            </div>
          </div>

          {/* Custom Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
              <FileText className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Additional Notes</h2>
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </div>
            <div className="p-5">
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Materials subject to supplier availability. Work to be completed within 30 business days of deposit receipt. Client to provide clear site access..."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5 space-y-2">
            <h3 className="text-sm font-bold text-brand-900">Quote Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="text-lg font-black text-brand-700">{fmt(total)}</p><p className="text-[11px] text-brand-600 font-semibold">Total incl. {taxRate}% tax</p></div>
              <div><p className="text-lg font-black text-brand-700">{fmt(depositAmount)}</p><p className="text-[11px] text-brand-600 font-semibold">Deposit ({advancePercent}%)</p></div>
              <div><p className="text-lg font-black text-brand-700">{items.length}</p><p className="text-[11px] text-brand-600 font-semibold">Line items</p></div>
              <div><p className="text-lg font-black text-brand-700">Net {paymentDueDays}</p><p className="text-[11px] text-brand-600 font-semibold">Payment terms</p></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button onClick={() => setStep(2)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              ← Back
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => save("draft")}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button
                onClick={() => save("sent")}
                disabled={saving}
                className="flex items-center gap-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                <Send className="w-4 h-4" />
                {saving ? "Saving..." : "Send to Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text", icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full border border-gray-200 rounded-xl ${icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500`}
        />
      </div>
    </div>
  );
}
