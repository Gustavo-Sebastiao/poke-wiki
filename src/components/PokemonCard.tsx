"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Edit2, Trash2 } from 'lucide-react';
import type { Pokemon } from '@/lib/pokemonService';
import { deletePokemonAction } from '@/app/actions/pokemonActions';
import { useAuth } from '@/contexts/AuthContext';
import { tagImages } from '@/components/TagSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPokemonName } from '@/lib/formatters';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { translations } from '@/lib/translations';

export default function PokemonCard({ 
  pokemon, 
  onSelect 
}: { 
  pokemon: Pokemon;
  onSelect?: (pokemon: Pokemon) => void;
}) {
  const { role, session } = useAuth();
  const isAdmin = role === 'admin' || role === 'superadmin';
  const router = useRouter();
  const { language } = useLanguage();
  const tTypes = translations[language].pokemonTypes as Record<string, string>;
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { translatedText: translatedDescription, loading: isTranslating } = useDynamicTranslation(pokemon.description || '');

  // Placeholder caso não tenha imagem
  const imageUrl = pokemon.image_url || 'https://via.placeholder.com/150?text=Sem+Imagem';

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(`Tem certeza que deseja excluir o ${pokemon.name}?`)) {
      setIsDeleting(true);
      try {
        const result = await deletePokemonAction(session?.access_token ?? '', pokemon.id!);
        if (!result.success) throw new Error(result.message);
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
      className={`group relative flex flex-col bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-lg cursor-pointer transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      
      {/* Tipos no Canto Superior Esquerdo */}
      {pokemon.type && (
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex gap-1">
          {pokemon.type.split(',').map((t, i) => {
            const tag = t.trim();
            const img = tagImages[tag];
            return (
              <div key={i} className="relative w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden" title={tTypes[tag] || tag}>
                <Image src={img} alt={tag} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover scale-110 drop-shadow-sm" />
              </div>
            );
          })}
        </div>
      )}

      {/* Botões de Ação Absolutos (Apenas Admin) */}
      {isAdmin && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-col gap-2 transition-all">
          <Link 
            href={`/admin/editar/${pokemon.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-100 dark:border-slate-700 shadow-sm text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
            title="Editar Pokémon"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <button 
            onClick={handleDelete}
            className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-full border border-slate-100 dark:border-slate-700 shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
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
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatPokemonName(pokemon.name, language)}</h3>
        <p className={`text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 ${isTranslating ? 'animate-pulse bg-slate-200 dark:bg-slate-700 h-10 rounded' : ''}`}>
          {!isTranslating && translatedDescription}
        </p>
      </div>
      

    </div>
  );
}
