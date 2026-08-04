import 'server-only';

import pokemonData from '@/data/pokemons.json';

export interface Pokemon {
  id?: string;
  name: string;
  description: string;
  type: string;
  weaknesses: string[];
  image_url?: string;
  habitat?: string;
}

const pokemons = pokemonData as Pokemon[];

export async function getPokemons(type?: string): Promise<Pokemon[]> {
  if (!type) return pokemons;

  const normalizedType = type.toLocaleLowerCase('pt-BR');
  return pokemons.filter((pokemon) => (
    pokemon.type
      .split(',')
      .some((pokemonType) => pokemonType.trim().toLocaleLowerCase('pt-BR') === normalizedType)
  ));
}
