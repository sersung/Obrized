import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name, company } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres." }, { status: 400 });
  }

  const user = createUser(email, password, name, company ?? "");
  if (!user) {
    return NextResponse.json({ error: "Este e-mail já está em uso." }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
