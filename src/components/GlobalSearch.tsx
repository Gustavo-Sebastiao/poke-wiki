'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Search, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface SearchResult {
  id: string | number;
  name: string;
  image_url: string;
  type: 'pokemon' | 'item';
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const t = translations[language].filters;

  // Fecha o dropdown quando clica fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce para a busca na API
  useEffect(() => {
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error(err);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const updateQuery = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    updateQuery('');
    
    if (result.type === 'pokemon') {
      router.push(`/pokedex?pokemon=${result.id}`);
    } else {
      router.push(`/itens?item=${result.id}`);
    }
  };

  return (
    <>
      <div className="relative flex w-full justify-end md:block" ref={searchRef}>
        
        {/* Ícone de Lupa no Mobile (Sem input, sem borda, sem fundo) */}
        <button 
          onClick={() => setShowMobileOverlay(true)}
          className="md:hidden p-2 text-slate-800 dark:text-white"
          aria-label={t.searchGlobal}
        >
          <Search className="w-6 h-6" />
        </button>

        {/* Search Input Desktop */}
        <div className="relative group hidden md:block">
          <input 
            type="text"
            aria-label={t.searchGlobal}
            placeholder={t.searchGlobal}
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            className="w-full rounded-full border border-slate-200 bg-white/90 py-2.5 pl-10 pr-10 text-sm font-medium text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-500 hover:border-slate-300 focus:border-[#59F7E2] focus:ring-2 focus:ring-[#59F7E2]/25 dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:placeholder:text-slate-400 dark:hover:border-slate-600"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 pointer-events-none" />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400 animate-spin" />
          )}
        </div>

        {/* Dropdown de Resultados Desktop */}
        {isOpen && results.length > 0 && !showMobileOverlay && (
          <div className="absolute top-full mt-1 right-0 w-full md:w-[320px] bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-fade-in-down rounded-none hidden md:block">
            <div 
              className="max-h-[300px] overflow-y-auto overscroll-contain custom-scrollbar"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {results.map((result, idx) => (
                <div 
                  key={`${result.type}-${result.id}-${idx}`}
                  onClick={() => handleResultClick(result)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-0 group"
                >
                  <div className="relative w-12 h-12 shrink-0 bg-transparent p-1 overflow-hidden transition-colors">
                    <Image 
                      src={result.image_url} 
                      alt={result.name}
                      fill sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <span className="font-bold text-slate-800 dark:text-slate-100 capitalize truncate transition-colors">
                      {result.name}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {result.type === 'pokemon' ? 'Pokémon' : 'Item'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sem resultados Desktop */}
        {isOpen && query.length >= 2 && results.length === 0 && !isSearching && !showMobileOverlay && (
          <div className="absolute top-full mt-1 right-0 w-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-fade-in-down text-center rounded-none hidden md:block">
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.noResults}</p>
          </div>
        )}
      </div>

      {/* Overlay de Busca Mobile */}
      {showMobileOverlay && (
        <div className="fixed inset-0 z-[999] flex flex-col bg-white dark:bg-slate-900 md:hidden animate-fade-in">
          <div className="flex-none border-b border-slate-200 px-4 pb-4 pt-3 dark:border-slate-800">
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowMobileOverlay(false);
                  updateQuery('');
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label={t.closeSearch}
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t.globalSearchTitle}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.globalSearchHint}</p>
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                aria-label={t.searchGlobal}
                placeholder={t.searchGlobal}
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                className="h-12 w-full rounded-full border border-slate-200 bg-slate-50 pl-12 pr-12 text-base font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-[#59F7E2] focus:bg-white focus:ring-2 focus:ring-[#59F7E2]/25 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:bg-slate-800"
              />
              {isSearching ? (
                <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-slate-400" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => updateQuery('')}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  aria-label={t.clear}
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {query.length >= 2 ? (
              results.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                  {results.map((result, idx) => (
                    <button
                      type="button"
                      key={`mob-${result.type}-${result.id}-${idx}`}
                      onClick={() => {
                        setShowMobileOverlay(false);
                        handleResultClick(result);
                      }}
                      className="flex w-full items-center gap-4 border-b border-slate-100 p-3 text-left transition-colors last:border-0 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700/50 dark:active:bg-slate-700"
                    >
                      <div className="relative h-14 w-14 shrink-0 p-1">
                        <Image
                          src={result.image_url}
                          alt={result.name}
                          fill sizes="56px"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <span className="min-w-0 font-bold capitalize text-slate-800 dark:text-slate-100">
                        <span className="block truncate">{result.name}</span>
                        <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                          {result.type === 'pokemon' ? 'Pokémon' : 'Item'}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="flex flex-col items-center justify-center pt-20 text-center">
                  <Search className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <p className="font-medium text-slate-500 dark:text-slate-400">{t.noResultsQuery} &quot;{query}&quot;</p>
                </div>
              ) : null
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 text-center">
                <Search className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                <p className="max-w-xs font-medium text-slate-500 dark:text-slate-400">{t.typeMore}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
