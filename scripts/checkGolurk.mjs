import { supabase } from './supabaseAdmin.mjs';

async function check() {
  const { data: pokemons } = await supabase.from('pokemons').select('id, name, is_mega, evolutions, base_pokemon_id').ilike('name', '%go%');
  const filtered = pokemons.filter(d => ['Golett', 'Golurk', 'Golurk Mega'].includes(d.name));
  console.log(JSON.stringify(filtered, null, 2));
}
check();
