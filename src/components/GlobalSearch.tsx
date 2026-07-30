'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface SearchResult {
  id: number;
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
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    if (result.type === 'pokemon') {
      router.push(`/pokedex?pokemon=${result.id}`);
    } else {
      router.push(`/itens?item=${result.id}`);
    }
  };

  return (
    <>
      <div className="relative w-full max-w-[240px] md:max-w-[300px] flex justify-end md:block" ref={searchRef}>
        
        {/* Ícone de Lupa no Mobile (Sem input, sem borda, sem fundo) */}
        <button 
          onClick={() => setShowMobileOverlay(true)}
          className="md:hidden p-2 text-slate-800 dark:text-white"
        >
          <Search className="w-6 h-6" />
        </button>

        {/* Search Input Desktop (Apenas uma linha) */}
        <div className="relative group hidden md:block">
          <input 
            type="text"
            placeholder={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            className="w-full pl-0 pr-8 py-2 bg-transparent border-b-2 border-black/30 dark:border-white/30 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors text-sm font-medium rounded-none"
          />
          {isSearching ? (
            <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 dark:text-white animate-spin" />
          ) : (
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800 dark:text-white pointer-events-none" />
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
        <div className="fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg z-[999] flex flex-col md:hidden animate-fade-in">
          {/* Header do Overlay */}
          <div className="flex-none flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => {
                setShowMobileOverlay(false);
                setQuery('');
              }} 
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <div className="flex-1 relative flex items-center">
              <input 
                autoFocus
                type="text" 
                placeholder={t.searchGlobal}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-lg font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 text-center"
              />
              {isSearching && (
                <Loader2 className="absolute right-2 w-5 h-5 text-slate-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Resultados Mobile */}
          <div className="flex-1 overflow-y-auto px-2 py-4">
            {query.length >= 2 ? (
              results.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {results.map((result, idx) => (
                    <div 
                      key={`mob-${result.type}-${result.id}-${idx}`}
                      onClick={() => {
                        setShowMobileOverlay(false);
                        handleResultClick(result);
                      }}
                      className="flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform cursor-pointer"
                    >
                      <div className="relative w-16 h-16 shrink-0 p-1">
                        <Image 
                          src={result.image_url} 
                          alt={result.name}
                          fill sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100 capitalize text-lg">
                        {result.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : !isSearching ? (
                <div className="flex flex-col items-center justify-center pt-20 opacity-50">
                  <Search className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-slate-500 font-medium text-center">{t.noResultsQuery} "{query}"</p>
                </div>
              ) : null
            ) : (
              <div className="flex flex-col items-center justify-center pt-20 opacity-30">
                <Search className="w-16 h-16 text-slate-400 mb-4" />
                <p className="text-slate-500 font-medium text-center px-8">{t.typeMore}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
