import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import translate from 'translate';

translate.engine = 'google';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../src/data');
const OUT_FILE = path.join(DATA_DIR, 'items.json');

const CATEGORY_MAP = {
  'standard-balls': 'Pokébolas',
  'special-balls': 'Pokébolas',
  'apricorn-balls': 'Pokébolas',
  'healing': 'Medicina',
  'status-cures': 'Medicina',
  'revival': 'Medicina',
  'pp-recovery': 'Medicina',
  'vitamins': 'Medicina',
  'stat-boosts': 'Batalha',
  'held-items': 'Batalha',
  'choice': 'Batalha',
  'effort-training': 'Batalha',
  'bad-held-items': 'Batalha',
  'training': 'Batalha',
  'plates': 'Batalha',
  'species-specific': 'Batalha',
  'type-enhancement': 'Batalha',
  'evolution': 'Evolução',
  'baking-only': 'Comida',
  'picky-healing': 'Comida',
  'event-items': 'Chaves e Especiais',
  'key-items': 'Chaves e Especiais',
  'gameplay': 'Chaves e Especiais',
  'dex-completion': 'Chaves e Especiais',
  'mulch': 'Outros',
  'flutes': 'Outros',
  'apricorns': 'Outros',
  'collectibles': 'Outros',
  'spelunking': 'Outros'
};

function getRarityByCost(cost) {
  if (cost === 0) return 'Único';
  if (cost <= 1000) return 'Comum';
  if (cost <= 3000) return 'Incomum';
  if (cost <= 9000) return 'Raro';
  return 'Épico';
}

async function fetchAllItems() {
  const query = `
    query {
      pokemon_v2_item {
        id
        name
        cost
        pokemon_v2_itemcategory {
          name
        }
        pokemon_v2_itemflavortexts(where: {language_id: {_eq: 9}}, limit: 1) {
          flavor_text
        }
      }
    }
  `;

  const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar itens na PokeAPI via GraphQL');
  }

  const { data } = await response.json();
  
  return data.pokemon_v2_item.map((item) => {
    const image_url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`;
    const description = item.pokemon_v2_itemflavortexts[0]?.flavor_text?.replace(/\n/g, ' ') || 'Nenhuma descrição disponível.';
    
    const rawCategory = item.pokemon_v2_itemcategory?.name || 'other';
    const category = CATEGORY_MAP[rawCategory] || 'Outros';
    const cost = item.cost || 0;
    const rarity = getRarityByCost(cost);

    return {
      id: item.id,
      name: item.name.replace(/-/g, ' '),
      image_url,
      description,
      cost,
      category,
      rarity
    };
  });
}

async function run() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log('Buscando todos os itens da PokeAPI...');
  const items = await fetchAllItems();
  console.log(`Encontrados ${items.length} itens.`);

  console.log('Iniciando tradução (pode demorar alguns minutos)...');
  
  // Como são mais de 2000, vamos traduzir em lotes menores para não dar timeout ou rate limit massivo
  const BATCH_SIZE = 100;
  const BATCH_DELAY = 2000; // 2 seconds between batches

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    console.log(`Processando lote ${i / BATCH_SIZE + 1} de ${Math.ceil(items.length / BATCH_SIZE)}...`);
    
    await Promise.all(batch.map(async (item) => {
      try {
        if (item.description && item.description !== 'Nenhuma descrição disponível.') {
          item.description = await translate(item.description, { from: 'en', to: 'pt' });
        }
      } catch (err) {
        console.error(`Erro ao traduzir item ${item.name}: ${err.message}`);
      }
    }));

    if (i + BATCH_SIZE < items.length) {
      await new Promise(res => setTimeout(res, BATCH_DELAY));
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Sucesso! ${items.length} itens salvos em ${OUT_FILE}`);
}

run().catch(console.error);
