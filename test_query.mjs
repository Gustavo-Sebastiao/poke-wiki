import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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
