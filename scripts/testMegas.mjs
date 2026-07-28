async function testMegas() {
  const megasToTest = ['venusaur-mega', 'charizard-mega-x', 'charizard-mega-y', 'blastoise-mega', 'mewtwo-mega-x', 'gengar-mega'];
  for (const mega of megasToTest) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${mega}`);
      if (!res.ok) {
        console.log(`${mega}: NOT FOUND`);
        continue;
      }
      const data = await res.json();
      const officialArtwork = data.sprites?.other?.['official-artwork']?.front_default;
      console.log(`${mega}: ${officialArtwork ? 'HAS IMAGE' : 'NO IMAGE'} -> ${officialArtwork}`);
    } catch (e) {
      console.error(e.message);
    }
  }
}
testMegas();
