import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const resAll = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
const dataAll = await resAll.json();
const GALAR_IDS = dataAll.results
  .filter(p => p.name.includes('-galar') && !p.name.includes('-totem') && !p.name.includes('-cap'))
  .map(m => parseInt(m.url.split('/').slice(-2,-1)[0]));

const typeMap = {
  normal: 'Normal', fighting: 'Luta', flying: 'Voador', poison: 'Venenoso',
  ground: 'Terra', rock: 'Rocha', bug: 'Inseto', ghost: 'Fantasma',
  steel: 'Aço', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', psychic: 'Psíquico', ice: 'Gelo', dragon: 'Dragão',
  dark: 'Escuridão', fairy: 'Fada'
};

async function seedGalars() {
  console.log('Fetching existing Galars from DB...');
  const { data: existing } = await supabase.from('pokemons').select('name').ilike('name', '%Galar%');
  const existingNames = new Set((existing || []).map(p => p.name));

  const galars = [];
  
  for (const id of GALAR_IDS) {
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
      
      let description = "Uma forma adaptada à região de Galar.";
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
      
      galars.push({
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

  if (galars.length > 0) {
    console.log(`Inserting ${galars.length} Galars into Supabase...`);
    const { data, error } = await supabase.from('pokemons').insert(galars);
    if (error) console.error(error);
    else console.log('Successfully inserted Galar forms!');
  } else {
    console.log('No new Galars to insert.');
  }
}

seedGalars();
