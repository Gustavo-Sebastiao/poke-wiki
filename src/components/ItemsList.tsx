"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, X, ChevronDown } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { Item } from '@/lib/itemService';
import PikachuNotFound from '@/assets/icons/nao_encontrado_pikachu.png';
import ItemModal from './ItemModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';
import Fuse from 'fuse.js';
import { rankFuzzyResults } from '@/lib/fuzzySearch';

function ItemCardComponent({ item, tCategory, tRarity, handleSelectItem }: any) {
  const { translatedText, loading } = useDynamicTranslation(item.description || '');

  return (
    <div 
      onClick={() => handleSelectItem(item)}
      className="group relative flex flex-col items-center justify-start bg-white dark:bg-slate-800 rounded-[2rem] p-4 sm:p-6 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#59F7E2] dark:hover:border-[#59F7E2] transition-all duration-300 cursor-pointer h-full"
    >
      {/* Rarity Badge */}
      <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase shadow-sm opacity-80 group-hover:opacity-100 transition-opacity
        ${item.rarity === 'Único' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
          item.rarity === 'Épico' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
          item.rarity === 'Raro' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
          item.rarity === 'Incomum' ? 'bg-green-100 text-green-700 border border-green-200' :
          'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-700 dark:text-slate-300'
        }
      `}>
        {tRarity[item.rarity] || item.rarity}
      </div>

      <div className="relative w-16 h-16 md:w-20 md:h-20 mt-4 mb-4 transition-transform group-hover:scale-110 shrink-0">
        <Image
          src={item.image_url}
          alt={item.name}
          fill sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain filter drop-shadow-md"
          unoptimized
        />
      </div>
      
      <div className="text-center w-full flex flex-col flex-1">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{tCategory[item.category] || item.category}</p>
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 capitalize mb-3 line-clamp-1">
          {item.name}
        </h3>
        <p className={`text-sm text-slate-500 dark:text-slate-400 line-clamp-3 italic flex-1 ${loading ? 'animate-pulse bg-slate-200 dark:bg-slate-700 h-10 rounded' : ''}`}>
          {!loading && `"${translatedText}"`}
        </p>
      </div>
    </div>
  );
}

interface ItemsListProps {
  initialItems: Item[];
}

const ITEMS_PER_PAGE = 50;

const RARITIES = ['Comum', 'Incomum', 'Raro', 'Épico', 'Único'];
const CATEGORIES = ['Pokébolas', 'Medicina', 'Batalha', 'Evolução', 'Comida', 'Chaves e Especiais', 'Outros'];

export default function ItemsList({ initialItems }: ItemsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language].filters;
  const tRarity = translations[language].rarities as any;
  const tCategory = translations[language].itemCategories as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const selectedItemId = searchParams.get('item');
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return initialItems.find(i => i.id.toString() === selectedItemId) || null;
  }, [selectedItemId, initialItems]);

  const handleSelectItem = (item: Item) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('item', item.id.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('item');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const itemSearch = useMemo(() => new Fuse(initialItems, {
    keys: [
      { name: 'name', weight: 0.85 },
      { name: 'category', weight: 0.15 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  }), [initialItems]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev => 
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
    setCurrentPage(1);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
    setCurrentPage(1);
  };

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim();
    let items = query
      ? rankFuzzyResults(itemSearch.search(query), query, (item) => item.name)
          .map(({ item }) => item)
      : initialItems;

    if (query) {
      const exactIdMatch = initialItems.find((item) => item.id.toString() === query);
      if (exactIdMatch && items[0]?.id !== exactIdMatch.id) {
        items = [exactIdMatch, ...items.filter((item) => item.id !== exactIdMatch.id)];
      }
    }

    if (selectedRarities.length > 0) {
      items = items.filter(item => selectedRarities.includes(item.rarity));
    }

    if (selectedCategories.length > 0) {
      items = items.filter(item => selectedCategories.includes(item.category));
    }

    return items;
  }, [initialItems, itemSearch, searchTerm, selectedRarities, selectedCategories]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={handleCloseModal} />
      )}

      {/* Mobile Search & Filters Row */}
      <div className="relative z-20 mb-6 flex w-full items-center gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
          aria-label={t.filtersLabel}
        >
          <Filter className="h-4 w-4" />
          <span>{t.filtersLabel}</span>
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            type="text"
            aria-label={t.searchItem}
            placeholder={t.searchItem}
            value={searchTerm}
            onChange={handleSearch}
            className="h-11 w-full min-w-0 rounded-none border-0 border-b-2 border-slate-800 bg-transparent px-2 pr-10 text-base font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-500 focus:border-[#59F7E2] focus:ring-0 dark:border-slate-300 dark:text-slate-100 dark:placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label={t.clear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!searchTerm && (
            <Search className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700 dark:text-slate-200" />
          )}
        </div>
      </div>

      {/* Desktop Filters Bar */}
      <div className="hidden md:flex flex-row flex-wrap items-center gap-3 mb-8 relative" ref={menuRef}>
        <div className="relative w-[240px]">
          <input
            type="text"
            aria-label={t.searchItem}
            placeholder={t.searchItem}
            value={searchTerm}
            onChange={handleSearch}
            className="h-11 w-full rounded-none border-0 border-b-2 border-slate-800 bg-transparent px-2 pr-9 text-sm font-semibold text-slate-700 outline-none transition-colors placeholder:text-slate-500 focus:border-[#59F7E2] focus:ring-0 dark:border-slate-300 dark:text-slate-200 dark:placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              aria-label={t.clear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {!searchTerm && (
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-700 dark:text-slate-200" />
          )}
        </div>

        {/* Dropdown Categoria */}
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
            className={`w-full px-4 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-full text-sm font-semibold transition-all flex items-center justify-between md:justify-center gap-2 shadow-md border-2 md:hover:scale-105 whitespace-nowrap ${openDropdown === 'category' ? 'border-[#59F7E2] bg-teal-50/50 dark:bg-teal-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            {selectedCategories.length > 0 ? `${selectedCategories.length} ${t.categories}` : t.allCategories}
            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'category' && (
            <div className="absolute z-50 flex flex-col animate-fade-in-down bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-2xl md:top-14 md:left-0 md:w-[300px]">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">{t.category}</h3>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {CATEGORIES.map(category => (
                  <label key={category} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#59F7E2] focus:ring-[#59F7E2] transition-all cursor-pointer"
                    />
                    <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 transition-colors font-medium text-sm">
                      {tCategory[category] || category}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Raridade */}
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'rarity' ? null : 'rarity')}
            className={`w-full px-4 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-full text-sm font-semibold transition-all flex items-center justify-between md:justify-center gap-2 shadow-md border-2 md:hover:scale-105 whitespace-nowrap ${openDropdown === 'rarity' ? 'border-[#59F7E2] bg-teal-50/50 dark:bg-teal-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            {selectedRarities.length > 0 ? `${selectedRarities.length} ${t.selected}` : t.anyRarity}
            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${openDropdown === 'rarity' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'rarity' && (
            <div className="absolute z-50 flex flex-col animate-fade-in-down bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-2xl md:top-14 md:left-0 md:w-[240px]">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">{t.rarity}</h3>
              <div className="flex flex-col gap-2">
                {RARITIES.map(rarity => (
                  <label key={rarity} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedRarities.includes(rarity)}
                      onChange={() => toggleRarity(rarity)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-400 focus:ring-amber-400 transition-all cursor-pointer"
                    />
                    <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 transition-colors font-medium text-sm">
                      {tRarity[rarity] || rarity}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão Limpar Filtros */}
        {(selectedCategories.length > 0 || selectedRarities.length > 0) && (
          <button 
            onClick={() => { setSelectedCategories([]); setSelectedRarities([]); setCurrentPage(1); }}
            className="px-4 py-2 text-sm font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors ml-auto md:ml-0"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/40 backdrop-blur-sm md:hidden animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowMobileFilters(false)}></div>
          
          <div className="relative mt-auto h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Filtros</h2>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-8 custom-scrollbar">
              {/* Categoria */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t.category}</h3>
                <div className="flex flex-col gap-3">
                  {CATEGORIES.map(category => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-[#59F7E2] focus:ring-[#59F7E2] transition-all cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-base">
                        {tCategory[category] || category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Raridade */}
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t.rarity}</h3>
                <div className="flex flex-col gap-3">
                  {RARITIES.map(rarity => (
                    <label key={rarity} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700">
                      <input 
                        type="checkbox" 
                        checked={selectedRarities.includes(rarity)}
                        onChange={() => toggleRarity(rarity)}
                        className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-amber-400 focus:ring-amber-400 transition-all cursor-pointer"
                      />
                      <span className="text-slate-700 dark:text-slate-200 font-medium text-base">
                        {tRarity[rarity] || rarity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Footer Buttons */}
            <div className="flex-none p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] flex gap-4 mt-auto">
               {(selectedCategories.length > 0 || selectedRarities.length > 0) && (
                  <button 
                    onClick={() => { setSelectedCategories([]); setSelectedRarities([]); setCurrentPage(1); }}
                    className="flex-[0.8] py-4 border-2 border-red-400 text-red-500 rounded-2xl font-bold transition-all hover:bg-red-50 active:scale-95 text-lg"
                  >
                    {t.clear}
                  </button>
               )}
               <button 
                 onClick={() => setShowMobileFilters(false)} 
                 className="flex-[1.2] py-4 bg-[#59F7E2] hover:bg-[#4de0cc] text-slate-900 rounded-2xl font-bold shadow-md transition-all active:scale-95 text-lg"
               >
                 {t.seeResults}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Itens */}
      {paginatedItems.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedItems.map((item) => (
              <ItemCardComponent 
                key={item.id} 
                item={item} 
                tCategory={tCategory} 
                tRarity={tRarity} 
                handleSelectItem={handleSelectItem} 
              />
            ))}
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1 overflow-x-auto max-w-xs px-2 py-1 scrollbar-hide">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-10 h-10 flex items-center justify-center shrink-0 transition-all font-bold ${
                          currentPage === page 
                            ? 'text-slate-900 dark:text-white text-xl scale-110' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2 py-2 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800 rounded-3xl shadow-soft mt-8">
          <Image src={PikachuNotFound} alt="Pikachu não encontrado" width={200} height={200} className="mb-6 opacity-90 drop-shadow-md hover:scale-105 transition-transform" />
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2 text-center">{t.noItem}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-center mb-4">{t.tryAnother}</p>
          {(searchTerm || selectedCategories.length > 0 || selectedRarities.length > 0) && (
            <button 
              onClick={() => { setSelectedCategories([]); setSelectedRarities([]); setSearchTerm(''); setCurrentPage(1); }}
              className="px-6 py-2 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-colors mt-2"
            >
              {t.clearSearch || "Limpar Pesquisa"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
