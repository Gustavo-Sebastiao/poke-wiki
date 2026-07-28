'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Image from 'next/image';
import type { Item } from '@/lib/itemService';

interface ItemsListProps {
  initialItems: Item[];
}

const ITEMS_PER_PAGE = 50;

export default function ItemsList({ initialItems }: ItemsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    let items = initialItems;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) || 
        item.id.toString() === lowerSearch
      );
    }

    return items;
  }, [initialItems, searchTerm]);

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
      {/* Search Bar */}
      <div className="sticky top-4 z-40 flex gap-3 mb-6 relative items-stretch max-w-2xl mx-auto md:mr-0 w-full">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Procurar item"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-2 pr-12 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-800 rounded-none text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#59F7E2] transition-all text-xl font-medium h-full"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 dark:text-slate-100 w-6 h-6 pointer-events-none" />
        </div>
      </div>

      {/* Título de Resultados */}
      <div className="flex justify-between items-end mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Itens</h2>
        <span className="text-slate-400 dark:text-slate-500 font-medium">{filteredItems.length} resultados</span>
      </div>

      {/* Grid de Itens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {paginatedItems.map((item) => (
          <div 
            key={item.id} 
            className="group relative flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-[#59F7E2] dark:hover:border-[#59F7E2] transition-all duration-300"
          >
            <div className="relative w-16 h-16 md:w-20 md:h-20 mb-4 transition-transform group-hover:scale-110">
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 64px, 80px"
                className="object-contain filter drop-shadow-md"
                unoptimized
              />
            </div>
            
            <div className="text-center w-full">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">Nº {item.id.toString().padStart(3, '0')}</p>
              <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 capitalize truncate w-full">
                {item.name}
              </h3>
            </div>
          </div>
        ))}
        {paginatedItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xl font-medium">Nenhum item encontrado.</p>
            <p className="text-sm mt-2">Tente buscar com outros termos.</p>
          </div>
        )}
      </div>

      {/* Paginação Básica */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            Anterior
          </button>
          
          <div className="flex gap-1 overflow-x-auto max-w-xs px-2 py-1 scrollbar-hide">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              // Mostrar primeira, última, atual e vizinhas
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 shrink-0 rounded-xl font-bold transition-colors ${
                      currentPage === page 
                        ? 'bg-[#59F7E2] text-slate-800' 
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
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
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            Próxima
          </button>
        </div>
      )}
    </>
  );
}
