import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const { data, error } = await supabase
    .from("invoices")
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
  const today = new Date().toISOString().split("T")[0];
  const due = new Date(Date.now() + 28 * 86400000).toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      user_email: email,
      invoice_number: body.invoice_number,
      project_name: body.project_name,
      province: body.province,
      items: body.items,
      subtotal: body.subtotal,
      total: body.total,
      status: "submitted",
      is_proper: body.is_proper ?? false,
      submitted_at: today,
      due_date: due,
      wsib_uploaded: body.wsib_uploaded ?? false,
      lien_waiver_uploaded: body.lien_waiver_uploaded ?? false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .eq("user_email", email)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
