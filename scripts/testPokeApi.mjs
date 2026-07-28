async function test(name) {
  const formattedName = name.toLowerCase().replace(/\s+/g, '-');
  console.log(`Testing: ${name} -> ${formattedName}`);
  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${formattedName}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${formattedName}`)
  ]);
  console.log('Pokemon:', pokemonRes.ok);
  console.log('Species:', speciesRes.ok);
  if (speciesRes.ok) {
    const sData = await speciesRes.json();
    console.log('Generation:', sData.generation?.name);
    console.log('Evo Chain URL:', sData.evolution_chain?.url);
    if (sData.evolution_chain?.url) {
      const evoRes = await fetch(sData.evolution_chain.url);
      console.log('Evo:', evoRes.ok);
    }
  }
}

async function run() {
  await test('Pikachu');
  await test('Nidoran♀');
  await test('Mr. Mime');
  await test('Farfetch\'d');
}

run();
