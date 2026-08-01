import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import itemsData from '@/data/items.json';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const query = q.toLowerCase();
  
  try {
    // 1. Buscar Pokémons
    let pokemonQuery = supabaseAdmin
      .from('pokemons')
      .select('id, name, image_url')
      .limit(5);

    if (!isNaN(Number(query))) {
      pokemonQuery = pokemonQuery.eq('id', Number(query));
    } else {
      pokemonQuery = pokemonQuery.ilike('name', `%${query}%`);
    }

    const { data: pokemons, error } = await pokemonQuery;

    if (error) {
      console.error('Search error (Supabase):', error);
    }

    // 2. Buscar Itens
    // Lendo do JSON local em memória
    let matchedItems = itemsData.filter((item: any) => 
      item.name.toLowerCase().includes(query) || item.id.toString() === query
    ).slice(0, 5);

    // 3. Formatar e Unir Resultados
    const results: any[] = [];

    if (pokemons) {
      pokemons.forEach((p: any) => {
        results.push({
          id: p.id,
          name: p.name,
          image_url: p.image_url,
          type: 'pokemon',
        });
      });
    }

    matchedItems.forEach((i: any) => {
      results.push({
        id: i.id,
        name: i.name,
        image_url: i.image_url,
        type: 'item',
      });
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({ results: [], error: 'Internal Server Error' }, { status: 500 });
  }
}
