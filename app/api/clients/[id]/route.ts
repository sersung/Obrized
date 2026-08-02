import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession, authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("user_email", session.user.email)
    .single();

  if (error || !client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Auto-generate portal token if missing
  if (!(client as any).portal_token) {
    const portal_token = crypto.randomBytes(20).toString("hex");
    await supabase.from("clients").update({ portal_token }).eq("id", id);
    (client as any).portal_token = portal_token;
  }

  const [{ data: quotes }, { data: jobs }] = await Promise.all([
    supabase
      .from("quotes")
      .select("id,quote_number,status,total,project_name,created_at")
      .eq("user_email", session.user.email)
      .eq("client_email", (client as any).email),
    supabase
      .from("jobs")
      .select("*")
      .eq("user_email", session.user.email)
      .eq("client_id", id),
  ]);

  return NextResponse.json({ ...client, quotes: quotes ?? [], jobs: jobs ?? [] });
}
