import { NextResponse } from 'next/server';
import { getPokemons } from '@/lib/pokemonCatalog';
import itemsData from '@/data/items.json';

type SearchResult = {
  id: string | number;
  name: string;
  image_url: string;
  type: 'pokemon' | 'item';
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.toLowerCase();
  
  try {
    // 1. Buscar Pokémons
    const allPokemons = await getPokemons();
    const pokemons = allPokemons.filter((pokemon) => (
      pokemon.id === query || pokemon.name.toLowerCase().includes(query)
    )).slice(0, 5);

    // 2. Buscar Itens
    // Lendo do JSON local em memória
    const matchedItems = itemsData.filter((item) =>
      item.name.toLowerCase().includes(query) || item.id.toString() === query
    ).slice(0, 5);

    // 3. Formatar e Unir Resultados
    const results: SearchResult[] = [
      ...pokemons.map((pokemon) => ({
        id: pokemon.id ?? '',
        name: pokemon.name,
        image_url: pokemon.image_url ?? '',
        type: 'pokemon' as const,
      })),
      ...matchedItems.map((item) => ({
        id: item.id,
        name: item.name,
        image_url: item.image_url,
        type: 'item' as const,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ results: [], error: 'Internal Server Error' }, { status: 500 });
  }
}
