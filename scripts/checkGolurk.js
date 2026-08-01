const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(url, key);

async function check() {
  const { data: pokemons } = await supabase.from('pokemons').select('id, name, is_mega, evolutions, base_pokemon_id').ilike('name', '%go%');
  const filtered = pokemons.filter(d => ['Golett', 'Golurk', 'Golurk Mega'].includes(d.name));
  console.log(JSON.stringify(filtered, null, 2));
}
check();
