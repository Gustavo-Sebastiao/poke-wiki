"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import { Pokemon, deletePokemon } from '@/lib/pokemonService';
import { useAuth } from '@/contexts/AuthContext';
import { tagImages } from '@/components/TagSelector';

export default function PokemonCard({ 
  pokemon, 
  onSelect 
}: { 
  pokemon: Pokemon;
  onSelect?: (pokemon: Pokemon) => void;
}) {
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'superadmin';
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
    <div 
      onClick={() => onSelect ? onSelect(pokemon) : router.push(`/pokemon/${pokemon.id}`)}
      className={`group relative flex flex-col bg-white rounded-3xl p-6 border border-slate-100 hover:border-slate-300 hover:shadow-lg cursor-pointer transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      
      {/* Tipos no Canto Superior Esquerdo */}
      {pokemon.type && (
        <div className="absolute top-4 left-4 z-10 flex gap-1">
          {pokemon.type.split(',').map((t, i) => {
            const tag = t.trim();
            const img = tagImages[tag];
            if (!img) return null;
            return (
              <div key={i} className="relative w-8 h-8 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden" title={tag}>
                <Image src={img} alt={tag} fill className="object-cover scale-110 drop-shadow-sm" />
              </div>
            );
          })}
        </div>
      )}

      {/* Botões de Ação Absolutos (Apenas Admin) */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all">
          <Link 
            href={`/admin/editar/${pokemon.id}`}
            onClick={(e) => e.stopPropagation()}
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
      <div className="flex flex-col gap-1 mt-2">
        <h3 className="text-lg font-bold text-slate-800">{pokemon.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mt-1">
          {pokemon.description}
        </p>
      </div>
      

    </div>
  );
}
