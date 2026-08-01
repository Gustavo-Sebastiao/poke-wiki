"use client";

import { useEffect, useState } from "react";
import type { Pokemon } from "@/lib/pokemonService";
import { deletePokemonAction, getAdminPokemonsAction } from "@/app/actions/pokemonActions";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { role, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && role !== 'admin' && role !== 'superadmin') {
      router.push("/login");
    }
  }, [role, authLoading, router]);

  useEffect(() => {
    if (session?.access_token && (role === 'admin' || role === 'superadmin')) {
      const fetchPokemons = async () => {
        try {
          const result = await getAdminPokemonsAction(session.access_token);
          if (!result.success) throw new Error(result.message);
          setPokemons(result.data ?? []);
        } catch (error) {
          console.error("Erro ao carregar pokémons", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPokemons();
    }
  }, [session?.access_token, role]);

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este Pokémon?")) {
      try {
        const result = await deletePokemonAction(session!.access_token, id);
        if (!result.success) throw new Error(result.message);
        setPokemons(pokemons.filter((p) => p.id !== id));
      } catch (error) {
        console.error("Erro ao excluir", error);
        alert("Não foi possível excluir o Pokémon.");
      }
    }
  };

  if (authLoading || (role !== 'admin' && role !== 'superadmin')) {
    return <div className="p-8 text-center text-slate-500">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Painel de Controle</h1>
          <p className="text-slate-500 mt-2">Gerencie os Pokémons cadastrados.</p>
        </div>
        <Link 
          href="/admin/novo"
          className="flex items-center gap-2 px-6 py-3 bg-[#59F7E2] text-slate-800 font-bold rounded-2xl shadow-soft hover:shadow-soft-hover transition-all hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          Anexar Pokémon
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Carregando lista...</div>
        ) : pokemons.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Nenhum Pokémon cadastrado.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 font-medium text-slate-500">Pokémon</th>
                <th className="px-6 py-4 font-medium text-slate-500">Tipo</th>
                <th className="px-6 py-4 font-medium text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pokemons.map((pokemon) => (
                <tr key={pokemon.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    <div className="flex items-center gap-3">
                      {pokemon.image_url ? (
                        <img src={pokemon.image_url} alt={pokemon.name} className="w-10 h-10 object-contain drop-shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      )}
                      {pokemon.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{pokemon.type}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={`/admin/editar/${pokemon.id}`}
                        className="p-2 text-slate-400 hover:text-[#59F7E2] transition-colors rounded-xl hover:bg-[#59F7E2]/10"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        onClick={() => pokemon.id && handleDelete(pokemon.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
