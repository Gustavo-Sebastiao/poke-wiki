const { createClient } = require('@supabase/supabase-js');
const url = 'https://lzidmnyenphlshihhpka.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6aWRtbnllbnBobHNoaWhocGthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkzNzQ5NSwiZXhwIjoyMDk2NTEzNDk1fQ.iz25H0TDlfIIYgtiBDPR5QTzKF-jBzUMlGDezesKMUw';
const supabase = createClient(url, key);

async function check() {
  const { data: pokemons } = await supabase.from('pokemons').select('id, name, is_mega, evolutions, base_pokemon_id').ilike('name', '%go%');
  const filtered = pokemons.filter(d => ['Golett', 'Golurk', 'Golurk Mega'].includes(d.name));
  console.log(JSON.stringify(filtered, null, 2));
}
check();
