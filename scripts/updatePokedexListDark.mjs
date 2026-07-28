import fs from 'fs';

const filePath = 'src/components/PokedexList.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Colors
content = content.replace(/bg-white\b(?!\/)/g, 'bg-white dark:bg-slate-800');
content = content.replace(/bg-white\/95/g, 'bg-white/95 dark:bg-slate-900/95');
content = content.replace(/bg-white\/80/g, 'bg-white/80 dark:bg-slate-900/80');

// Texts
content = content.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-100');
content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-200');
content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-400/g, 'text-slate-400 dark:text-slate-500');

// Borders
content = content.replace(/border-slate-300/g, 'border-slate-300 dark:border-slate-600');
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-700');
content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-700');

// Backgrounds
content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-700');
content = content.replace(/bg-slate-50\b(?!\/)/g, 'bg-slate-50 dark:bg-slate-800/50');

// Specifics
content = content.replace(/bg-teal-50\/50/g, 'bg-teal-50/50 dark:bg-teal-900/30');

fs.writeFileSync(filePath, content);
console.log('Successfully added dark mode variants to PokedexList.tsx');
