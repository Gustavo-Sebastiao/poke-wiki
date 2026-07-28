import fs from 'fs';

const filePath = 'src/components/HomeCarousel.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Colors
content = content.replace(/bg-white\b(?!\/)/g, 'bg-white dark:bg-slate-900');
content = content.replace(/bg-white\/50/g, 'bg-white/50 dark:bg-slate-800/50');

// Texts
content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-white');
content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-100');
content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-400/g, 'text-slate-400 dark:text-slate-500');

// Borders
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');

// Backgrounds
content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-800');

fs.writeFileSync(filePath, content);
console.log('Successfully added dark mode variants to HomeCarousel.tsx');
