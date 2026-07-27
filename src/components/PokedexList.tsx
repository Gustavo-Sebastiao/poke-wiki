"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import PokemonCard from '@/components/PokemonCard';
import { Search, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { Pokemon } from '@/lib/pokemonService';

interface PokedexListProps {
  initialPokemons: Pokemon[];
}

const ITEMS_PER_PAGE = 15;

const POKEMON_TAGS = [
  'Fogo', 'Água', 'Elétrico', 'Aço', 'Luta', 'Psíquico', 'Escuridão', 'Normal', 
  'Dragão', 'Fada', 'Gelo', 'Planta', 'Venenoso', 'Terra', 'Voador', 'Inseto', 
  'Rocha', 'Fantasma'
];

const GENERATIONS = [
  { id: 1, name: '1ª Geração (1-151)', min: 1, max: 151 },
  { id: 2, name: '2ª Geração (152-251)', min: 152, max: 251 },
  { id: 3, name: '3ª Geração (252-386)', min: 252, max: 386 },
  { id: 4, name: '4ª Geração (387-493)', min: 387, max: 493 },
  { id: 5, name: '5ª Geração (494-649)', min: 494, max: 649 },
  { id: 6, name: '6ª Geração (650-721)', min: 650, max: 721 },
  { id: 7, name: '7ª Geração (722-809)', min: 722, max: 809 },
  { id: 8, name: '8ª Geração (810-905)', min: 810, max: 905 },
  { id: 9, name: '9ª Geração (906-1025)', min: 906, max: 1025 },
];

function getPokemonIdFromUrl(url?: string): number | null {
  if (!url) return null;
  const match = url.match(/\/(\d+)\.png$/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

export default function PokedexList({ initialPokemons }: PokedexListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleGen = (genId: number) => {
    setSelectedGenerations(prev => 
      prev.includes(genId) ? prev.filter(g => g !== genId) : [...prev, genId]
    );
    setCurrentPage(1);
  };

  // Filtra a lista
  const filteredPokemons = useMemo(() => {
    return initialPokemons.filter((pokemon) => {
      // 1. Filtro por Busca Textual
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = pokemon.name.toLowerCase().includes(term);
        const matchesType = pokemon.type && pokemon.type.toLowerCase().includes(term);
        if (!matchesName && !matchesType) return false;
      }
      
      // 2. Filtro por Tipo (AND logic for combined filters, OR logic within types)
      if (selectedTypes.length > 0) {
        if (!pokemon.type) return false;
        const pTypes = pokemon.type.split(',').map(t => t.trim());
        const hasSelectedType = selectedTypes.some(t => pTypes.includes(t));
        if (!hasSelectedType) return false;
      }
      
      // 3. Filtro por Geração
      if (selectedGenerations.length > 0) {
        const pId = getPokemonIdFromUrl(pokemon.image_url);
        if (!pId) return false;
        
        const matchesGen = selectedGenerations.some(genId => {
          const gen = GENERATIONS.find(g => g.id === genId);
          return gen && pId >= gen.min && pId <= gen.max;
        });
        
        if (!matchesGen) return false;
      }
      
      return true;
    });
  }, [initialPokemons, searchTerm, selectedTypes, selectedGenerations]);

  // Calcula a quantidade de páginas
  const totalPages = Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE) || 1;
  
  // Fatiando a lista filtrada para a página atual
  const paginatedPokemons = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPokemons.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPokemons, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 relative">
        <div className="relative" ref={menuRef}>
          {/* Botão de Menu Hambúrguer */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-slate-700 flex items-center justify-center"
            title="Filtros"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Menu Dropdown de Filtros */}
          {isMenuOpen && (
            <div className="absolute top-16 left-0 w-80 max-h-[80vh] overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-3xl p-6 z-50 flex flex-col gap-6 animate-fade-in-down">
              <div>
                <h3 className="font-bold text-slate-800 text-lg mb-3">Filtrar por Geração</h3>
                <div className="flex flex-col gap-2">
                  {GENERATIONS.map(gen => (
                    <label key={gen.id} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedGenerations.includes(gen.id)}
                        onChange={() => toggleGen(gen.id)}
                        className="w-5 h-5 rounded border-slate-300 text-[#59F7E2] focus:ring-[#59F7E2] transition-all cursor-pointer"
                      />
                      <span className="text-slate-600 group-hover:text-slate-800 transition-colors font-medium">
                        {gen.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-800 text-lg mb-3">Filtrar por Tipo</h3>
                <div className="flex flex-wrap gap-2">
                  {POKEMON_TAGS.map(type => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                          isSelected 
                            ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Botão para limpar filtros */}
              {(selectedTypes.length > 0 || selectedGenerations.length > 0) && (
                <button 
                  onClick={() => { setSelectedTypes([]); setSelectedGenerations([]); setCurrentPage(1); }}
                  className="mt-2 w-full py-2 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-shadow text-slate-700"
            placeholder="Buscar Pokémon..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {paginatedPokemons.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedPokemons.map((pokemon) => (
              <PokemonCard key={pokemon.id} pokemon={pokemon} />
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
                className="p-3 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-slate-600 font-medium px-4">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="p-3 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl shadow-soft mt-8">
          <p className="text-slate-500 mb-4 text-center">Nenhum Pokémon encontrado com os filtros atuais.</p>
          {(selectedTypes.length > 0 || selectedGenerations.length > 0 || searchTerm) && (
            <button 
              onClick={() => { setSelectedTypes([]); setSelectedGenerations([]); setSearchTerm(''); setCurrentPage(1); }}
              className="px-6 py-2 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-colors"
            >
              Limpar Pesquisa
            </button>
          )}
        </div>
      )}
    </>
  );
}
