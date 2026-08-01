import { supabase } from './supabaseAdmin.mjs';
import translate from 'translate';

translate.engine = 'google';

function isProbablyEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const enWords = [' the ', ' is ', ' a ', ' an ', ' it ', ' of ', ' to ', ' in ', ' and ', ' that '];
  return enWords.some(word => lower.includes(word)) || (lower.startsWith('the ') || lower.startsWith('it '));
}

async function runTranslation() {
  console.log('Fetching all pokemons from DB with pagination...');
  
  let allData = [];
  let from = 0;
  const limit = 500;
  
  while (true) {
    const { data, error } = await supabase
      .from('pokemons')
      .select('id, name, description')
      .range(from, from + limit - 1);
      
    if (error) {
      console.error('Error fetching pokemons:', error);
      return;
    }
    
    if (!data || data.length === 0) break;
    
    allData = [...allData, ...data];
    
    if (data.length < limit) break;
    from += limit;
  }
  
  console.log(`Found ${allData.length} pokemons in total.`);
  
  const toTranslate = allData.filter(p => isProbablyEnglish(p.description));
  console.log(`Found ${toTranslate.length} pokemons that appear to have English descriptions.`);

  if (toTranslate.length === 0) {
    console.log('No more pokemons to translate!');
    return;
  }

  const BATCH_SIZE = 20;
  
  for (let i = 0; i < toTranslate.length; i += BATCH_SIZE) {
    const batch = toTranslate.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${i / BATCH_SIZE + 1} of ${Math.ceil(toTranslate.length / BATCH_SIZE)}...`);
    
    await Promise.all(batch.map(async (pokemon) => {
      try {
        const translated = await translate(pokemon.description, { to: 'pt' });
        
        const { error: updateError } = await supabase
          .from('pokemons')
          .update({ description: translated })
          .eq('id', pokemon.id);
          
        if (updateError) {
          console.error(`Failed to update ${pokemon.name}:`, updateError.message);
        }
      } catch (err) {
        console.error(`Failed to translate ${pokemon.name}:`, err.message);
      }
    }));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Translation complete for remaining!');
}

runTranslation();
