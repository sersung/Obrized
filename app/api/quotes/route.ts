import { NextRequest, NextResponse } from "next/server";
import { getServerSession, authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("quotes")
    .select("id,quote_number,status,client_name,client_email,project_name,total,advance_percent,valid_until,signed_at,created_at")
    .eq("user_email", session.user.email)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Auto-generate quote number: Q-YYYY-NNN
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from("quotes")
    .select("*", { count: "exact", head: true })
    .eq("user_email", session.user.email);
  const seq = String((count ?? 0) + 1).padStart(3, "0");
  const quote_number = `Q-${year}-${seq}`;

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const { data, error } = await supabase
    .from("quotes")
    .insert({
      user_email: session.user.email,
      quote_number,
      status: body.status ?? "draft",
      provider_company: body.provider_company ?? "",
      provider_name: body.provider_name ?? "",
      provider_email: body.provider_email ?? "",
      provider_phone: body.provider_phone ?? "",
      provider_address: body.provider_address ?? "",
      provider_license: body.provider_license ?? "",
      provider_hst: body.provider_hst ?? "",
      client_name: body.client_name ?? "",
      client_company: body.client_company ?? "",
      client_email: body.client_email ?? "",
      client_phone: body.client_phone ?? "",
      client_address: body.client_address ?? "",
      project_name: body.project_name ?? "",
      project_address: body.project_address ?? "",
      project_description: body.project_description ?? "",
      valid_until: body.valid_until ?? validUntil.toISOString().split("T")[0],
      items: body.items ?? [],
      subtotal: body.subtotal ?? 0,
      tax_rate: body.tax_rate ?? 13,
      tax_amount: body.tax_amount ?? 0,
      total: body.total ?? 0,
      advance_percent: body.advance_percent ?? 20,
      payment_methods: body.payment_methods ?? ["e-transfer", "cheque"],
      payment_due_days: body.payment_due_days ?? 30,
      late_interest_rate: body.late_interest_rate ?? 2,
      include_collection_clause: body.include_collection_clause ?? true,
      include_lien_clause: body.include_lien_clause ?? true,
      custom_notes: body.custom_notes ?? "",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from("quotes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_email", session.user.email)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("id", id)
    .eq("user_email", session.user.email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
