import { NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = session.user.email;

  const [
    { data: invoices },
    { data: quotes },
    { data: jobs },
    { data: clients },
  ] = await Promise.all([
    supabase.from("invoices").select("total,status,created_at,project_name").eq("user_email", email),
    supabase.from("quotes").select("total,status,created_at,client_name").eq("user_email", email),
    supabase.from("jobs").select("total_value,status,actual_hours,estimated_hours,client_name,created_at").eq("user_email", email),
    supabase.from("clients").select("id,name,company").eq("user_email", email),
  ]) as [
    { data: any[] | null },
    { data: any[] | null },
    { data: any[] | null },
    { data: any[] | null },
  ];

  // Monthly revenue — last 6 months from invoices (paid + submitted)
  const now = new Date();
  const monthlyRevenue: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenue[key] = 0;
  }
  for (const inv of invoices ?? []) {
    const key = inv.created_at?.slice(0, 7);
    if (key && key in monthlyRevenue && (inv.status === "paid" || inv.status === "submitted" || inv.status === "certified")) {
      monthlyRevenue[key] += inv.total ?? 0;
    }
  }
  const revenueChart = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month: new Date(month + "-01").toLocaleDateString("en-CA", { month: "short", year: "2-digit" }),
    revenue: Math.round(revenue),
  }));

  // Quote pipeline
  const quotePipeline = {
    draft:    (quotes ?? []).filter((q) => q.status === "draft").length,
    sent:     (quotes ?? []).filter((q) => q.status === "sent").length,
    viewed:   (quotes ?? []).filter((q) => q.status === "viewed").length,
    signed:   (quotes ?? []).filter((q) => q.status === "signed").length,
    declined: (quotes ?? []).filter((q) => q.status === "declined").length,
  };
  const quoteConversionRate = (quotes ?? []).length > 0
    ? Math.round((quotePipeline.signed / (quotes ?? []).length) * 100)
    : 0;
  const totalQuoteValue = (quotes ?? [])
    .filter((q) => q.status === "signed")
    .reduce((s, q) => s + (q.total ?? 0), 0);

  // Job status breakdown
  const jobStatus = {
    scheduled:   (jobs ?? []).filter((j) => j.status === "scheduled").length,
    in_progress: (jobs ?? []).filter((j) => j.status === "in_progress").length,
    completed:   (jobs ?? []).filter((j) => j.status === "completed").length,
    cancelled:   (jobs ?? []).filter((j) => j.status === "cancelled").length,
  };

  // Job costing: budget vs actual hours
  const completedJobs = (jobs ?? []).filter((j) => j.status === "completed" && j.estimated_hours > 0);
  const avgEfficiency = completedJobs.length > 0
    ? completedJobs.reduce((s, j) => s + (j.actual_hours / j.estimated_hours), 0) / completedJobs.length
    : null;

  // Top clients by quote value
  const clientValueMap: Record<string, number> = {};
  for (const q of quotes ?? []) {
    const key = q.client_name || "Unknown";
    clientValueMap[key] = (clientValueMap[key] ?? 0) + (q.total ?? 0);
  }
  const topClients = Object.entries(clientValueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value: Math.round(value) }));

  // Summary stats
  const totalRevenue = (invoices ?? [])
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.total ?? 0), 0);
  const totalAR = (invoices ?? [])
    .filter((i) => i.status === "submitted" || i.status === "certified")
    .reduce((s, i) => s + (i.total ?? 0), 0);

  return NextResponse.json({
    summary: {
      total_revenue: Math.round(totalRevenue),
      accounts_receivable: Math.round(totalAR),
      total_clients: (clients ?? []).length,
      quote_conversion_rate: quoteConversionRate,
      total_quote_value_signed: Math.round(totalQuoteValue),
      avg_job_efficiency: avgEfficiency ? Math.round(avgEfficiency * 100) : null,
    },
    revenue_chart: revenueChart,
    quote_pipeline: quotePipeline,
    job_status: jobStatus,
    top_clients: topClients,
  });
}
