import 'server-only';

export interface Item {
  id: number;
  name: string;
  image_url: string;
  description: string;
  cost: number;
  rarity: string;
  category: string;
}

export async function getItems(): Promise<Item[]> {
  try {
    // Importando estaticamente do JSON gerado
    const itemsData = (await import('../data/items.json')).default;
    return itemsData as Item[];
  } catch (error) {
    console.error('Erro ao buscar itens (arquivo JSON não encontrado):', error);
    return [];
  }
}



export interface ItemDetails {
  id: number;
  name: string;
  cost: number;
  category: string;
  effect: string;
  short_effect: string;
}

async function translateText(text: string): Promise<string> {
  if (!text) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    
    const data = await response.json();
    if (data && data[0] && Array.isArray(data[0])) {
      // O Google Translate divide o texto longo em segmentos, precisamos juntá-los
      return data[0].map((segment: any) => segment[0]).join('');
    }
    return text;
  } catch (error) {
    console.error('Erro na tradução:', error);
    return text; // Fallback para o texto original em caso de erro
  }
}

export async function getItemDetails(id: number): Promise<ItemDetails | null> {
  try {
    const query = `
      query {
        pokemon_v2_item_by_pk(id: ${id}) {
          id
          name
          cost
          pokemon_v2_itemcategory {
            name
          }
          pokemon_v2_itemeffecttexts(where: {language_id: {_eq: 9}}, limit: 1) {
            effect
            short_effect
          }
        }
      }
    `;

    const response = await fetch('https://beta.pokeapi.co/graphql/v1beta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) return null;
    
    const { data } = await response.json();
    const item = data.pokemon_v2_item_by_pk;
    
    if (!item) return null;

    const originalEffect = item.pokemon_v2_itemeffecttexts[0]?.effect || 'Sem efeito detalhado.';
    const originalShortEffect = item.pokemon_v2_itemeffecttexts[0]?.short_effect || 'Sem efeito.';

    // Realiza as traduções em paralelo
    const [translatedEffect, translatedShortEffect] = await Promise.all([
      translateText(originalEffect),
      translateText(originalShortEffect)
    ]);

    return {
      id: item.id,
      name: item.name.replace(/-/g, ' '),
      cost: item.cost,
      category: item.pokemon_v2_itemcategory?.name?.replace(/-/g, ' ') || 'Desconhecida',
      effect: translatedEffect,
      short_effect: translatedShortEffect
    };
  } catch (error) {
    console.error(`Erro ao buscar detalhes do item ${id}:`, error);
    return null;
  }
}
