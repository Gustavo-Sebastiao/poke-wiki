const fs = require('fs');

let content = fs.readFileSync('src/components/PokemonModal.tsx', 'utf8');

const replacement = `                try {
                  const evoRes = await fetch(sData.evolution_chain.url);
                  if (evoRes.ok) {
                    const evoData = await evoRes.json();
                    const chain = evoData.chain;
                    
                    const pName = pokemon.name.toLowerCase().replace(/\\s+/g, '-');
                    const sName = sData.name.toLowerCase();

                    function buildPaths(node, currentPath) {
                      if (!node.evolves_to || node.evolves_to.length === 0) {
                        return [currentPath];
                      }
                      let paths = [];
                      for (const child of node.evolves_to) {
                        const details = child.evolution_details.length > 0 ? child.evolution_details : [{}];
                        for (const detail of details) {
                          const baseForm = detail.base_form?.name || node.species.name;
                          const evolvedForm = detail.evolved_form?.name || child.species.name;
                          
                          const newPath = [...currentPath];
                          newPath[newPath.length - 1] = baseForm;
                          newPath.push(evolvedForm);
                          
                          paths.push(...buildPaths(child, newPath));
                        }
                      }
                      return paths;
                    }

                    const allPaths = buildPaths(chain, [chain.species.name]);
                    let matchingPaths = allPaths.filter(p => p.includes(pName));
                    
                    if (matchingPaths.length === 0) {
                      matchingPaths = allPaths.filter(p => p.includes(sName));
                      matchingPaths = matchingPaths.map(p => p.map(f => f === sName ? pName : f));
                    }

                    const finalSet = new Set();
                    for (const p of matchingPaths) {
                      for (const f of p) {
                        finalSet.add(f);
                      }
                    }

                    const evos = [];
                    for (const form of Array.from(finalSet)) {
                      try {
                        const pRes = await fetch(\`https://pokeapi.co/api/v2/pokemon/\${form}\`);
                        if (pRes.ok) {
                          const pData = await pRes.json();
                          evos.push({
                            name: pData.name.replace(/-/g, ' '),
                            imageUrl: \`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\${pData.id}.png\`
                          });
                        }
                      } catch(e) {}
                    }

                    setEvolutions(evos);
                  }
                } catch (e) {
                  console.error("Erro ao buscar evoluções:", e);
                }`;

// the target code starts at "                try {" and ends at "                } catch (e) {\n                  console.error(\"Erro ao buscar evoluções:\", e);\n                }"

const startStr = "                try {\n                  const evoRes = await fetch(sData.evolution_chain.url);";
const endStr = "                } catch (e) {\n                  console.error(\"Erro ao buscar evoluções:\", e);\n                }";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync('src/components/PokemonModal.tsx', newContent);
    console.log('Success');
} else {
    console.error('Could not find target strings');
}
