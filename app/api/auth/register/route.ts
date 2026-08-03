import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email, password, name, company } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
    }

    const password_hash = await hash(password, 10);

    const { data: user, error } = await supabase
      .from("profiles")
      .insert({
        email,
        password_hash,
        name:     name    || "",
        company:  company || "",
        provider: "credentials",
        plan_name: "Free",
        subscription_status: "active",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, id: user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Erro ao criar conta" }, { status: 500 });
  }
}
