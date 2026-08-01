import { supabase } from './scripts/supabaseAdmin.mjs';

async function check() {
  const { data, error } = await supabase.from('pokemons').select('name, id').limit(2000);
  if (error) console.error(error);
  else {
    const chars = data.filter(p => p.name.toLowerCase().includes('char'));
    const bulbas = data.filter(p => p.name.toLowerCase().includes('bulba'));
    console.log("Chars:", chars);
    console.log("Bulbas:", bulbas);
    console.log("Total Count:", data.length);
  }
}
check();
