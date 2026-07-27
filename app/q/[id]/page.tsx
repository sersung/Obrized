"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Building,
  User,
  MapPin,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Loader2,
  HardHat,
  FileText,
  Clock,
  XCircle,
} from "lucide-react";

interface QuoteItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

interface Quote {
  id: string;
  quote_number: string;
  status: string;
  provider_company: string;
  provider_name: string;
  provider_email: string;
  provider_phone: string;
  provider_address: string;
  provider_license: string;
  provider_hst: string;
  client_name: string;
  client_company: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  project_name: string;
  project_address: string;
  project_description: string;
  valid_until: string;
  items: QuoteItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  advance_percent: number;
  payment_methods: string[];
  payment_due_days: number;
  late_interest_rate: number;
  include_collection_clause: boolean;
  include_lien_clause: boolean;
  custom_notes: string;
  signed_at: string | null;
  signed_by: string | null;
  created_at: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n ?? 0);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });

const METHOD_LABELS: Record<string, string> = {
  "e-transfer":   "Interac E-Transfer",
  "cheque":       "Cheque",
  "credit_card":  "Credit Card (2.5% surcharge applies)",
  "eft":          "EFT / Wire Transfer",
  "cash":         "Cash",
};

export default function QuoteViewPage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Signature state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [sigName, setSigName] = useState("");
  const [signing, setSigning] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/quotes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else { setQuote(d); if (d.signed_at) setSigned(true); }
      })
      .catch(() => setError("Failed to load quote"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Canvas signature ──
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setHasSig(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const clearSig = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const handleSign = async () => {
    if (!sigName.trim()) return alert("Please type your full name to confirm your signature.");
    if (!hasSig) return alert("Please draw your signature above.");
    if (!agreed) return alert("Please check the acceptance checkbox.");
    const signatureData = canvasRef.current!.toDataURL("image/png");
    setSigning(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sign", signed_by: sigName.trim(), signature_data: signatureData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuote(data);
      setSigned(true);
    } catch (e: any) {
      alert("Failed to sign: " + (e.message ?? "Unknown error"));
    } finally {
      setSigning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    </div>
  );

  if (error || !quote) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <XCircle className="w-12 h-12 text-rose-400" />
      <p className="text-gray-600 font-semibold">{error || "Quote not found"}</p>
    </div>
  );

  const isExpired = quote.valid_until && new Date(quote.valid_until) < new Date();
  const depositAmt = quote.total * (quote.advance_percent / 100);
  const balance = quote.total - depositAmt;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto space-y-0 print:max-w-none">

        {/* Document */}
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none">

          {/* Header banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8 text-white">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                  <HardHat className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <p className="text-white font-black text-lg leading-tight">{quote.provider_company || "Service Provider"}</p>
                  {quote.provider_hst && <p className="text-slate-400 text-[11px] mt-0.5">HST # {quote.provider_hst}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QUOTE</p>
                <p className="text-2xl font-black text-white mt-0.5">{quote.quote_number}</p>
                <p className="text-slate-400 text-xs mt-1">Issued: {fmtDate(quote.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Status bar */}
          {signed || quote.signed_at ? (
            <div className="bg-emerald-50 border-b border-emerald-200 px-8 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-800">
                Quote accepted and signed by {quote.signed_by || sigName} on {fmtDate(quote.signed_at ?? new Date().toISOString())}
              </span>
            </div>
          ) : isExpired ? (
            <div className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-bold text-amber-800">This quote expired on {fmtDate(quote.valid_until)}. Contact the provider for a renewal.</span>
            </div>
          ) : null}

          <div className="px-8 py-8 space-y-8">
            {/* Provider + Client columns */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1.5">From</p>
                <p className="font-bold text-slate-900">{quote.provider_company}</p>
                {quote.provider_name && <p className="text-sm text-slate-600 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {quote.provider_name}</p>}
                {quote.provider_email && <p className="text-sm text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {quote.provider_email}</p>}
                {quote.provider_phone && <p className="text-sm text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {quote.provider_phone}</p>}
                {quote.provider_address && <p className="text-sm text-slate-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {quote.provider_address}</p>}
                {quote.provider_license && <p className="text-xs text-slate-500 mt-1">License: {quote.provider_license}</p>}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1.5">To</p>
                <p className="font-bold text-slate-900">{quote.client_name}</p>
                {quote.client_company && <p className="text-sm text-slate-600 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> {quote.client_company}</p>}
                {quote.client_email && <p className="text-sm text-slate-600 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {quote.client_email}</p>}
                {quote.client_phone && <p className="text-sm text-slate-600 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {quote.client_phone}</p>}
                {quote.client_address && <p className="text-sm text-slate-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {quote.client_address}</p>}
              </div>
            </div>

            {/* Project */}
            <div className="bg-slate-50 rounded-2xl p-5 space-y-2 border border-slate-200">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Project Details</p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 font-semibold">Project: </span>
                  <span className="font-bold text-slate-900">{quote.project_name}</span>
                </div>
                {quote.project_address && (
                  <div>
                    <span className="text-slate-500 font-semibold">Site: </span>
                    <span className="text-slate-700">{quote.project_address}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 font-semibold">Quote Valid Until: </span>
                  <span className={`font-bold ${isExpired ? "text-rose-600" : "text-slate-900"}`}>{fmtDate(quote.valid_until)}</span>
                </div>
              </div>
              {quote.project_description && (
                <p className="text-sm text-slate-600 mt-3 leading-relaxed border-t border-slate-200 pt-3">{quote.project_description}</p>
              )}
            </div>

            {/* Line Items */}
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Scope of Work & Pricing</p>
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-bold">Description</th>
                      <th className="text-right px-4 py-3 text-xs font-bold">Qty</th>
                      <th className="text-right px-4 py-3 text-xs font-bold">Unit</th>
                      <th className="text-right px-4 py-3 text-xs font-bold">Unit Price</th>
                      <th className="text-right px-4 py-3 pr-5 text-xs font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((item, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.description}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{item.unit}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{fmt(item.unit_price)}</td>
                        <td className="px-4 py-3 pr-5 text-right font-bold text-slate-900">{fmt(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-200 bg-slate-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-2.5 text-right text-xs font-bold text-slate-500 uppercase">Subtotal</td>
                      <td className="px-4 py-2.5 pr-5 text-right font-bold text-slate-900">{fmt(quote.subtotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">HST / Tax ({quote.tax_rate}%)</td>
                      <td className="px-4 py-2 pr-5 text-right font-bold text-slate-700">{fmt(quote.tax_amount)}</td>
                    </tr>
                    <tr className="bg-slate-900">
                      <td colSpan={4} className="px-4 py-3.5 text-right text-sm font-black text-white uppercase tracking-wide">Total (CAD)</td>
                      <td className="px-4 py-3.5 pr-5 text-right text-lg font-black text-amber-400">{fmt(quote.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payment Terms</p>

              {quote.advance_percent > 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-amber-900">
                      Advance Deposit Required: {fmt(depositAmt)} ({quote.advance_percent}%)
                    </p>
                    <p className="text-amber-700 mt-0.5 font-medium">
                      A non-refundable deposit of {fmt(depositAmt)} ({quote.advance_percent}% of the total) is due upon signing and acceptance of this quote. Work will not commence until the deposit is received. Balance of {fmt(balance)} is due Net {quote.payment_due_days} days after project completion invoice.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm space-y-2">
                <p className="font-bold text-slate-900">Accepted Payment Methods</p>
                <ul className="space-y-1">
                  {(quote.payment_methods ?? []).map((m) => (
                    <li key={m} className="flex items-center gap-2 text-slate-600 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {METHOD_LABELS[m] ?? m}
                      {m === "e-transfer" && quote.provider_email && (
                        <span className="text-slate-400">— {quote.provider_email}</span>
                      )}
                      {m === "cheque" && quote.provider_company && (
                        <span className="text-slate-400">— Payable to: {quote.provider_company}</span>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-200 mt-2">
                  All amounts are in Canadian dollars (CAD) and include Harmonized Sales Tax (HST) at {quote.tax_rate}% as applicable in the province of service.
                </p>
              </div>
            </div>

            {/* Legal Clauses */}
            {(quote.include_collection_clause || quote.include_lien_clause) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-500" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Legal Terms & Conditions</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 leading-relaxed border border-slate-200 rounded-2xl p-5 bg-slate-50 divide-y divide-slate-200">
                  <p className="pb-3">
                    <strong className="text-slate-800">1. Governing Law.</strong> This quote, upon acceptance by the Client, constitutes a binding agreement governed by the laws of the Province of Ontario, Canada. Any dispute arising from this agreement shall be resolved in the courts of Ontario.
                  </p>

                  {quote.advance_percent > 0 && (
                    <p className="py-3">
                      <strong className="text-slate-800">2. Deposit &amp; Cancellation.</strong> A non-refundable deposit of {quote.advance_percent}% ({fmt(depositAmt)}) is due upon execution of this agreement. This deposit is non-refundable if the project is cancelled after materials have been ordered or work has commenced.
                    </p>
                  )}

                  {quote.include_collection_clause && (
                    <p className="py-3">
                      <strong className="text-slate-800">{quote.advance_percent > 0 ? "3" : "2"}. Late Payment &amp; Collection.</strong> All invoices are due within Net {quote.payment_due_days} days of issuance. Balances outstanding beyond the due date will accrue interest at the rate of {quote.late_interest_rate}% per month ({(quote.late_interest_rate * 12).toFixed(0)}% per annum), compounded monthly, calculated from the due date. Accounts outstanding for more than 90 days may be referred to a third-party collection agency without further notice. The Client agrees to pay all costs of collection, including agency fees (typically 25–33% of the recovered amount), court filing fees, and reasonable legal fees and disbursements incurred in the enforcement of this agreement.
                    </p>
                  )}

                  {quote.include_lien_clause && (
                    <p className="py-3">
                      <strong className="text-slate-800">{quote.advance_percent > 0 ? (quote.include_collection_clause ? "4" : "3") : (quote.include_collection_clause ? "3" : "2")}. Construction Lien Rights.</strong> The Contractor reserves the right to preserve and perfect a construction lien against the property under the <em>Construction Act</em>, R.S.O. 1990, c. C.30, as amended, for any outstanding balance owed under this agreement. The Contractor will provide 10 days' written notice to the Client before registering a lien. The statutory 10% holdback required under the <em>Construction Act</em> will be released upon expiry of the lien period following substantial performance or completion of the work.
                    </p>
                  )}

                  <p className="pt-3">
                    <strong className="text-slate-800">General.</strong> All prices are in Canadian dollars (CAD). This quote is valid until {fmtDate(quote.valid_until)} and is subject to material availability and pricing at the time of acceptance. The Contractor is not responsible for delays caused by weather, supply chain disruptions, or circumstances beyond its reasonable control.
                  </p>
                </div>
              </div>
            )}

            {/* Custom Notes */}
            {quote.custom_notes && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Additional Notes</p>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed">{quote.custom_notes}</p>
              </div>
            )}

            {/* ── SIGNATURE SECTION ── */}
            {!signed && !quote.signed_at && !isExpired && (
              <div className="border-2 border-brand-200 rounded-2xl overflow-hidden">
                <div className="bg-brand-50 px-6 py-4 border-b border-brand-200">
                  <h3 className="text-base font-bold text-brand-900">Accept & Sign this Quote</h3>
                  <p className="text-xs text-brand-700 mt-1">By signing below you confirm your acceptance of all terms and conditions set out in this quote.</p>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Full Name (typed signature)</label>
                    <input
                      type="text"
                      value={sigName}
                      onChange={(e) => setSigName(e.target.value)}
                      placeholder="Type your full legal name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Draw your signature</label>
                      <button onClick={clearSig} className="text-xs text-rose-500 hover:text-rose-700 font-semibold">Clear</button>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 touch-none">
                      <canvas
                        ref={canvasRef}
                        width={700}
                        height={140}
                        className="w-full cursor-crosshair"
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={stopDraw}
                        onMouseLeave={stopDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={stopDraw}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Draw your signature above using your mouse or finger</p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-brand-600 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      I, <strong>{sigName || "[your name]"}</strong>, confirm that I have read, understood, and agree to all terms and conditions set out in Quote {quote.quote_number}, including the payment terms, deposit requirements, late interest, and legal clauses. I understand this constitutes a legally binding agreement under the laws of Ontario, Canada.
                    </span>
                  </label>

                  <button
                    onClick={handleSign}
                    disabled={signing || !sigName.trim() || !hasSig || !agreed}
                    className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white py-3.5 rounded-xl font-bold text-sm hover:from-brand-700 hover:to-brand-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {signing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {signing ? "Processing..." : `Accept & Sign Quote ${quote.quote_number}`}
                  </button>
                </div>
              </div>
            )}

            {/* Signed confirmation */}
            {(signed || quote.signed_at) && (
              <div className="border-2 border-emerald-300 rounded-2xl bg-emerald-50 p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">Quote Accepted</h3>
                <p className="text-sm text-emerald-700">
                  This quote was accepted and signed by <strong>{quote.signed_by || sigName}</strong> on {fmtDate(quote.signed_at ?? new Date().toISOString())}.
                </p>
                <p className="text-xs text-emerald-600">
                  {quote.provider_company} will be in touch shortly to confirm the project start date and deposit details.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-8 py-4 bg-slate-50 flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Quote {quote.quote_number} · {quote.provider_company}</span>
            <span>Powered by <span className="font-bold text-slate-600">Obrized</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
