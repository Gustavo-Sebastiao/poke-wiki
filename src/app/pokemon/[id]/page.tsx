import { getPokemonById } from '@/lib/pokemonService';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { tagImages } from '@/components/TagSelector';

// Types para a PokeAPI
interface PokeApiData {
  height: number; // em decímetros
  weight: number; // em hectogramas
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface PokeApiSpecies {
  habitat: { name: string } | null;
  capture_rate: number;
}

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

async function getPokeApiData(name: string): Promise<{ apiData: PokeApiData | null, speciesData: PokeApiSpecies | null }> {
  try {
    // Tenta buscar pelo nome em inglês (normalmente a pokeAPI usa lowercase do nome)
    // Tratamentos simples para nomes compostos se necessário poderiam ir aqui
    const formattedName = name.toLowerCase().replace(/\s+/g, '-');
    
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${formattedName}`, { next: { revalidate: 86400 } }),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${formattedName}`, { next: { revalidate: 86400 } })
    ]);

    const apiData = pokemonRes.ok ? await pokemonRes.json() : null;
    const speciesData = speciesRes.ok ? await speciesRes.json() : null;

    return { apiData, speciesData };
  } catch (error) {
    console.error("Erro ao buscar dados adicionais na PokeAPI:", error);
    return { apiData: null, speciesData: null };
  }
}

export default async function PokemonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pokemon = await getPokemonById(id).catch(() => null);
  
  if (!pokemon) {
    notFound();
  }

  const { apiData, speciesData } = await getPokeApiData(pokemon.name);

  const imageUrl = pokemon.image_url || 'https://via.placeholder.com/400?text=Sem+Imagem';
  
  // Formatando atributos
  const heightMeters = apiData ? (apiData.height / 10).toFixed(1) + ' m' : 'Desconhecida';
  const weightKg = apiData ? (apiData.weight / 10).toFixed(1) + ' kg' : 'Desconhecido';
  const habitat = speciesData?.habitat ? (HABITAT_TRANSLATIONS[speciesData.habitat.name] || speciesData.habitat.name) : 'Desconhecido';
  const captureRate = speciesData?.capture_rate ? Math.round((speciesData.capture_rate / 255) * 100) + '%' : 'Desconhecida';

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pt-16">
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8 animate-fade-in">
        
        {/* Navegação Voltar */}
        <div>
          <Link 
            href="/pokedex"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para a Pokédex
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white p-8 lg:p-12 rounded-[3rem] shadow-sm border border-slate-100">
          
          {/* Lado Esquerdo: Imagem */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 rounded-[2.5rem] p-8 relative overflow-hidden group">
            {/* Efeito de brilho de fundo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#59F7E2]/20 to-transparent opacity-50"></div>
            
            <div className="relative w-full aspect-square flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={pokemon.name}
                className="object-contain w-full h-full drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Lado Direito: Informações */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            
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
            </div>

            {/* Grid de Informações Ricas (PokeAPI) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Altura</p>
                <p className="text-lg font-bold text-slate-700">{heightMeters}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Peso</p>
                <p className="text-lg font-bold text-slate-700">{weightKg}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Habitat</p>
                <p className="text-lg font-bold text-slate-700 capitalize">{habitat}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-sm font-semibold text-slate-400 mb-1 uppercase tracking-wider">Taxa de Captura</p>
                <p className="text-lg font-bold text-slate-700">{captureRate}</p>
              </div>
            </div>

            {/* Habilidades */}
            {apiData && apiData.abilities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Habilidades</h3>
                <div className="flex flex-wrap gap-2">
                  {apiData.abilities.map((a, i) => (
                    <span 
                      key={i} 
                      className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${a.is_hidden ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
                      title={a.is_hidden ? 'Habilidade Oculta' : 'Habilidade Padrão'}
                    >
                      {a.ability.name.replace('-', ' ')}
                      {a.is_hidden && ' (Oculta)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Base Stats */}
            {apiData && apiData.stats.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Atributos Base</h3>
                <div className="flex flex-col gap-3">
                  {apiData.stats.map((stat, i) => {
                    const statName = TYPE_TRANSLATIONS[stat.stat.name] || stat.stat.name;
                    // Max base stat is usually 255 (Blissey HP)
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
                    return img ? (
                      <div key={i} className="relative w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden" title={weakness}>
                        <Image src={img} alt={weakness} fill className="object-cover scale-110 drop-shadow-sm" />
                      </div>
                    ) : (
                      <span key={i} className="px-3 py-1.5 text-xs font-bold uppercase bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                        {weakness}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
