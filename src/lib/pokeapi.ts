import 'server-only';

const TYPE_MAP: Record<string, string> = {
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

export async function fetchPokemonFromPokeAPI(pokemonName: string) {
  const name = pokemonName.toLowerCase().trim();
  if (!name) throw new Error('Nome do Pokémon é obrigatório');

  try {
    // Busca dados básicos do Pokémon
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) {
      throw new Error('Pokémon não encontrado na PokéAPI.');
    }
    const data = await res.json();

    // Busca a descrição (species)
    let description = '';
    try {
      const speciesRes = await fetch(data.species.url);
      if (speciesRes.ok) {
        const speciesData = await speciesRes.json();
        // Tenta achar em PT, se não achar tenta EN, se não, ES
        let entry = speciesData.flavor_text_entries.find((e: any) => e.language.name === 'pt-BR' || e.language.name === 'pt');
        if (!entry) {
          entry = speciesData.flavor_text_entries.find((e: any) => e.language.name === 'en');
        }
        if (!entry) {
          entry = speciesData.flavor_text_entries.find((e: any) => e.language.name === 'es');
        }
        if (entry) {
          // Limpa caracteres de quebra de linha estranhos da PokéAPI
          description = entry.flavor_text.replace(/[\n\f\r]/g, ' ');
        }
      }
    } catch (e) {
      console.warn('Não foi possível buscar a descrição:', e);
    }

    // Traduz os tipos
    const types = data.types.map((t: any) => TYPE_MAP[t.type.name] || t.type.name);

    // Calcula fraquezas buscando os dados dos tipos
    const weaknessesSet = new Set<string>();
    for (const t of data.types) {
      try {
        const typeRes = await fetch(t.type.url);
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          const doubleDamageFrom = typeData.damage_relations.double_damage_from;
          doubleDamageFrom.forEach((weakType: any) => {
            weaknessesSet.add(TYPE_MAP[weakType.name] || weakType.name);
          });
        }
      } catch (e) {
        console.warn(`Não foi possível buscar fraquezas do tipo ${t.type.name}:`, e);
      }
    }

    // A imagem preferida é a "official-artwork"
    const imageUrl = data.sprites?.other?.['official-artwork']?.front_default 
      || data.sprites?.front_default 
      || '';

    return {
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      type: types,
      weaknesses: Array.from(weaknessesSet),
      description: description,
      image_url: imageUrl,
    };

  } catch (error: any) {
    throw new Error(error.message || 'Erro de conexão com a PokéAPI.');
  }
}
