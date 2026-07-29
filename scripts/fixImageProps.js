const fs = require('fs');
const path = require('path');

function addSizesAndPriority(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // add sizes to fill
    content = content.replace(/fill\s+className/g, 'fill sizes="(max-width: 768px) 100vw, 33vw" className');
    content = content.replace(/fill\n/g, 'fill sizes="(max-width: 768px) 100vw, 33vw"\n');
    content = content.replace(/fill\r\n/g, 'fill sizes="(max-width: 768px) 100vw, 33vw"\r\n');
    
    // specific priority for NavMenu pokebola
    if (filePath.includes('NavMenu')) {
        content = content.replace(/sizes="\(max-width: 768px\) 100vw, 33vw"\n\s*className="object-contain drop-shadow-md"/g, 'sizes="56px"\n            priority\n            className="object-contain drop-shadow-md"');
    }

    fs.writeFileSync(filePath, content);
}

[
    'src/components/NavMenu.tsx',
    'src/components/TagSelector.tsx',
    'src/components/PokemonCard.tsx',
    'src/components/ItemsList.tsx',
    'src/components/ItemModal.tsx',
    'src/components/GlobalSearch.tsx',
    'src/components/GifGallery.tsx'
].forEach(addSizesAndPriority);

console.log('Fixed Image props');
