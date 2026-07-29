const fs = require('fs');

const content = fs.readFileSync('src/components/PokedexList.tsx', 'utf8');
const lines = content.split('\n');

// The mobile duplicate is around line 458
// Let's find the exact lines
let firstIdx = -1;
let secondIdx = -1;
let thirdIdx = -1;

lines.forEach((l, i) => {
    if (l.includes('Região de Galar')) {
        if (firstIdx === -1) firstIdx = i;
        else if (secondIdx === -1) secondIdx = i;
        else thirdIdx = i;
    }
});

if (secondIdx !== -1 && thirdIdx === -1) {
    // There are 2 Galar toggles. 
    // Wait, if secondIdx is near firstIdx, they are duplicated on mobile!
    if (secondIdx === firstIdx + 1) {
        lines.splice(secondIdx, 1);
        
        // Now find the desktop Alola toggle
        const alolaDesktopIdx = lines.findIndex((l, i) => i > 500 && l.includes('Região de Alola'));
        if (alolaDesktopIdx !== -1) {
            lines.splice(alolaDesktopIdx + 1, 0, '              <ToggleSwitch label="Região de Galar" checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />');
        }
    }
}

fs.writeFileSync('src/components/PokedexList.tsx', lines.join('\n'));
