import { supabase } from './supabaseAdmin.mjs';

const TYPE_MAP = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  electric: 'Elétrico',
  grass: 'Planta',
  ice: 'Gelo',
  fighting: 'Luta',
  poison: 'Venenoso',
  ground: 'Terra',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Rocha',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Escuridão',
  steel: 'Aço',
  fairy: 'Fada',
};

async function fetchPokemonFromPokeAPI(idOrName) {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    if (!res.ok) {
      throw new Error(`Pokémon ${idOrName} not found.`);
    }
    const data = await res.json();

    let description = '';
    try {
      const speciesRes = await fetch(data.species.url);
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        let entry = speciesData.flavor_text_entries.find(e => e.language.name === 'pt-BR' || e.language.name === 'pt');
        if (!entry) {
          entry = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
        }
        if (!entry) {
          entry = speciesData.flavor_text_entries.find(e => e.language.name === 'es');
        }
        if (entry) {
          description = entry.flavor_text.replace(/[\n\f\r]/g, ' ');
        }
      }
    } catch (e) {
      console.warn(`Could not fetch description for ${data.name}:`, e.message);
    }

    const types = data.types.map(t => TYPE_MAP[t.type.name] || t.type.name);

    const weaknessesSet = new Set();
    for (const t of data.types) {
      try {
        const typeRes = await fetch(t.type.url);
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          const doubleDamageFrom = typeData.damage_relations.double_damage_from;
          doubleDamageFrom.forEach(weakType => {
            weaknessesSet.add(TYPE_MAP[weakType.name] || weakType.name);
          });
        }
      } catch (e) {
        console.warn(`Could not fetch weaknesses for ${data.name} type ${t.type.name}:`, e.message);
      }
    }

    const imageUrl = data.sprites?.other?.['official-artwork']?.front_default 
      || data.sprites?.front_default 
      || '';

    return {
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      type: types.slice(0, 2).join(', '),
      weaknesses: Array.from(weaknessesSet),
      description: description,
      image_url: imageUrl,
    };
  } catch (error) {
    throw new Error(`Error fetching ${idOrName}: ${error.message}`);
  }
}

async function seed() {
  const TOTAL_POKEMON = 1025; // As of Generation 9
  const BATCH_SIZE = 10;
  
  console.log(`Starting to seed ${TOTAL_POKEMON} Pokemons in batches of ${BATCH_SIZE}...`);

  for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
    const batch = [];
    for (let j = i; j < i + BATCH_SIZE && j <= TOTAL_POKEMON; j++) {
      batch.push(j);
    }
    
    console.log(`Fetching batch ${i} to ${batch[batch.length - 1]}...`);
    
    const results = await Promise.allSettled(batch.map(id => fetchPokemonFromPokeAPI(id)));
    
    const validPokemons = [];
    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        validPokemons.push(res.value);
      } else {
        console.error(`Failed to fetch ID ${batch[index]}: ${res.reason}`);
      }
    });

    if (validPokemons.length > 0) {
      // First check if they already exist to avoid duplicates (optional, assuming empty DB for now)
      const { data, error } = await supabase
        .from('pokemons')
        .insert(validPokemons);
        
      if (error) {
        console.error(`Error inserting batch:`, error.message);
      } else {
        console.log(`Inserted ${validPokemons.length} Pokemons.`);
      }
    }
    
    // Small delay to be nice to PokeAPI
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("Seeding complete!");
}

seed();
