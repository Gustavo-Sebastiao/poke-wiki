const fs = require('fs');

let content = fs.readFileSync('src/components/PokedexList.tsx', 'utf8');

// State
content = content.replace(
  'const [showGalar, setShowGalar] = useState(false);',
  'const [showGalar, setShowGalar] = useState(false);\n  const [showHisui, setShowHisui] = useState(false);\n  const [showPaldea, setShowPaldea] = useState(false);'
);

// URL parsing
content = content.replace(
  'if (parsed.showGalar !== undefined) setShowGalar(parsed.showGalar === \'true\');',
  'if (parsed.showGalar !== undefined) setShowGalar(parsed.showGalar === \'true\');\n      if (parsed.showHisui !== undefined) setShowHisui(parsed.showHisui === \'true\');\n      if (parsed.showPaldea !== undefined) setShowPaldea(parsed.showPaldea === \'true\');'
);

// URL updating
content = content.replace(
  'if (showGalar) params.set(\'showGalar\', \'true\');',
  'if (showGalar) params.set(\'showGalar\', \'true\');\n      if (showHisui) params.set(\'showHisui\', \'true\');\n      if (showPaldea) params.set(\'showPaldea\', \'true\');'
);

// Dependencies URL
content = content.replace(
  'showMegas, showAlolas, showGalar, sortOrder, isInitialized]);',
  'showMegas, showAlolas, showGalar, showHisui, showPaldea, sortOrder, isInitialized]);'
);

// Filtering logic
const oldFilter = `      const isMega = isForm && (name.includes('mega') || name.includes('primal'));
      const isAlola = isForm && name.includes('alola');
      const isGalar = isForm && name.includes('galar');

      const showAnyForm = showMegas || showAlolas || showGalar;
      if (!showAnyForm) return !isForm;
      
      return (showMegas && isMega) || (showAlolas && isAlola) || (showGalar && isGalar);`;

const newFilter = `      const isMega = isForm && (name.includes('mega') || name.includes('primal'));
      const isAlola = isForm && name.includes('alola');
      const isGalar = isForm && name.includes('galar');
      const isHisui = isForm && name.includes('hisui');
      const isPaldea = isForm && name.includes('paldea');

      const showAnyForm = showMegas || showAlolas || showGalar || showHisui || showPaldea;
      if (!showAnyForm) return !isForm;
      
      return (showMegas && isMega) || (showAlolas && isAlola) || (showGalar && isGalar) || (showHisui && isHisui) || (showPaldea && isPaldea);`;

content = content.replace(oldFilter, newFilter);

// Dependencies sortedPokemons
content = content.replace(
  'filteredPokemons, showMegas, showAlolas, showGalar, sortOrder]);',
  'filteredPokemons, showMegas, showAlolas, showGalar, showHisui, showPaldea, sortOrder]);'
);

// Subtitle label
const oldSubtitle = `{(showMegas || showAlolas || showGalar) ? \`Exibindo \${[showMegas && 'Megas', showAlolas && 'Alola', showGalar && 'Galar'].filter(Boolean).join(' e ')}\` : 'Outras opções'}`;
const newSubtitle = `{(showMegas || showAlolas || showGalar || showHisui || showPaldea) ? \`Exibindo \${[showMegas && 'Megas', showAlolas && 'Alola', showGalar && 'Galar', showHisui && 'Hisui', showPaldea && 'Paldea'].filter(Boolean).join(' e ')}\` : 'Outras opções'}`;
content = content.replace(oldSubtitle, newSubtitle);

// Mobile toggle add Hisui/Paldea
content = content.replace(
  '<ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />',
  '<ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />\n              <ToggleSwitch label="Região de Hisui" checked={showHisui} onChange={() => { setShowHisui(!showHisui); setCurrentPage(1); }} />\n              <ToggleSwitch label="Região de Paldea" checked={showPaldea} onChange={() => { setShowPaldea(!showPaldea); setCurrentPage(1); }} />'
);

// Desktop toggle add Hisui/Paldea
content = content.replace(
  '<ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />',
  '<ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />\n              <ToggleSwitch label="Região de Hisui" checked={showHisui} onChange={() => { setShowHisui(!showHisui); setCurrentPage(1); }} />\n              <ToggleSwitch label="Região de Paldea" checked={showPaldea} onChange={() => { setShowPaldea(!showPaldea); setCurrentPage(1); }} />'
);

// Clear filters conditions
content = content.replaceAll(
  '|| showMegas || showAlolas || showGalar ||',
  '|| showMegas || showAlolas || showGalar || showHisui || showPaldea ||'
);

// Clear filters actions
content = content.replaceAll(
  'setShowMegas(false); setShowAlolas(false); setShowGalar(false);',
  'setShowMegas(false); setShowAlolas(false); setShowGalar(false); setShowHisui(false); setShowPaldea(false);'
);

fs.writeFileSync('src/components/PokedexList.tsx', content);
