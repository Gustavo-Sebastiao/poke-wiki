"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { tagImages } from '@/components/TagSelector';
import { Pokemon } from '@/lib/pokemonService';

interface PokeApiData {
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface PokeApiSpecies {
  habitat: { name: string } | null;
  capture_rate: number;
  generation: { name: string };
  evolution_chain: { url: string } | null;
}

const GENERATION_NAMES: Record<string, string> = {
  'generation-i': '1ª Geração',
  'generation-ii': '2ª Geração',
  'generation-iii': '3ª Geração',
  'generation-iv': '4ª Geração',
  'generation-v': '5ª Geração',
  'generation-vi': '6ª Geração',
  'generation-vii': '7ª Geração',
  'generation-viii': '8ª Geração',
  'generation-ix': '9ª Geração'
};

const TYPE_TRANSLATIONS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Especial',
  'special-defense': 'Def. Especial',
  speed: 'Velocidade'
};

const HABITAT_TRANSLATIONS: Record<string, string> = {
  cave: 'Caverna',
  forest: 'Floresta',
  grassland: 'Campos',
  mountain: 'Montanha',
  rare: 'Raro',
  'rough-terrain': 'Terreno Acidentado',
  sea: 'Mar',
  urban: 'Urbano',
  'waters-edge': 'Beira D\'água'
};

interface PokemonModalProps {
  pokemon: Pokemon;
  onClose: () => void;
}

