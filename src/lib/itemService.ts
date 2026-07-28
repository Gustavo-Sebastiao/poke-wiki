export interface Item {
  id: number;
  name: string;
  image_url: string;
}

export async function getItems(): Promise<Item[]> {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/item?limit=2000');
    if (!response.ok) {
      throw new Error('Falha ao buscar itens na PokeAPI');
    }
    const data = await response.json();
    
    // Mapear os resultados para extrair o ID a partir da URL
    const items: Item[] = data.results.map((result: { name: string, url: string }) => {
      // url é no formato: https://pokeapi.co/api/v2/item/1/
      const idParts = result.url.split('/').filter(Boolean);
      const id = parseInt(idParts[idParts.length - 1], 10);
      
      // Montar a URL oficial do sprite do item usando o github content repository do PokeAPI para evitar requests 1x1
      const image_url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${result.name}.png`;
      
      return {
        id,
        // Remover hifens do nome para melhor exibição (ex: master-ball -> master ball)
        name: result.name.replace(/-/g, ' '),
        image_url
      };
    });
    
    return items;
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return [];
  }
}
