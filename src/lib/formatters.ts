export function capitalize(str: string): string {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

export function formatPokemonName(name: string, lang: 'pt' | 'en'): string {
  if (!name) return '';
  let formattedName = name.toLowerCase();

  // Substituições comuns em PT
  if (lang === 'pt') {
    formattedName = formattedName.replace(/-mega/g, ' Mega');
    formattedName = formattedName.replace(/-alola/g, ' de Alola');
    formattedName = formattedName.replace(/-galar/g, ' de Galar');
    formattedName = formattedName.replace(/-hisui/g, ' de Hisui');
    formattedName = formattedName.replace(/-paldea/g, ' de Paldea');
    formattedName = formattedName.replace(/-primal/g, ' Primal');
    
    // Para casos como mega-x e mega-y
    formattedName = formattedName.replace(/-x/g, ' X');
    formattedName = formattedName.replace(/-y/g, ' Y');

    // Casos em que o "mega" vem no começo, ajustamos depois do split ou aqui
    if (formattedName.endsWith(' mega')) {
      formattedName = 'mega ' + formattedName.replace(' mega', '');
    }
  } else {
    // Substituições em EN
    formattedName = formattedName.replace(/-mega/g, ' Mega');
    formattedName = formattedName.replace(/-alola/g, ' Alola');
    formattedName = formattedName.replace(/-galar/g, ' Galar');
    formattedName = formattedName.replace(/-hisui/g, ' Hisui');
    formattedName = formattedName.replace(/-paldea/g, ' Paldea');
    formattedName = formattedName.replace(/-primal/g, ' Primal');

    formattedName = formattedName.replace(/-x/g, ' X');
    formattedName = formattedName.replace(/-y/g, ' Y');

    // Em inglês, geralmente é Alolan Vulpix, Galarian Darmanitan, Mega Venusaur, etc.
    if (formattedName.includes(' alola')) {
      formattedName = 'Alolan ' + formattedName.replace(' alola', '');
    } else if (formattedName.includes(' galar')) {
      formattedName = 'Galarian ' + formattedName.replace(' galar', '');
    } else if (formattedName.includes(' hisui')) {
      formattedName = 'Hisuian ' + formattedName.replace(' hisui', '');
    } else if (formattedName.includes(' paldea')) {
      formattedName = 'Paldean ' + formattedName.replace(' paldea', '');
    }
    
    if (formattedName.endsWith(' mega')) {
      formattedName = 'Mega ' + formattedName.replace(' mega', '');
    }
  }

  // Remove qualquer traço restante
  formattedName = formattedName.replace(/-/g, ' ');

  // Capitaliza o nome final
  return capitalize(formattedName.trim());
}

export function translateType(type: string, lang: 'pt' | 'en'): string {
  if (lang === 'en') return capitalize(type);
  
  const translations: Record<string, string> = {
    'normal': 'Normal',
    'fighting': 'Lutador',
    'flying': 'Voador',
    'poison': 'Venenoso',
    'ground': 'Terrestre',
    'rock': 'Pedra',
    'bug': 'Inseto',
    'ghost': 'Fantasma',
    'steel': 'Metálico',
    'fire': 'Fogo',
    'water': 'Água',
    'grass': 'Planta',
    'electric': 'Elétrico',
    'psychic': 'Psíquico',
    'ice': 'Gelo',
    'dragon': 'Dragão',
    'dark': 'Sombrio',
    'fairy': 'Fada'
  };
  
  return translations[type.toLowerCase()] || capitalize(type);
}

export function translateHabitat(habitat: string, lang: 'pt' | 'en'): string {
  if (lang === 'en') return capitalize(habitat);
  
  const translations: Record<string, string> = {
    'cave': 'Caverna',
    'forest': 'Floresta',
    'grassland': 'Campos',
    'mountain': 'Montanha',
    'rare': 'Raro',
    'rough-terrain': 'Terreno Acidentado',
    'sea': 'Mar',
    'urban': 'Urbano',
    'waters-edge': 'Beira D\'água'
  };
  
  return translations[habitat.toLowerCase()] || capitalize(habitat);
}

export function translateStat(stat: string, lang: 'pt' | 'en'): string {
  if (lang === 'en') {
    const translationsEn: Record<string, string> = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Attack',
      'special-defense': 'Sp. Defense',
      'speed': 'Speed'
    };
    return translationsEn[stat.toLowerCase()] || capitalize(stat);
  }
  
  const translationsPt: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Atq. Especial',
    'special-defense': 'Def. Especial',
    'speed': 'Velocidade'
  };
  return translationsPt[stat.toLowerCase()] || capitalize(stat);
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) return text;
    
    const data = await response.json();
    if (data && data[0] && Array.isArray(data[0])) {
      return data[0].map((segment: any) => segment[0]).join('');
    }
    return text;
  } catch (error) {
    console.error('Erro na tradução:', error);
    return text;
  }
}
