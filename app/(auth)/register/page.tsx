"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, HardHat, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", company: "", email: "", password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Erro ao criar conta");
      setLoading(false);
      return;
    }

    // Auto-login after registration
    await signIn("credentials", {
      email:    form.email,
      password: form.password,
      redirect: false,
    });

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-50 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/25">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Criar Conta</h1>
            <p className="text-xs text-gray-400 font-semibold mt-1">Obrized — Construção Inteligente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600">Nome</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="João Silva"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-600">Empresa</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                placeholder="Silva Construções"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Senha</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all duration-200 shadow-md shadow-brand-600/10 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>

          <p className="text-center text-xs text-gray-500">
            Já tem conta?{" "}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