export default function PokemonModal({ pokemon, onClose }: PokemonModalProps) {
  const [apiData, setApiData] = useState<PokeApiData | null>(null);
  const [speciesData, setSpeciesData] = useState<PokeApiSpecies | null>(null);
  const [evolutions, setEvolutions] = useState<{name: string, imageUrl: string}[]>([]);
  const [megaEvolutions, setMegaEvolutions] = useState<{name: string, imageUrl: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bloquear scroll do body enquanto o modal estiver aberto
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchApiData = async () => {
      setLoading(true);
      try {
        let fetchIdentifier = pokemon.name.toLowerCase().replace(/\s+/g, '-');
        if (pokemon.image_url) {
          const matches = pokemon.image_url.match(/\/(\d+)\.(png|jpg|jpeg|gif)$/i);
          if (matches && matches[1]) {
            fetchIdentifier = matches[1];
          }
        }
        
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${fetchIdentifier}`);
        if (pokemonRes.ok) {
          const pData = await pokemonRes.json();
          setApiData(pData);
          
          if (pData.species?.url) {
            const speciesRes = await fetch(pData.species.url);
            if (speciesRes.ok) {
              const sData = await speciesRes.json();
              setSpeciesData(sData);

              if (sData.varieties) {
                const megas = sData.varieties
                  .filter((v: any) => v.pokemon.name.includes('-mega') || v.pokemon.name.includes('-primal'))
                  .map((v: any) => {
                    const url = v.pokemon.url;
                    const matches = url.match(/\/(\d+)\/$/);
                    const id = matches ? matches[1] : null;
                    return {
                      name: v.pokemon.name,
                      imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
                    };
                  });
                setMegaEvolutions(megas);
              }

              if (sData.evolution_chain?.url) {
                try {
                  const evoRes = await fetch(sData.evolution_chain.url);
                  if (evoRes.ok) {
                    const evoData = await evoRes.json();
                    const evos: { name: string, imageUrl: string }[] = [];
                    
                    const parseNode = (node: any) => {
                      const speciesUrl = node.species.url;
                      const matches = speciesUrl.match(/\/(\d+)\/$/);
                      const id = matches ? matches[1] : null;
                      
                      if (id) {
                        evos.push({
                          name: node.species.name,
                          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
                        });
                      }
                      
                      if (node.evolves_to && node.evolves_to.length > 0) {
                        node.evolves_to.forEach((child: any) => parseNode(child));
                      }
                    };
                    
                    parseNode(evoData.chain);
                    setEvolutions(evos);
                  }
                } catch (e) {
                  console.error("Erro ao buscar evoluções:", e);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados adicionais na PokeAPI:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApiData();
  }, [pokemon.name]);

  const imageUrl = pokemon.image_url || 'https://via.placeholder.com/400?text=Sem+Imagem';
  
  const heightMeters = apiData ? (apiData.height / 10).toFixed(1) + ' m' : (loading ? '...' : 'Desconhecida');
  const weightKg = apiData ? (apiData.weight / 10).toFixed(1) + ' kg' : (loading ? '...' : 'Desconhecido');
  const habitat = speciesData?.habitat ? (HABITAT_TRANSLATIONS[speciesData.habitat.name] || speciesData.habitat.name) : (loading ? '...' : 'Desconhecido');
  const captureRate = speciesData?.capture_rate ? Math.round((speciesData.capture_rate / 255) * 100) + '%' : (loading ? '...' : 'Desconhecida');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 animate-fade-in">
      {/* Overlay Escuro */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Container do Modal */}
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-down z-10">
        
        {/* Header Fixo com Botão Fechar */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={onClose}
            className="p-3 bg-white/80 hover:bg-white backdrop-blur rounded-full text-slate-500 hover:text-slate-800 transition-colors shadow-sm border border-slate-200 flex items-center justify-center group"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar">
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            
            {/* Lado Esquerdo: Imagem e Informações Secundárias */}
            <div className="w-full lg:w-1/2 flex flex-col gap-8 bg-slate-50 rounded-[2.5rem] p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#59F7E2]/20 to-transparent opacity-50 pointer-events-none"></div>
              
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
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Altura</p>
                    <p className="text-lg font-bold text-slate-700">{heightMeters}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Peso</p>
                    <p className="text-lg font-bold text-slate-700">{weightKg}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Habitat</p>
                    <p className="text-lg font-bold text-slate-700 capitalize">{habitat}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Taxa de Captura</p>
                    <p className="text-lg font-bold text-slate-700">{captureRate}</p>
                  </div>
                </div>

                {apiData && apiData.abilities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-4">Habilidades</h3>
                    <div className="flex flex-wrap gap-2">
                      {apiData.abilities.map((a, i) => (
                        <span 
                          key={i} 
                          className={`px-4 py-2 rounded-xl text-sm font-bold capitalize shadow-sm ${a.is_hidden ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 border border-slate-100'}`}
                          title={a.is_hidden ? 'Habilidade Oculta' : 'Habilidade Padrão'}
                        >
                          {a.ability.name.replace('-', ' ')}
                          {a.is_hidden && ' (Oculta)'}
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
                <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
                  {pokemon.name}
                </h1>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {pokemon.type && pokemon.type.split(',').map((t, i) => {
                    const tag = t.trim();
                    const img = tagImages[tag];
                    return (
                      <div key={i} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200" title={tag}>
                        {img && <Image src={img} alt={tag} width={24} height={24} className="object-contain drop-shadow-sm" />}
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">{tag}</span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-lg text-slate-600 leading-relaxed">
                  {pokemon.description}
                </p>

                {speciesData?.generation && (
                  <div className="mt-4 mb-2">
                    <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-semibold border border-slate-200">
                      {GENERATION_NAMES[speciesData.generation.name] || speciesData.generation.name}
                    </span>
                  </div>
                )}

                {evolutions.length > 1 && (
                  <div className="mt-4 mb-2">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Evoluções</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {evolutions.map((evo, idx) => (
                        <div 
                          key={idx} 
                          className={`relative w-14 h-14 rounded-full shadow-sm border-2 flex items-center justify-center p-1 bg-white ${evo.name.toLowerCase() === pokemon.name.toLowerCase().replace(/\s+/g, '-') ? 'border-[#59F7E2] ring-2 ring-[#59F7E2]/30' : 'border-slate-200'}`}
                          title={evo.name.charAt(0).toUpperCase() + evo.name.slice(1)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={evo.imageUrl} alt={evo.name} className="object-contain w-full h-full drop-shadow-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {megaEvolutions.length > 0 && (
                  <div className="mt-4 mb-2">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Mega Evoluções</h4>
                    <div className="flex flex-wrap items-center gap-3">
                      {megaEvolutions.map((mega, idx) => (
                        <div 
                          key={idx} 
                          className="relative w-16 h-16 rounded-full shadow-sm border-2 border-slate-200 flex items-center justify-center p-1 bg-white hover:border-amber-400 hover:ring-2 hover:ring-amber-400/30 transition-all cursor-pointer"
                          title={mega.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={mega.imageUrl} alt={mega.name} className="object-contain w-full h-full drop-shadow-sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Base Stats */}
              {apiData && apiData.stats.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Atributos Base</h3>
                  <div className="flex flex-col gap-3">
                    {apiData.stats.map((stat, i) => {
                      const statName = TYPE_TRANSLATIONS[stat.stat.name] || stat.stat.name;
                      const percentage = Math.min((stat.base_stat / 255) * 100, 100);
                      return (
                        <div key={i} className="flex items-center gap-4">
                          <span className="w-28 text-sm font-bold text-slate-500 uppercase tracking-wider">{statName}</span>
                          <span className="w-8 text-sm font-bold text-slate-700 text-right">{stat.base_stat}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
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
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Fraquezas</h3>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.weaknesses.map((weakness, i) => {
                      const img = tagImages[weakness];
                      return (
                        <div key={i} className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200" title={weakness}>
                          {img && <Image src={img} alt={weakness} width={24} height={24} className="object-contain drop-shadow-sm" />}
                          <span className="font-bold text-slate-700 uppercase tracking-wider text-xs">{weakness}</span>
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
