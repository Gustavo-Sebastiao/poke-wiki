async function getEvolutions(pokemonName, speciesName, chainUrl) {
    const res = await fetch(chainUrl);
    const data = await res.json();
    const chain = data.chain;

    // Helper to traverse and build all possible form paths
    function buildPaths(node, currentPath) {
        // currentPath is array of form names
        // But wait! The form is determined by the EDGE.
        if (!node.evolves_to || node.evolves_to.length === 0) {
            return [currentPath];
        }
        
        let paths = [];
        for (const child of node.evolves_to) {
            const details = child.evolution_details.length > 0 ? child.evolution_details : [{}];
            for (const detail of details) {
                const baseForm = detail.base_form?.name || node.species.name;
                const evolvedForm = detail.evolved_form?.name || child.species.name;
                
                // We must update the last element of currentPath to be baseForm, 
                // because a branch might require a specific regional base form!
                const newPath = [...currentPath];
                newPath[newPath.length - 1] = baseForm;
                newPath.push(evolvedForm);
                
                paths.push(...buildPaths(child, newPath));
            }
        }
        return paths;
    }

    const allPaths = buildPaths(chain, [chain.species.name]);
    
    // Find paths that contain the pokemonName exactly
    let matchingPaths = allPaths.filter(p => p.includes(pokemonName));
    
    // Fallback: if pokemonName is a regional form but not in the tree explicitly 
    // (e.g. Alolan Raichu is "raichu-alola", but the tree might just say "raichu" if it's not a branch)
    // Wait, if it's Alolan Raichu, the base form is "pikachu". It evolves into "raichu-alola" ONLY in Alola, 
    // so PokeAPI DOES specify "raichu-alola" in evolved_form!
    // But what if it doesn't? Let's fallback to speciesName.
    if (matchingPaths.length === 0) {
        matchingPaths = allPaths.filter(p => p.includes(speciesName));
        // If we fallback to species, and the pokemonName has a regional suffix, 
        // we should probably replace the speciesName with pokemonName in the path.
        matchingPaths = matchingPaths.map(p => p.map(f => f === speciesName ? pokemonName : f));
    }
    
    // Flatten and deduplicate
    const finalSet = new Set();
    for (const p of matchingPaths) {
        for (const f of p) {
            finalSet.add(f);
        }
    }
    
    console.log(`\n--- Evolutions for ${pokemonName} ---`);
    console.log(Array.from(finalSet).join(' -> '));
}

(async () => {
    await getEvolutions('perrserker', 'perrserker', 'https://pokeapi.co/api/v2/evolution-chain/22/');
    await getEvolutions('meowth', 'meowth', 'https://pokeapi.co/api/v2/evolution-chain/22/');
    await getEvolutions('meowth-galar', 'meowth', 'https://pokeapi.co/api/v2/evolution-chain/22/');
    await getEvolutions('raticate-alola', 'raticate', 'https://pokeapi.co/api/v2/evolution-chain/7/');
    await getEvolutions('rattata', 'rattata', 'https://pokeapi.co/api/v2/evolution-chain/7/');
    await getEvolutions('eevee', 'eevee', 'https://pokeapi.co/api/v2/evolution-chain/67/');
    await getEvolutions('vaporeon', 'vaporeon', 'https://pokeapi.co/api/v2/evolution-chain/67/');
    await getEvolutions('raichu-alola', 'raichu', 'https://pokeapi.co/api/v2/evolution-chain/10/');
    await getEvolutions('cubone', 'cubone', 'https://pokeapi.co/api/v2/evolution-chain/46/');
    await getEvolutions('marowak-alola', 'marowak', 'https://pokeapi.co/api/v2/evolution-chain/46/');
})();
