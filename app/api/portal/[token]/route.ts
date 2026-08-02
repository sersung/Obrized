import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Invalid token" }, { status: 400 });

  // Find client by portal_token
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("portal_token", token)
    .single();

  if (error || !client) return NextResponse.json({ error: "Portal not found" }, { status: 404 });

  const ownerEmail = (client as any).user_email;

  // Fetch all data linked to this client
  const [{ data: quotes }, { data: jobs }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id,quote_number,status,total,project_name,valid_until,created_at")
      .eq("user_email", ownerEmail)
      .eq("client_email", (client as any).email)
      .order("created_at", { ascending: false }),
    supabase
      .from("jobs")
      .select("id,title,status,scheduled_date,total_value,address,description")
      .eq("user_email", ownerEmail)
      .eq("client_id", (client as any).id)
      .order("created_at", { ascending: false }),
  ]);

  // Get provider company info from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name,company")
    .eq("email", ownerEmail)
    .single();

  return NextResponse.json({
    client,
    provider: profile ?? { name: "", company: "" },
    quotes: quotes ?? [],
    jobs: jobs ?? [],
  });
}

// POST: client requests a new service via the portal
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();

  const { data: client, error } = await supabase
    .from("clients")
    .select("id,user_email,name,company")
    .eq("portal_token", token)
    .single();

  if (error || !client) return NextResponse.json({ error: "Portal not found" }, { status: 404 });

  const { data, err } = await (supabase
    .from("jobs")
    .insert({
      user_email: (client as any).user_email,
      client_id:   (client as any).id,
      client_name: (client as any).name || (client as any).company,
      title:       body.title ?? "Service Request",
      description: body.description ?? "",
      status:      "scheduled",
      priority:    "normal",
      notes:       `Requested by client via portal on ${new Date().toLocaleDateString("en-CA")}`,
    })
    .select()
    .single() as any);

  if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  return NextResponse.json({ success: true, job: data });
}
