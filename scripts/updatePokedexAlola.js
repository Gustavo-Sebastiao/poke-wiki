const fs = require('fs');

let content = fs.readFileSync('src/components/PokedexList.tsx', 'utf8');

// State
content = content.replace(
  'const [showMegas, setShowMegas] = useState(false);',
  'const [showMegas, setShowMegas] = useState(false);\n  const [showAlolas, setShowAlolas] = useState(false);'
);

// URL parsing
content = content.replace(
  'if (parsed.showMegas !== undefined) setShowMegas(parsed.showMegas === \'true\');',
  'if (parsed.showMegas !== undefined) setShowMegas(parsed.showMegas === \'true\');\n      if (parsed.showAlolas !== undefined) setShowAlolas(parsed.showAlolas === \'true\');'
);

// Fallback if not found:
if (!content.includes('parsed.showMegas === \'true\'')) {
  content = content.replace(
    'if (parsed.showMegas !== undefined) setShowMegas(parsed.showMegas);',
    'if (parsed.showMegas !== undefined) setShowMegas(parsed.showMegas === \'true\');\n      if (parsed.showAlolas !== undefined) setShowAlolas(parsed.showAlolas === \'true\');'
  );
}


// URL updating
content = content.replace(
  'if (showMegas) params.set(\'showMegas\', \'true\');',
  'if (showMegas) params.set(\'showMegas\', \'true\');\n      if (showAlolas) params.set(\'showAlolas\', \'true\');'
);

// Dependencies URL
content = content.replace(
  'showMegas, sortOrder, isInitialized]);',
  'showMegas, showAlolas, sortOrder, isInitialized]);'
);

// Filtering logic
content = content.replace(
  /result = result\.filter\(p => \{\s*const id = getPokemonIdFromUrl\(p\.image_url\) \|\| 0;\s*const isMega = id >= 10000;\s*return showMegas \? isMega : !isMega;\s*\}\);/,
  `result = result.filter(p => {
      const id = getPokemonIdFromUrl(p.image_url) || 0;
      const isForm = id >= 10000;
      const name = p.name.toLowerCase();
      const isMega = isForm && (name.includes('mega') || name.includes('primal'));
      const isAlola = isForm && name.includes('alola');

      if (!showMegas && !showAlolas) return !isForm;
      if (showMegas && showAlolas) return isMega || isAlola;
      if (showMegas) return isMega;
      if (showAlolas) return isAlola;
      
      return true;
    });`
);

// Dependencies sortedPokemons
content = content.replace(
  'filteredPokemons, showMegas, sortOrder]);',
  'filteredPokemons, showMegas, showAlolas, sortOrder]);'
);

// Subtitle label
content = content.replace(
  '{showMegas ? \'Exibindo Megas\' : \'Outras opções\'}',
  '{(showMegas || showAlolas) ? `Exibindo ${[showMegas && \'Megas\', showAlolas && \'Alolas\'].filter(Boolean).join(\' e \')}` : \'Outras opções\'}'
);

// Mobile toggle
content = content.replace(
  '<ToggleSwitch label="Mega evoluções" checked={showMegas} onChange={() => { setShowMegas(!showMegas); setCurrentPage(1); }} />',
  '<ToggleSwitch label="Mega evoluções" checked={showMegas} onChange={() => { setShowMegas(!showMegas); setCurrentPage(1); }} />\n              <ToggleSwitch label="Formas de Alola" checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />'
);

// Desktop toggle
content = content.replace(
  '<ToggleSwitch label="Exibir Mega evoluções" checked={showMegas} onChange={() => { setShowMegas(!showMegas); setCurrentPage(1); }} />',
  '<ToggleSwitch label="Exibir Mega evoluções" checked={showMegas} onChange={() => { setShowMegas(!showMegas); setCurrentPage(1); }} />\n              <ToggleSwitch label="Exibir Formas de Alola" checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />'
);

// Clear filters conditions
content = content.replaceAll(
  '|| showMegas ||',
  '|| showMegas || showAlolas ||'
);

// Clear filters actions
content = content.replaceAll(
  'setShowMegas(false);',
  'setShowMegas(false); setShowAlolas(false);'
);

fs.writeFileSync('src/components/PokedexList.tsx', content);
