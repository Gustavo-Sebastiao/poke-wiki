import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
