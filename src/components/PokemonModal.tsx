"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Star } from 'lucide-react';
import { tagImages } from '@/components/TagSelector';
import type { Pokemon } from '@/lib/pokemonService';
import { getPokemonDetailsAction } from '@/app/actions/dataActions';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPokemonName, translateHabitat, translateStat } from '@/lib/formatters';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import { translations } from '@/lib/translations';

interface PokeApiData {
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  types?: { type: { name: string } }[];
}

interface PokeApiSpecies {
  habitat: { name: string } | null;
  capture_rate: number;
  generation: { name: string };
  evolution_chain: { url: string } | null;
}

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
  onSelectPokemon?: (target: { name: string; imageUrl?: string }) => void;
}

const POKEAPI_TYPE_TO_TAG: Record<string, string> = {
  fire: 'Fogo', water: 'Água', electric: 'Elétrico', steel: 'Aço',
  fighting: 'Luta', psychic: 'Psíquico', dark: 'Escuridão', normal: 'Normal',
  dragon: 'Dragão', fairy: 'Fada', ice: 'Gelo', grass: 'Planta',
  poison: 'Venenoso', ground: 'Terra', flying: 'Voador', bug: 'Inseto',
  rock: 'Rocha', ghost: 'Fantasma'
};

export default function PokemonModal({ pokemon, onClose, onSelectPokemon }: PokemonModalProps) {
  const { language } = useLanguage();
  const tTypes = translations[language].pokemonTypes as Record<string, string>;
  const tGensShort = translations[language].pokemonGenerationsShort as Record<string, string>;
  const [apiData, setApiData] = useState<PokeApiData | null>(null);
  const [speciesData, setSpeciesData] = useState<PokeApiSpecies | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [evolutions, setEvolutions] = useState<{name: string, imageUrl: string}[]>([]);
  const [megaEvolutions, setMegaEvolutions] = useState<{name: string, imageUrl: string}[]>([]);
  const [loading, setLoading] = useState(true);

  const { translatedText: translatedDescription, loading: isTranslating } = useDynamicTranslation(pokemon.description || '');

  useEffect(() => {
    // Bloquear scroll do body enquanto o modal estiver aberto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        const details = await getPokemonDetailsAction(pokemon.name, pokemon.image_url);
        setApiData(details.apiData);
        setSpeciesData(details.speciesData);
        setEvolutions(details.evolutions);
        setMegaEvolutions(details.megaEvolutions);
      } catch (error) {
        console.error("Erro ao buscar dados adicionais na PokeAPI:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [pokemon.name, pokemon.image_url]);

  const baseImageUrl = pokemon.image_url || 'https://via.placeholder.com/400?text=Sem+Imagem';
  const imageUrl = isShiny ? baseImageUrl.replace('official-artwork/', 'official-artwork/shiny/') : baseImageUrl;
  
  const heightMeters = apiData ? (apiData.height / 10).toFixed(1) + ' m' : (loading ? '...' : (language === 'pt' ? 'Desconhecida' : 'Unknown'));
  const weightKg = apiData ? (apiData.weight / 10).toFixed(1) + ' kg' : (loading ? '...' : (language === 'pt' ? 'Desconhecido' : 'Unknown'));
  const habitat = speciesData?.habitat ? translateHabitat(speciesData.habitat.name, language) : (loading ? '...' : (language === 'pt' ? 'Desconhecido' : 'Unknown'));
  const captureRate = speciesData?.capture_rate ? Math.round((speciesData.capture_rate / 255) * 100) + '%' : (loading ? '...' : (language === 'pt' ? 'Desconhecida' : 'Unknown'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 animate-fade-in">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Container do Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-down z-10 border border-transparent dark:border-slate-800">
        
        {/* Header Fixo com Botão Fechar */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={onClose}
            className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 backdrop-blur rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center group"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Lado Esquerdo: Imagem e Informações Secundárias */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#59F7E2]/20 dark:from-[#59F7E2]/10 to-transparent opacity-50 pointer-events-none"></div>
              
              {/* Botão Shiny */}
              <button 
                onClick={() => setIsShiny(!isShiny)}
                className={`absolute top-6 left-6 z-20 p-2 transition-transform hover:scale-110 ${isShiny ? 'text-yellow-400 drop-shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-yellow-400'}`}
                title="Alternar Versão Shiny"
              >
                <Star className="w-8 h-8" />
              </button>
              
              <div className="relative w-full aspect-square flex items-center justify-center transition-transform duration-700 group-hover:scale-105 z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={pokemon.name}
                  className="object-contain w-full h-full drop-shadow-2xl"
                />
              </div>

              {/* Informações Secundárias (Grid e Habilidades) */}
              <div className="relative z-10 w-full flex flex-col gap-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">{language === 'pt' ? 'Altura' : 'Height'}</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{heightMeters}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">{language === 'pt' ? 'Peso' : 'Weight'}</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{weightKg}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Habitat</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200 capitalize">{habitat}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">{language === 'pt' ? 'Taxa de Captura' : 'Capture Rate'}</p>
                    <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{captureRate}</p>
                  </div>
                </div>

                {apiData && apiData.abilities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{language === 'pt' ? 'Habilidades' : 'Abilities'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {apiData.abilities.map((a, i) => (
                        <span 
                          key={i} 
                          className={`px-4 py-2 rounded-xl text-sm font-bold capitalize shadow-sm ${a.is_hidden ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700'}`}
                          title={a.is_hidden ? (language === 'pt' ? 'Habilidade Oculta' : 'Hidden Ability') : (language === 'pt' ? 'Habilidade Padrão' : 'Normal Ability')}
                        >
                          {a.ability.name.replace('-', ' ')}
                          {a.is_hidden && (language === 'pt' ? ' (Oculta)' : ' (Hidden)')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lado Direito: Informações Principais */}
            <div className="w-full lg:w-1/2 flex flex-col pt-4">
              
              <div className="mb-8">
                <h1 className="text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-4">
                  {formatPokemonName(pokemon.name, language)}
                </h1>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {((pokemon.type && pokemon.type.trim()) 
                    ? pokemon.type.split(',').map(t => t.trim())
                    : (apiData?.types?.map(t => POKEAPI_TYPE_TO_TAG[t.type.name] || t.type.name) || [])
                  ).map((tag, i) => {
                    const img = tagImages[tag];
                    return (
                      <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700" title={tTypes[tag] || tag}>
                        {img && <Image src={img} alt={tag} width={24} height={24} className="object-contain drop-shadow-sm" />}
                        <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">{tTypes[tag] || tag}</span>
                      </div>
                    );
                  })}
                </div>

                <p className={`text-lg text-slate-600 dark:text-slate-400 leading-relaxed ${isTranslating ? 'animate-pulse bg-slate-200 dark:bg-slate-700 h-24 rounded-xl' : ''}`}>
                  {!isTranslating && translatedDescription}
                </p>

                {speciesData?.generation && (
                  <div className="mt-4 mb-2">
                    <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-sm font-semibold border border-slate-200 dark:border-slate-700">
                      {tGensShort[speciesData.generation.name] || speciesData.generation.name}
                    </span>
                  </div>
                )}

                {evolutions.length > 1 && (
                  <div className="mt-4 mb-2">
                    <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">{language === 'pt' ? 'Evoluções' : 'Evolutions'}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {evolutions.map((evo, idx) => {
                        const currentSlug = pokemon.name.toLowerCase().replace(/\s+/g, '-');
                        const evoSlug = evo.name.toLowerCase().replace(/\s+/g, '-');
                        const isCurrent = currentSlug === evoSlug;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              if (!isCurrent && onSelectPokemon) {
                                onSelectPokemon(evo);
                              }
                            }}
                            className={`relative w-14 h-14 rounded-full shadow-sm border-2 flex items-center justify-center p-1 bg-white dark:bg-slate-900 transition-all ${
                              isCurrent 
                                ? 'border-[#59F7E2] ring-2 ring-[#59F7E2]/30 cursor-default' 
                                : 'border-slate-200 dark:border-slate-700 hover:border-[#59F7E2] dark:hover:border-[#59F7E2] hover:scale-110 cursor-pointer'
                            }`}
                            title={formatPokemonName(evo.name, language)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={evo.imageUrl} alt={evo.name} className="object-contain w-full h-full drop-shadow-sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {megaEvolutions.length > 0 && (
                  <div className="mt-4 mb-2">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{language === 'pt' ? 'Mega Evoluções' : 'Mega Evolutions'}</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {megaEvolutions.map((mega, idx) => {
                        const currentSlug = pokemon.name.toLowerCase().replace(/\s+/g, '-');
                        const megaSlug = mega.name.toLowerCase().replace(/\s+/g, '-');
                        const isCurrent = currentSlug === megaSlug;
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              if (!isCurrent && onSelectPokemon) {
                                onSelectPokemon(mega);
                              }
                            }}
                            className={`relative w-16 h-16 rounded-full shadow-sm border-2 flex items-center justify-center p-1 bg-white dark:bg-slate-900 transition-all ${
                              isCurrent
                                ? 'border-amber-400 ring-2 ring-amber-400/30 cursor-default'
                                : 'border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:ring-2 hover:ring-amber-400/30 hover:scale-110 cursor-pointer'
                            }`}
                            title={formatPokemonName(mega.name, language)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={mega.imageUrl} alt={mega.name} className="object-contain w-full h-full drop-shadow-sm" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Base Stats */}
              {apiData && apiData.stats.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{language === 'pt' ? 'Atributos Base' : 'Base Stats'}</h3>
                  <div className="flex flex-col gap-3">
                    {apiData.stats.map((stat, i) => {
                      const statName = translateStat(stat.stat.name, language);
                      const percentage = Math.min((stat.base_stat / 255) * 100, 100);
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <span className="w-28 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{statName}</span>
                          <span className="w-8 text-sm font-bold text-slate-700 dark:text-slate-200 text-right">{stat.base_stat}</span>
                          <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out" 
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: percentage < 30 ? '#ff6b6b' : percentage < 60 ? '#feca57' : '#1dd1a1'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fraquezas */}
              {pokemon.weaknesses && pokemon.weaknesses.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{language === 'pt' ? 'Fraquezas' : 'Weaknesses'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.weaknesses.map((weakness, i) => {
                      const img = tagImages[weakness];
                      return (
                        <div key={i} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700" title={tTypes[weakness] || weakness}>
                          {img && <Image src={img} alt={weakness} width={24} height={24} className="object-contain drop-shadow-sm" />}
                          <span className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-xs">{tTypes[weakness] || weakness}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
