async function checkSpecies() {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/venusaur-mega`);
  const data = await res.json();
  console.log('Species URL:', data.species.url);
}
checkSpecies();
