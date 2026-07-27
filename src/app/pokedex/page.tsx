import { getPokemons } from '@/lib/pokemonService';
import PokedexList from '@/components/PokedexList';

export default async function Pokedex() {
  const pokemons = await getPokemons();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto px-6 pt-24 pb-8">
      <PokedexList initialPokemons={pokemons} />
    </div>
  );
}
