"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import { Pokemon, deletePokemon } from '@/lib/pokemonService';
import { useAdmin } from '@/lib/useAdmin';

export default function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Placeholder caso não tenha imagem
  const imageUrl = pokemon.image_url || 'https://via.placeholder.com/150?text=Sem+Imagem';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Tem certeza que deseja excluir o ${pokemon.name}?`)) {
      setIsDeleting(true);
      try {
        await deletePokemon(pokemon.id!);
        router.refresh();
      } catch (error) {
        console.error("Erro ao deletar", error);
        alert("Erro ao excluir o Pokémon.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={`group relative flex flex-col bg-white rounded-3xl p-6 border border-slate-100 hover:border-slate-300 transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Botões de Ação Absolutos (Apenas Admin) */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <Link 
            href={`/admin/${pokemon.id}`}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
            title="Editar Pokémon"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button 
            onClick={handleDelete}
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
            title="Excluir Pokémon"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="relative w-full aspect-square mb-4 bg-transparent rounded-2xl flex items-center justify-center overflow-hidden">
        {/* Usando a imagem com o next/image pode dar erro se o domínio não estiver configurado, então usamos a tag <img> ou um container */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={pokemon.name}
          className="object-contain w-3/4 h-3/4 transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {pokemon.type}
        </span>
        <h3 className="text-lg font-bold text-slate-800">{pokemon.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
          {pokemon.description}
        </p>
      </div>
      
      {pokemon.weaknesses && pokemon.weaknesses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 mb-2">Fraquezas</p>
          <div className="flex flex-wrap gap-2">
            {pokemon.weaknesses.map((weakness, i) => (
              <span
                key={i}
                className="px-2 py-1 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-lg"
              >
                {weakness}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
