"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, HardHat, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Email ou senha inválidos.");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleDemo() {
    setLoading(true);
    await signIn("credentials", {
      email:    "john.carter@jcconstruction.ca",
      password: "password123",
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Entrar no Obrized</h1>
            <p className="text-xs text-gray-400 font-semibold mt-1">Construção Inteligente</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-600">Senha</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition pr-10"
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
            <LogIn className="w-4 h-4" />
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-xs text-gray-500">
            Não tem conta?{" "}
            <Link href="/register" className="text-brand-600 font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </form>

        {/* Demo banner */}
        <div className="px-8 pb-7">
          <div className="bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-brand-850">Modo Demo</p>
              <p className="text-[10px] text-brand-600 font-semibold mt-0.5">
                Teste todas as funcionalidades com um clique
              </p>
            </div>
            <button
              onClick={handleDemo}
              disabled={loading}
              className="text-[10px] font-bold uppercase tracking-wide text-brand-700 bg-white border border-brand-200 px-3.5 py-1.5 rounded-lg hover:bg-brand-100 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <LogIn className="w-3 h-3" />
              Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
