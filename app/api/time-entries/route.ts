import { NextRequest, NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobId = new URL(req.url).searchParams.get("job_id");
  let query = supabase.from("time_entries").select("*").eq("user_email", session.user.email);
  if (jobId) query = query.eq("job_id", jobId);
  const { data, error } = await query.order("work_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("time_entries")
    .insert({ ...body, user_email: session.user.email })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update job actual_hours
  const { data: entries } = await supabase
    .from("time_entries")
    .select("hours")
    .eq("job_id", body.job_id)
    .eq("user_email", session.user.email);

  const totalHours = (entries ?? []).reduce((s: number, e: any) => s + (e.hours ?? 0), 0);
  await supabase.from("jobs").update({ actual_hours: totalHours }).eq("id", body.job_id).eq("user_email", session.user.email);

  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, job_id } = await req.json();
  const { error } = await supabase
    .from("time_entries")
    .delete()
    .eq("id", id)
    .eq("user_email", session.user.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Recalculate actual_hours
  if (job_id) {
    const { data: entries } = await supabase
      .from("time_entries")
      .select("hours")
      .eq("job_id", job_id)
      .eq("user_email", session.user.email);
    const totalHours = (entries ?? []).reduce((s: number, e: any) => s + (e.hours ?? 0), 0);
    await supabase.from("jobs").update({ actual_hours: totalHours }).eq("id", job_id).eq("user_email", session.user.email);
  }

  return NextResponse.json({ success: true });
}
