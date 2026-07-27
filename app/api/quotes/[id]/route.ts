import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Public endpoint — no auth required (quote ID is the access token)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  // Mark as viewed if currently sent
  if (data.status === "sent") {
    await supabase
      .from("quotes")
      .update({ status: "viewed", updated_at: new Date().toISOString() })
      .eq("id", params.id);
    data.status = "viewed";
  }

  return NextResponse.json(data);
}

// Client signing endpoint
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { action, signed_by, signature_data } = body;

  if (action === "sign") {
    if (!signed_by || !signature_data) {
      return NextResponse.json({ error: "Missing signature data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("quotes")
      .update({
        status: "signed",
        signed_at: new Date().toISOString(),
        signed_by,
        signature_data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
