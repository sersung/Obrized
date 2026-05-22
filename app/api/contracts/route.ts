import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const { data, error } = await supabase
    .from("contracts")
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
    .from("contracts")
    .insert({
      user_email: email,
      name: body.name,
      contract_type: body.contract_type,
      counterparty: body.counterparty ?? "",
      value: body.value ?? 0,
      overall_risk: body.overall_risk,
      clauses_count: body.clauses_count,
      analysis: body.analysis,
      status: "analyzed",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
