import { NextResponse } from 'next/server';
import { getPokemons } from '@/lib/pokemonCatalog';
import itemsData from '@/data/items.json';
import Fuse from 'fuse.js';
import { rankFuzzyResults } from '@/lib/fuzzySearch';

type SearchResult = {
  id: string | number;
  name: string;
  image_url: string;
  type: 'pokemon' | 'item';
};

type SearchEntry = SearchResult & {
  searchId: string;
  searchTerms: string;
};

let searchIndex: Fuse<SearchEntry> | null = null;
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

async function getSearchIndex() {
  if (searchIndex) return searchIndex;

  const pokemons = await getPokemons();
  const entries: SearchEntry[] = [
    ...pokemons.map((pokemon) => ({
      id: pokemon.id ?? '',
      name: pokemon.name,
      image_url: pokemon.image_url ?? '',
      type: 'pokemon' as const,
      searchId: pokemon.id ?? '',
      searchTerms: pokemon.type,
    })),
    ...itemsData.map((item) => ({
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      type: 'item' as const,
      searchId: item.id.toString(),
      searchTerms: item.category,
    })),
  ];

  searchIndex = new Fuse(entries, {
    keys: [
      { name: 'name', weight: 0.8 },
      { name: 'searchTerms', weight: 0.15 },
      { name: 'searchId', weight: 0.05 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  });

  return searchIndex;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] }, { headers: NO_STORE_HEADERS });
  }

  try {
    const index = await getSearchIndex();
    const matches = rankFuzzyResults(
      index.search(query, { limit: 10 }),
      query,
      (item) => item.name,
    );
    const results: SearchResult[] = matches.map(({ item }) => ({
      id: item.id,
      name: item.name,
      image_url: item.image_url,
      type: item.type,
    }));

    return NextResponse.json({ results }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json(
      { results: [], error: 'Internal Server Error' },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
