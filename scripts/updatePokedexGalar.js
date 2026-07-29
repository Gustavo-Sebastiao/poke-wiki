const fs = require('fs');

let content = fs.readFileSync('src/components/PokedexList.tsx', 'utf8');

// State
content = content.replace(
  'const [showAlolas, setShowAlolas] = useState(false);',
  'const [showAlolas, setShowAlolas] = useState(false);\n  const [showGalar, setShowGalar] = useState(false);'
);

// URL parsing
content = content.replace(
  'if (parsed.showAlolas !== undefined) setShowAlolas(parsed.showAlolas === \'true\');',
  'if (parsed.showAlolas !== undefined) setShowAlolas(parsed.showAlolas === \'true\');\n      if (parsed.showGalar !== undefined) setShowGalar(parsed.showGalar === \'true\');'
);

// URL updating
content = content.replace(
  'if (showAlolas) params.set(\'showAlolas\', \'true\');',
  'if (showAlolas) params.set(\'showAlolas\', \'true\');\n      if (showGalar) params.set(\'showGalar\', \'true\');'
);

// Dependencies URL
content = content.replace(
  'showMegas, showAlolas, sortOrder, isInitialized]);',
  'showMegas, showAlolas, showGalar, sortOrder, isInitialized]);'
);

// Filtering logic
const oldFilter = `      const isMega = isForm && (name.includes('mega') || name.includes('primal'));
      const isAlola = isForm && name.includes('alola');

      if (!showMegas && !showAlolas) return !isForm;
      if (showMegas && showAlolas) return isMega || isAlola;
      if (showMegas) return isMega;
      if (showAlolas) return isAlola;
      
      return true;`;

const newFilter = `      const isMega = isForm && (name.includes('mega') || name.includes('primal'));
      const isAlola = isForm && name.includes('alola');
      const isGalar = isForm && name.includes('galar');

      const showAnyForm = showMegas || showAlolas || showGalar;
      if (!showAnyForm) return !isForm;
      
      return (showMegas && isMega) || (showAlolas && isAlola) || (showGalar && isGalar);`;

content = content.replace(oldFilter, newFilter);

// Dependencies sortedPokemons
content = content.replace(
  'filteredPokemons, showMegas, showAlolas, sortOrder]);',
  'filteredPokemons, showMegas, showAlolas, showGalar, sortOrder]);'
);

// Subtitle label
const oldSubtitle = `{(showMegas || showAlolas) ? \`Exibindo \${[showMegas && 'Megas', showAlolas && 'Alolas'].filter(Boolean).join(' e ')}\` : 'Outras opções'}`;
const newSubtitle = `{(showMegas || showAlolas || showGalar) ? \`Exibindo \${[showMegas && 'Megas', showAlolas && 'Alola', showGalar && 'Galar'].filter(Boolean).join(' e ')}\` : 'Outras opções'}`;
content = content.replace(oldSubtitle, newSubtitle);

// Toggles rename Alola -> Região de Alola
content = content.replaceAll('label="Formas de Alola"', 'label="Região de Alola"');
content = content.replaceAll('label="Exibir Formas de Alola"', 'label="Região de Alola"');

// Mobile toggle add Galar
content = content.replace(
  '<ToggleSwitch label="Região de Alola" checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />',
  '<ToggleSwitch label="Região de Alola" checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />\n              <ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />'
);

// Desktop toggle add Galar
content = content.replace(
  '<ToggleSwitch label="Região de Alola" checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />',
  '<ToggleSwitch label="Região de Alola" checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />\n                <ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />'
);

// Clear filters conditions
content = content.replaceAll(
  '|| showMegas || showAlolas ||',
  '|| showMegas || showAlolas || showGalar ||'
);

// Clear filters actions
content = content.replaceAll(
  'setShowMegas(false); setShowAlolas(false);',
  'setShowMegas(false); setShowAlolas(false); setShowGalar(false);'
);

fs.writeFileSync('src/components/PokedexList.tsx', content);
