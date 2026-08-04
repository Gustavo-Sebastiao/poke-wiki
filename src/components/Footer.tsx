"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

function PokeballIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <path d="M2 16a14 14 0 0 1 28 0Z" fill="#ef4444" />
      <rect x="2" y="13.5" width="28" height="5" fill="currentColor" />
      <circle cx="16" cy="16" r="5.5" fill="#fff" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="2" fill="#fff" />
    </svg>
  );
}

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row h-auto sm:h-24 min-h-24 items-center justify-center sm:justify-between gap-3 px-6 py-6 sm:py-0 pl-20 sm:pl-6">
        <p className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 text-center sm:text-left">
          <PokeballIcon className="h-5 w-5 shrink-0 text-slate-800 dark:text-white" />
          <span>
            {t.taglineStart}{' '}
            <a
              href="https://pokeapi.co"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:text-[#34cdb9] dark:hover:text-[#59F7E2]"
            >
              PokeAPI
            </a>
            {t.taglineEnd}
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t.madeBy}</span>
          <a
            href="https://github.com/Gustavo-Sebastiao"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:text-[#34cdb9] dark:hover:text-[#59F7E2]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            Gustavo-Sebastiao
          </a>
        </div>
      </div>
    </footer>
  );
}
