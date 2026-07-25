"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message || "Erro ao criar conta.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Alguns setups exigem confirmação de email.
      // Se não exigir, já pode redirecionar.
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 min-h-screen">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-soft">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#59F7E2]/20 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-[#59F7E2]" />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Crie sua Conta</h1>
          <p className="text-slate-500 mt-2 text-center">
            Junte-se à Pokewiki hoje mesmo
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-sm font-medium text-center">
            Conta criada com sucesso! Redirecionando...
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-600">Nome</label>
            <input
              type="text"
              required
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ash Ketchum"
            />
          </div>

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
              minLength={6}
              className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#59F7E2] transition-shadow shadow-inner text-slate-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="mt-4 w-full py-4 bg-[#59F7E2] text-slate-800 font-bold rounded-2xl shadow-soft hover:shadow-soft-hover transition-all disabled:opacity-50 hover:-translate-y-1"
          >
            {loading ? "Criando..." : "Cadastrar"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-[#59F7E2] font-bold hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
