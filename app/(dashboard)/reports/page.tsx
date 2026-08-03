"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  TrendingUp, DollarSign, Users, FileText,
  CheckCircle2, Clock, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReportData {
  summary: {
    total_revenue: number;
    accounts_receivable: number;
    total_clients: number;
    quote_conversion_rate: number;
    total_quote_value_signed: number;
    avg_job_efficiency: number | null;
  };
  revenue_chart: Array<{ month: string; revenue: number }>;
  quote_pipeline: { draft: number; sent: number; viewed: number; signed: number; declined: number };
  job_status: { scheduled: number; in_progress: number; completed: number; cancelled: number };
  top_clients: Array<{ name: string; value: number }>;
}

const JOB_COLORS = ["#2563eb", "#f59e0b", "#10b981", "#6b7280"];
const QUOTE_COLORS = ["#94a3b8", "#2563eb", "#7c3aed", "#10b981", "#ef4444"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n);

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { toast.error("Failed to load reports"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, revenue_chart, quote_pipeline, job_status, top_clients } = data;

  const jobPieData = [
    { name: "Scheduled",   value: job_status.scheduled },
    { name: "In Progress", value: job_status.in_progress },
    { name: "Completed",   value: job_status.completed },
    { name: "Cancelled",   value: job_status.cancelled },
  ].filter((d) => d.value > 0);

  const quotePipelineData = [
    { stage: "Draft",    count: quote_pipeline.draft    },
    { stage: "Sent",     count: quote_pipeline.sent     },
    { stage: "Viewed",   count: quote_pipeline.viewed   },
    { stage: "Signed",   count: quote_pipeline.signed   },
    { stage: "Declined", count: quote_pipeline.declined },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Business analytics and profitability</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Revenue (Paid)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{fmt(summary.total_revenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Receivable</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-600">{fmt(summary.accounts_receivable)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Quote Win Rate</span>
            <TrendingUp className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-brand-600">{summary.quote_conversion_rate}%</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">Clients</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{summary.total_clients}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-brand-500" /> Revenue — Last 6 Months
        </h2>
        {revenue_chart.every((m) => m.revenue === 0) ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            No invoiced revenue yet — create and submit invoices to see data here.
          </div>
        ) : (
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_chart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [fmt(v), "Revenue"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Job Status Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Job Status Breakdown</h2>
          {jobPieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No jobs yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={jobPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {jobPieData.map((_, i) => <Cell key={i} fill={JOB_COLORS[i % JOB_COLORS.length]} />)}
                  </Pie>
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>}
                  />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quote Pipeline */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Quote Pipeline</h2>
          {quotePipelineData.every((d) => d.count === 0) ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No quotes yet</div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quotePipelineData} layout="vertical" margin={{ top: 0, right: 24, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {quotePipelineData.map((_, i) => <Cell key={i} fill={QUOTE_COLORS[i % QUOTE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Clients */}
      {top_clients.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" /> Top Clients by Quote Value
          </h2>
          <div className="space-y-3">
            {top_clients.map((client, i) => {
              const maxVal = top_clients[0].value;
              const pct = Math.round((client.value / maxVal) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-600/10 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                      <p className="text-sm font-bold text-gray-700 ml-3">{fmt(client.value)}</p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Job efficiency */}
      {summary.avg_job_efficiency !== null && (
        <div className={cn(
          "rounded-2xl border p-5",
          summary.avg_job_efficiency >= 100 ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
        )}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className={cn("w-5 h-5", summary.avg_job_efficiency >= 100 ? "text-emerald-600" : "text-amber-600")} />
            <div>
              <p className="font-bold text-gray-900">Average Job Efficiency: {summary.avg_job_efficiency}%</p>
              <p className="text-sm text-gray-600 mt-0.5">
                {summary.avg_job_efficiency >= 100
                  ? "Jobs are completing under estimated hours — great efficiency!"
                  : "Jobs are running over estimated hours — consider adjusting estimates or crew size."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
