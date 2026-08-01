import { supabase } from './supabaseAdmin.mjs';

const resAll = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
const dataAll = await resAll.json();
const ALOLA_IDS = dataAll.results
  .filter(p => p.name.includes('-alola') && !p.name.includes('-totem') && !p.name.includes('-cap'))
  .map(m => parseInt(m.url.split('/').slice(-2,-1)[0]));

const typeMap = {
  normal: 'Normal', fighting: 'Luta', flying: 'Voador', poison: 'Venenoso',
  ground: 'Terra', rock: 'Rocha', bug: 'Inseto', ghost: 'Fantasma',
  steel: 'Aço', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', psychic: 'Psíquico', ice: 'Gelo', dragon: 'Dragão',
  dark: 'Escuridão', fairy: 'Fada'
};

async function seedAlolas() {
  console.log('Fetching existing Alolas from DB...');
  const { data: existing } = await supabase.from('pokemons').select('name').ilike('name', '%Alola%');
  const existingNames = new Set((existing || []).map(p => p.name));

  const alolas = [];
  
  for (const id of ALOLA_IDS) {
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
      
      let description = "Uma forma adaptada à região de Alola.";
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
      
      alolas.push({
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

  if (alolas.length > 0) {
    console.log(`Inserting ${alolas.length} Alolas into Supabase...`);
    const { data, error } = await supabase.from('pokemons').insert(alolas);
    if (error) console.error(error);
    else console.log('Successfully inserted Alola forms!');
  } else {
    console.log('No new Alolas to insert.');
  }
}

seedAlolas();
