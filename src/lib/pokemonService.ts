import 'server-only';

import { supabaseAdmin } from './supabaseAdmin';
import type { Pokemon } from './pokemonCatalog';

export type { Pokemon } from './pokemonCatalog';

export async function getAdminPokemons(): Promise<Pokemon[]> {
  const allData: Pokemon[] = [];
  let from = 0;
  const limit = 1000;
  
  while (true) {
    const query = supabaseAdmin
      .from('pokemons')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar pokémons:', error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) break;
    
    allData.push(...data as Pokemon[]);
    
    if (data.length < limit) break;
    
    from += limit;
  }
  
  return allData;
}

// Criar um novo Pokémon (Admin)
export async function createPokemon(pokemon: Pokemon) {
  const { data, error } = await supabaseAdmin
    .from('pokemons')
    .insert([pokemon])
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao criar pokémon:', error);
    throw new Error(error.message);
  }
  
  return data;
}

// Buscar um Pokémon específico por ID
export async function getPokemonById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('pokemons')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Erro ao buscar pokémon por ID:', error);
    throw new Error(error.message);
  }
  
  return data as Pokemon;
}

// Atualizar um Pokémon existente
export async function updatePokemon(id: string, pokemon: Partial<Pokemon>) {
  const { data, error } = await supabaseAdmin
    .from('pokemons')
    .update(pokemon)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Erro ao atualizar pokémon:', error);
    throw new Error(error.message);
  }
  
  return data;
}

// Excluir um Pokémon existente (Admin)
export async function deletePokemon(id: string) {
  const { error } = await supabaseAdmin
    .from('pokemons')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar pokémon:', error);
    throw new Error(error.message);
  }
  
  return true;
}
