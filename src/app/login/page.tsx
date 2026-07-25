"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Traduzir alguns erros comuns do Supabase ou mostrar a mensagem original
      let errorMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Por favor, confirme seu email antes de fazer login. (Ou desative a confirmação de email no painel do Supabase)";
      }
      
      setError(errorMessage);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-soft">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#59F7E2]/20 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-[#59F7E2]" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Bem-vindo de volta!</h1>
          <p className="text-slate-500 mt-2 text-center">
            Faça login para gerenciar a Pokédex
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              required
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Senha</label>
            <input
              type="password"
              required
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-4 bg-[#59F7E2] text-slate-800 font-bold rounded-2xl shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 hover:-translate-y-1"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Ainda não tem uma conta?{" "}
          <Link href="/cadastro" className="text-[#59F7E2] font-bold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
