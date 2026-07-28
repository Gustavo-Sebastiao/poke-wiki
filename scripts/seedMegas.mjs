import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const MEGA_IDS = [
  10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042, 
  10043, 10044, 10045, 10046, 10047, 10048, 10049, 10050, 10051, 10052, 
  10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10062, 10063, 
  10064, 10065, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 10074, 
  10075, 10076, 10077, 10078, 10087, 10088, 10089, 10090
];

const typeMap = {
  normal: 'Normal', fighting: 'Luta', flying: 'Voador', poison: 'Venenoso',
  ground: 'Terra', rock: 'Rocha', bug: 'Inseto', ghost: 'Fantasma',
  steel: 'Aço', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', psychic: 'Psíquico', ice: 'Gelo', dragon: 'Dragão',
  dark: 'Escuridão', fairy: 'Fada'
};

async function seedMegas() {
  console.log('Fetching existing Megas from DB...');
  const { data: existing } = await supabase.from('pokemons').select('name').ilike('name', '%Mega%');
  const existingNames = new Set((existing || []).map(p => p.name));

  const megas = [];
  
  for (const id of MEGA_IDS) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) continue;
      const data = await res.json();
      
      const name = data.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      if (existingNames.has(name)) {
        continue;
      }

      const types = data.types.map(t => typeMap[t.type.name]).join(', ');
      const image_url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      
      let description = "Uma poderosa Mega Evolução.";
      if (data.species?.url) {
        const sRes = await fetch(data.species.url);
        if (sRes.ok) {
          const sData = await sRes.json();
          const ptEntry = sData.flavor_text_entries.find(e => e.language.name === 'pt-BR' || e.language.name === 'pt');
          if (ptEntry) {
            description = ptEntry.flavor_text.replace(/[\n\f]/g, ' ');
          } else {
            const enEntry = sData.flavor_text_entries.find(e => e.language.name === 'en');
            if (enEntry) description = enEntry.flavor_text.replace(/[\n\f]/g, ' ');
          }
        }
      }
      
      megas.push({
        name,
        type: types,
        description,
        image_url,
        weaknesses: []
      });
      console.log(`Prepared ${name}`);
    } catch (e) {
      console.error(e);
    }
  }

  if (megas.length > 0) {
    console.log(`Inserting ${megas.length} Megas into Supabase...`);
    const { data, error } = await supabase.from('pokemons').insert(megas);
    if (error) console.error(error);
    else console.log('Successfully inserted Mega Evolutions!');
  } else {
    console.log('No new Megas to insert.');
  }
}

seedMegas();
