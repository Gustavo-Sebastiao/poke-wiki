import { supabase } from './supabaseAdmin.mjs';
import translate from 'translate';

translate.engine = 'google';

// Simple heuristic to check if text might be in Portuguese
// Just checking if common Portuguese words/particles are present.
// However, since we know descriptions were fetched from EN if PT was not available,
// we can translate all of them, but to save time, we will only translate those that don't look Portuguese.
// The PokeAPI description in PT often contains ' um ', ' é ', ' não ', ' e ', ' o ', ' a ', ' os ', ' as '.
// But translating everything might be safer if we just check if it contains typical English words.
function isProbablyEnglish(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  const enWords = [' the ', ' is ', ' a ', ' an ', ' it ', ' of ', ' to ', ' in ', ' and ', ' that '];
  return enWords.some(word => lower.includes(word)) || (lower.startsWith('the ') || lower.startsWith('it '));
}

async function runTranslation() {
  console.log('Fetching all pokemons from DB...');
  const { data, error } = await supabase.from('pokemons').select('id, name, description');
  
  if (error) {
    console.error('Error fetching pokemons:', error);
    return;
  }
  
  console.log(`Found ${data.length} pokemons in total.`);
  
  const toTranslate = data.filter(p => isProbablyEnglish(p.description));
  console.log(`Found ${toTranslate.length} pokemons that appear to have English descriptions.`);

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
    
    // Slight delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('Translation complete!');
}

runTranslation();
