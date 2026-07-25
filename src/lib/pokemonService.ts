import { supabase } from './supabase';

export interface Pokemon {
  id?: string;
  name: string;
  description: string;
  type: string;
  weaknesses: string[];
  image_url?: string;
  habitat?: string;
}

// Buscar todos os Pokémons, opcionalmente filtrando por tipo
export async function getPokemons(type?: string) {
  let query = supabase.from('pokemons').select('*').order('created_at', { ascending: false });
  
  if (type) {
    query = query.eq('type', type);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar pokémons:', error);
    throw new Error(error.message);
  }
  
  return data;
}

// Criar um novo Pokémon (Admin)
export async function createPokemon(pokemon: Pokemon) {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('pokemons')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Erro ao deletar pokémon:', error);
    throw new Error(error.message);
  }
  
  return true;
}
