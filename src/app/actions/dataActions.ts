'use server';

import { getItemDetails, type ItemDetails } from '@/lib/itemService';
import { fetchPokemonFromPokeAPI } from '@/lib/pokeapi';

type PokeApiData = {
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

type PokeApiSpecies = {
  habitat: { name: string } | null;
  capture_rate: number;
  generation: { name: string };
  evolution_chain: { url: string } | null;
};

type Evolution = { name: string; imageUrl: string };

type PokemonDetails = {
  apiData: PokeApiData | null;
  speciesData: PokeApiSpecies | null;
  evolutions: Evolution[];
  megaEvolutions: Evolution[];
};

export async function getItemDetailsAction(id: number): Promise<ItemDetails | null> {
  return getItemDetails(id);
}

export async function fetchPokemonFromPokeAPIAction(pokemonName: string) {
  return fetchPokemonFromPokeAPI(pokemonName);
}

export async function getPokemonDetailsAction(
  pokemonName: string,
  imageUrl?: string,
): Promise<PokemonDetails> {
  const emptyDetails: PokemonDetails = {
    apiData: null,
    speciesData: null,
    evolutions: [],
    megaEvolutions: [],
  };
  let identifier = pokemonName.toLowerCase().replace(/\s+/g, '-');
  const imageId = imageUrl?.match(/\/(\d+)\.(png|jpg|jpeg|gif)$/i)?.[1];
  if (imageId) identifier = imageId;

  try {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${identifier}`);
    if (!pokemonResponse.ok) return emptyDetails;

    const pokemon = await pokemonResponse.json();
    const result: PokemonDetails = { ...emptyDetails, apiData: pokemon };
    if (!pokemon.species?.url) return result;

    const speciesResponse = await fetch(pokemon.species.url);
    if (!speciesResponse.ok) return result;

    const species = await speciesResponse.json();
    result.speciesData = species;
    result.megaEvolutions = (species.varieties ?? [])
      .filter(({ pokemon: variety }: { pokemon: { name: string } }) => (
        variety.name.includes('-mega') || variety.name.includes('-primal')
      ))
      .map(({ pokemon: variety }: { pokemon: { name: string; url: string } }) => {
        const id = variety.url.match(/\/(\d+)\/$/)?.[1];
        return {
          name: variety.name,
          imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
      });

    if (!species.evolution_chain?.url) return result;
    const evolutionResponse = await fetch(species.evolution_chain.url);
    if (!evolutionResponse.ok) return result;

    const evolutionData = await evolutionResponse.json();
    const pokemonSlug = pokemonName.toLowerCase().replace(/\s+/g, '-');
    const speciesName = species.name.toLowerCase();
    const allPaths = buildEvolutionPaths(evolutionData.chain, [evolutionData.chain.species.name]);
    let matchingPaths = allPaths.filter((path) => path.includes(pokemonSlug));

    if (matchingPaths.length === 0) {
      matchingPaths = allPaths.filter((path) => path.includes(speciesName));
      const isSpecialForm = pokemonName.toLowerCase().includes('mega')
        || pokemonName.toLowerCase().includes('primal');
      if (!isSpecialForm) {
        matchingPaths = matchingPaths.map((path) => (
          path.map((form) => form === speciesName ? pokemonSlug : form)
        ));
      }
    }

    const forms = [...new Set(matchingPaths.flat())];
    const evolutions = await Promise.all(forms.map(async (form): Promise<Evolution | null> => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${form}`);
      if (!response.ok) return null;
      const evolution = await response.json();
      return {
        name: evolution.name.replace(/-/g, ' '),
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolution.id}.png`,
      };
    }));
    result.evolutions = evolutions.filter((evolution): evolution is Evolution => evolution !== null);
    return result;
  } catch (error) {
    console.error('Erro ao buscar detalhes na PokeAPI:', error);
    return emptyDetails;
  }
}

export async function translateTextAction(text: string, targetLang: string): Promise<string> {
  if (!text) return text;

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'auto',
      tl: targetLang,
      dt: 't',
      q: text,
    });
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params}`);
    if (!response.ok) return text;

    const data = await response.json();
    if (data?.[0] && Array.isArray(data[0])) {
      return data[0].map((segment: unknown[]) => segment[0]).join('');
    }
  } catch (error) {
    console.error('Erro na tradução:', error);
  }

  return text;
}

type EvolutionNode = {
  species: { name: string };
  evolution_details: { base_form?: { name: string }; evolved_form?: { name: string } }[];
  evolves_to: EvolutionNode[];
};

function buildEvolutionPaths(node: EvolutionNode, currentPath: string[]): string[][] {
  if (!node.evolves_to?.length) return [currentPath];

  return node.evolves_to.flatMap((child) => {
    const details = child.evolution_details.length ? child.evolution_details : [{}];
    return details.flatMap((detail) => {
      const nextPath = [...currentPath];
      nextPath[nextPath.length - 1] = detail.base_form?.name || node.species.name;
      nextPath.push(detail.evolved_form?.name || child.species.name);
      return buildEvolutionPaths(child, nextPath);
    });
  });
}
