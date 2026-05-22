import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const { data, error } = await supabase
    .from("safety_reports")
    .select("*")
    .eq("user_email", email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const body = await req.json();
  const { data, error } = await supabase
    .from("safety_reports")
    .insert({
      user_email: email,
      project_name: body.project_name,
      report_type: body.report_type,
      raw_transcript: body.raw_transcript,
      report: body.report,
      report_date: body.report_date ?? new Date().toISOString().split("T")[0],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
