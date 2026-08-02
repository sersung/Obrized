import { notFound } from "next/navigation";
import Link from "next/link";
import {
  HardHat, FileText, Briefcase, CheckCircle2,
  Clock, AlertCircle, ExternalLink, Mail, Phone,
} from "lucide-react";

interface PortalData {
  client: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  provider: { name: string; company: string };
  quotes: Array<{
    id: string;
    quote_number: string;
    status: string;
    total: number;
    project_name: string;
    valid_until: string | null;
    created_at: string;
  }>;
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    scheduled_date: string | null;
    total_value: number;
    address: string;
    description: string;
  }>;
}

const QUOTE_STATUS: Record<string, { label: string; color: string }> = {
  draft:    { label: "Draft",    color: "bg-gray-100 text-gray-600" },
  sent:     { label: "Awaiting your review", color: "bg-blue-50 text-blue-700" },
  viewed:   { label: "Reviewed", color: "bg-purple-50 text-purple-700" },
  signed:   { label: "Signed",   color: "bg-emerald-50 text-emerald-700" },
  declined: { label: "Declined", color: "bg-red-50 text-red-600" },
};

const JOB_STATUS: Record<string, { label: string; color: string }> = {
  scheduled:   { label: "Scheduled",    color: "bg-blue-50 text-blue-700" },
  in_progress: { label: "In Progress",  color: "bg-amber-50 text-amber-700" },
  completed:   { label: "Completed",    color: "bg-emerald-50 text-emerald-700" },
  cancelled:   { label: "Cancelled",    color: "bg-gray-100 text-gray-500" },
};

async function getPortalData(token: string): Promise<PortalData | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/portal/${token}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ClientPortalPage({ params }: { params: { token: string } }) {
  const data = await getPortalData(params.token);
  if (!data) notFound();

  const { client, provider, quotes, jobs } = data;
  const pendingQuotes = quotes.filter((q) => q.status === "sent" || q.status === "viewed");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-950 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
            <HardHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-none">Obrized</p>
            <p className="text-slate-400 text-xs mt-0.5">Client Portal</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Welcome</p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {client.name || client.company || "Client"}
          </h1>
          {client.company && client.name && (
            <p className="text-gray-500 text-sm mt-0.5">{client.company}</p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            This is your private portal with <strong>{provider.company || provider.name}</strong>.
            Review quotes, track your jobs, and request services below.
          </p>
        </div>

        {/* Action banner for pending quotes */}
        {pendingQuotes.length > 0 && (
          <div className="bg-blue-600 rounded-2xl p-5 flex items-center gap-4 shadow-md shadow-blue-600/20">
            <AlertCircle className="w-6 h-6 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm">
                {pendingQuotes.length === 1
                  ? "1 quote awaiting your signature"
                  : `${pendingQuotes.length} quotes awaiting your signature`}
              </p>
              <p className="text-blue-100 text-xs mt-0.5">Review and sign electronically below</p>
            </div>
          </div>
        )}

        {/* Quotes */}
        {quotes.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-500" />
              <h2 className="font-bold text-gray-900">Quotes</h2>
              <span className="ml-auto text-xs font-semibold text-gray-400">{quotes.length} total</span>
            </div>
            <div className="divide-y divide-gray-50">
              {quotes.map((q) => {
                const cfg = QUOTE_STATUS[q.status] ?? QUOTE_STATUS.draft;
                return (
                  <div key={q.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 text-sm">{q.quote_number}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{q.project_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-800">
                        ${q.total.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
                      </p>
                      {q.valid_until && (
                        <p className="text-xs text-gray-400">Until {new Date(q.valid_until).toLocaleDateString("en-CA")}</p>
                      )}
                    </div>
                    {(q.status === "sent" || q.status === "viewed") && (
                      <Link
                        href={`/q/${q.id}`}
                        className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-brand-700 transition-colors flex-shrink-0"
                      >
                        Review <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {q.status === "signed" && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Jobs */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-500" />
              <h2 className="font-bold text-gray-900">Your Jobs</h2>
              <span className="ml-auto text-xs font-semibold text-gray-400">{jobs.length} total</span>
            </div>
            <div className="divide-y divide-gray-50">
              {jobs.map((job) => {
                const cfg = JOB_STATUS[job.status] ?? JOB_STATUS.scheduled;
                return (
                  <div key={job.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        {job.description && <p className="text-xs text-gray-500 mb-1">{job.description}</p>}
                        {job.scheduled_date && (
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(job.scheduled_date).toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        )}
                      </div>
                      {job.total_value > 0 && (
                        <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                          ${job.total_value.toLocaleString("en-CA", { maximumFractionDigits: 0 })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Request Service */}
        <RequestServiceForm token={params.token} />

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-gray-500">Obrized</span> — Construction Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}

// Client-side request form (rendered as part of server page via static import trick)
function RequestServiceForm({ token }: { token: string }) {
  // This is intentionally a server component static section;
  // actual submission handled via a form POST to the API
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 mb-1">Request a New Service</h2>
      <p className="text-sm text-gray-500 mb-4">Tell us what you need and we will get back to you.</p>
      <form
        action={`/api/portal/${token}`}
        method="POST"
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const body = Object.fromEntries(new FormData(form));
          const res = await fetch(`/api/portal/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (res.ok) {
            alert("Service request sent! We will be in touch shortly.");
            form.reset();
          } else {
            alert("Failed to send request. Please try again.");
          }
        }}
      >
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">What do you need?</label>
          <input
            name="title" required type="text"
            placeholder="Bathroom renovation, Electrical inspection, Roof repair..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Additional details</label>
          <textarea
            name="description" rows={3}
            placeholder="Describe the scope of work, timeline, or any special requirements..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-colors"
        >
          Send Service Request
        </button>
      </form>
    </div>
  );
}
