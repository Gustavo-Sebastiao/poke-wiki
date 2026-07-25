import { getPokemons } from '@/lib/pokemonService';
import PokemonCard from '@/components/PokemonCard';
import { Search } from 'lucide-react';

export default async function Pokedex() {
  const pokemons = await getPokemons();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-6 pt-24 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Pokédex</h1>
          <p className="text-slate-500 mt-2 text-lg">Busque por Pokémon pelo nome ou tipo</p>
        </div>
        
        {/* Simulando uma barra de busca, para o design */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow text-slate-700"
            placeholder="Buscar Pokémon..."
          />
        </div>
      </div>

      {pokemons && pokemons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pokemons.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-soft">
          <p className="text-slate-500 mb-4 text-center">Nenhum Pokémon encontrado. Seja o primeiro a cadastrar!</p>
        </div>
      )}
    </div>
  );
}
