import { supabase } from './supabaseAdmin.mjs';

async function check() {
  const { data, error } = await supabase.from('pokemons').select('id, name, description');
  if (error) {
    console.error(error);
    return;
  }
  console.log(`Total pokemons in DB: ${data.length}`);
  const sample = data.find(p => p.name === 'Bulbasaur' || p.name === 'Charizard');
  console.log('Sample description:', sample?.description);
}
check();
