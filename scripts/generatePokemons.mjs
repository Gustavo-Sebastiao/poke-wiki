import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import translate from 'translate';

const POKEAPI_URL = 'https://pokeapi.co/api/v2';
const OUTPUT_FILE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/pokemons.json',
);

const TYPE_MAP = {
  normal: 'Normal',
  fighting: 'Luta',
  flying: 'Voador',
  poison: 'Venenoso',
  ground: 'Terra',
  rock: 'Rocha',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Escuridão',
  fairy: 'Fada',
};

translate.engine = 'google';

async function fetchJson(url, attempts = 3) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url);
    if (response.ok) return response.json();
    if (attempt === attempts) {
      throw new Error(`Request failed (${response.status}): ${url}`);
    }
    await wait(attempt * 500);
  }
}

async function mapInBatches(values, batchSize, worker, delay = 0) {
  const results = [];
  for (let index = 0; index < values.length; index += batchSize) {
    const batch = values.slice(index, index + batchSize);
    results.push(...await Promise.all(batch.map(worker)));
    console.log(`Processed ${Math.min(index + batchSize, values.length)}/${values.length}`);
    if (delay && index + batchSize < values.length) await wait(delay);
  }
  return results;
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function cleanText(text) {
  return text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatName(slug, isForm) {
  if (!isForm) return slug.charAt(0).toUpperCase() + slug.slice(1);
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isSupportedForm(name) {
  return name.includes('-mega')
    || name.includes('primal')
    || (name.includes('-alola') && !name.includes('-totem') && !name.includes('-cap'))
    || (name.includes('-galar') && !name.includes('-totem') && !name.includes('-cap'))
    || name.includes('-hisui')
    || (name.includes('-paldea') && !name.includes('-combat'));
}

async function main() {
  console.log('Discovering PokeAPI catalog...');
  const [pokemonCatalog, speciesCatalog] = await Promise.all([
    fetchJson(`${POKEAPI_URL}/pokemon?limit=10000`),
    fetchJson(`${POKEAPI_URL}/pokemon-species?limit=10000`),
  ]);
  const getId = ({ url }) => Number(url.match(/\/(\d+)\/$/)?.[1]);
  const baseIds = speciesCatalog.results.map(getId).filter(Number.isInteger);
  const baseIdSet = new Set(baseIds);
  const formIds = pokemonCatalog.results
    .filter(({ name }) => isSupportedForm(name))
    .map(getId)
    .filter(Number.isInteger);
  const ids = [...baseIds, ...formIds];

  const speciesCache = new Map();
  const typeCache = new Map();
  const getCached = (cache, url) => {
    if (!cache.has(url)) cache.set(url, fetchJson(url));
    return cache.get(url);
  };

  console.log(`Fetching ${ids.length} Pokémon records...`);
  const records = await mapInBatches(ids, 25, async (id) => {
    const pokemon = await fetchJson(`${POKEAPI_URL}/pokemon/${id}`);
    const species = await getCached(speciesCache, pokemon.species.url);
    const englishEntry = species.flavor_text_entries.find(
      ({ language }) => language.name === 'en',
    );
    if (!englishEntry) throw new Error(`Missing English description for ${pokemon.name}`);

    const typeRelations = await Promise.all(
      pokemon.types.map(({ type }) => getCached(typeCache, type.url)),
    );
    const weaknesses = new Set();
    for (const relation of typeRelations) {
      for (const weakType of relation.damage_relations.double_damage_from) {
        weaknesses.add(TYPE_MAP[weakType.name] ?? weakType.name);
      }
    }

    return {
      id: String(pokemon.id),
      name: formatName(pokemon.name, !baseIdSet.has(pokemon.id)),
      description: cleanText(englishEntry.flavor_text),
      type: pokemon.types
        .map(({ type }) => TYPE_MAP[type.name] ?? type.name)
        .join(', '),
      weaknesses: [...weaknesses],
      image_url: pokemon.sprites?.other?.['official-artwork']?.front_default
        ?? pokemon.sprites?.front_default
        ?? '',
    };
  });

  const descriptions = [...new Set(records.map(({ description }) => description))];
  console.log(`Translating ${descriptions.length} unique descriptions to Portuguese...`);
  const translatedDescriptions = await mapInBatches(
    descriptions,
    20,
    async (description) => [
      description,
      cleanText(await translate(description, { from: 'en', to: 'pt' })),
    ],
    1000,
  );
  const translations = new Map(translatedDescriptions);

  const output = records
    .map((record) => ({
      ...record,
      description: translations.get(record.description),
    }))
    .sort((first, second) => Number(first.id) - Number(second.id));

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${output.length} records to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
