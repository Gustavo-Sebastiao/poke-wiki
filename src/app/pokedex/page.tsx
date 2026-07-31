import { Suspense } from 'react';
import { getPokemons } from '@/lib/pokemonService';
import PokedexList from '@/components/PokedexList';

export default async function Pokedex() {
  const pokemons = await getPokemons();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-8 w-full overflow-x-hidden">
      <Suspense fallback={<div>Carregando...</div>}>
        <PokedexList initialPokemons={pokemons} />
      </Suspense>
    </div>
  );
}
