"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import PokemonCard from '@/components/PokemonCard';
import PokemonModal from '@/components/PokemonModal';
import { Search, ChevronLeft, ChevronRight, Filter, X, ChevronDown } from 'lucide-react';
import type { Pokemon } from '@/lib/pokemonCatalog';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';
import Image from 'next/image';
import PikachuNotFound from '@/assets/icons/nao_encontrado_pikachu.png';
import Fuse from 'fuse.js';
import { rankFuzzyResults } from '@/lib/fuzzySearch';

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

const RARITIES = ['Comum', 'Lendário', 'Mítico'];

const LEGENDARY_IDS = [
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384,
  480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646,
  716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905,
  1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024
];

const MYTHICAL_IDS = [
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893, 1025
];

function getPokemonIdFromUrl(url?: string): number | null {
  if (!url) return null;
  const match = url.match(/\/(\d+)\.png$/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

function restoreToggle(value: unknown): boolean {
  return value === true || value === 'true';
}

const ToggleSwitch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
  <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none">
    <span className="text-slate-700 dark:text-slate-200 font-medium text-sm">{label}</span>
    <div className="relative flex-shrink-0 ml-4">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[#59F7E2]' : 'bg-slate-300'}`}></div>
      <div className={`absolute left-1 top-1 bg-white dark:bg-slate-800 w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
    </div>
  </label>
);

export default function PokedexList({ initialPokemons }: PokedexListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language].filters;
  const tRarity = translations[language].rarities as any;
  const tTypes = translations[language].pokemonTypes as any;
  const tGens = translations[language].pokemonGenerations as any;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
  const [showMegas, setShowMegas] = useState(false);
  const [showAlolas, setShowAlolas] = useState(false);
  const [showGalar, setShowGalar] = useState(false);
  const [showHisui, setShowHisui] = useState(false);
  const [showPaldea, setShowPaldea] = useState(false);
  const [sortOrder, setSortOrder] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const pokemonSearch = useMemo(() => new Fuse(initialPokemons, {
    keys: [
      { name: 'name', weight: 0.75 },
      { name: 'type', weight: 0.2 },
      { name: 'id', weight: 0.05 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
  }), [initialPokemons]);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('pokedex_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.searchTerm !== undefined) setSearchTerm(parsed.searchTerm);
        if (parsed.currentPage !== undefined) setCurrentPage(parsed.currentPage);
        if (parsed.selectedTypes !== undefined) setSelectedTypes(parsed.selectedTypes);
        if (parsed.selectedGenerations !== undefined) setSelectedGenerations(parsed.selectedGenerations);
        if (parsed.selectedRarities !== undefined) setSelectedRarities(parsed.selectedRarities);
        if (parsed.showMegas !== undefined) setShowMegas(restoreToggle(parsed.showMegas));
        if (parsed.showAlolas !== undefined) setShowAlolas(restoreToggle(parsed.showAlolas));
        if (parsed.showGalar !== undefined) setShowGalar(restoreToggle(parsed.showGalar));
        if (parsed.showHisui !== undefined) setShowHisui(restoreToggle(parsed.showHisui));
        if (parsed.showPaldea !== undefined) setShowPaldea(restoreToggle(parsed.showPaldea));
        if (parsed.sortOrder !== undefined) setSortOrder(parsed.sortOrder);
      } catch (e) {}
    }
    setIsInitialized(true);
  }, []);

  // Save state to sessionStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    const stateToSave = {
      searchTerm,
      currentPage,
      selectedTypes,
      selectedGenerations,
      selectedRarities,
      showMegas,
      showAlolas,
      showGalar,
      showHisui,
      showPaldea,
      sortOrder
    };
    sessionStorage.setItem('pokedex_state', JSON.stringify(stateToSave));
  }, [searchTerm, currentPage, selectedTypes, selectedGenerations, selectedRarities, showMegas, showAlolas, showGalar, showHisui, showPaldea, sortOrder, isInitialized]);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
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

  const toggleRarity = (rarity: string) => {
    setSelectedRarities(prev => 
      prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
    );
    setCurrentPage(1);
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order || null);
    setCurrentPage(1);
  };

  // Filtra a lista
  const filteredPokemons = useMemo(() => {
    const query = searchTerm.trim();
    const searchedPokemons = query
      ? rankFuzzyResults(pokemonSearch.search(query), query, (pokemon) => pokemon.name)
          .map(({ item }) => item)
      : initialPokemons;

    return searchedPokemons.filter((pokemon) => {
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

      // 4. Filtro por Raridade
      if (selectedRarities.length > 0) {
        const pId = getPokemonIdFromUrl(pokemon.image_url);
        if (!pId) return false;
        
        const isLegendary = LEGENDARY_IDS.includes(pId);
        const isMythical = MYTHICAL_IDS.includes(pId);
        const isCommon = !isLegendary && !isMythical;
        
        const matchesRarity = selectedRarities.some(r => {
          if (r === 'Comum') return isCommon;
          if (r === 'Lendário') return isLegendary;
          if (r === 'Mítico') return isMythical;
          return false;
        });
        
        if (!matchesRarity) return false;
      }
      
      return true;
    });
  }, [initialPokemons, pokemonSearch, searchTerm, selectedTypes, selectedGenerations, selectedRarities]);

  const sortedPokemons = useMemo(() => {
    let result = [...filteredPokemons];
    
    // Controla a exibição das Megas
    result = result.filter(p => {
      const id = getPokemonIdFromUrl(p.image_url) || 0;
      const isForm = id >= 10000;
      const name = p.name.toLowerCase();
      const isMega = isForm && (name.includes('mega') || name.includes('primal'));
      const isAlola = isForm && name.includes('alola');
      const isGalar = isForm && name.includes('galar');
      const isHisui = isForm && name.includes('hisui');
      const isPaldea = isForm && name.includes('paldea');

      const showAnyForm = showMegas || showAlolas || showGalar || showHisui || showPaldea;
      if (!showAnyForm) return !isForm;
      
      return (showMegas && isMega) || (showAlolas && isAlola) || (showGalar && isGalar) || (showHisui && isHisui) || (showPaldea && isPaldea);
    });

    if (sortOrder === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'rarity') {
      const getRarityVal = (id: number) => MYTHICAL_IDS.includes(id) ? 3 : (LEGENDARY_IDS.includes(id) ? 2 : 1);
      result.sort((a, b) => {
        const idA = getPokemonIdFromUrl(a.image_url) || 0;
        const idB = getPokemonIdFromUrl(b.image_url) || 0;
        return getRarityVal(idB) - getRarityVal(idA);
      });
    } else if (sortOrder === 'gen') {
      result.sort((a, b) => {
        const idA = getPokemonIdFromUrl(a.image_url) || 0;
        const idB = getPokemonIdFromUrl(b.image_url) || 0;
        return idA - idB;
      });
    } else if (sortOrder === 'element') {
      result.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
    }

    const normalizedSearch = searchTerm.toLocaleLowerCase().trim();
    const exactMatchIndex = result.findIndex((pokemon) => (
      pokemon.name.toLocaleLowerCase().trim() === normalizedSearch
    ));
    if (exactMatchIndex > 0) {
      result.unshift(result.splice(exactMatchIndex, 1)[0]);
    }
    
    return result;
  }, [filteredPokemons, searchTerm, showMegas, showAlolas, showGalar, showHisui, showPaldea, sortOrder]);

  // Calcula a quantidade de páginas
  const totalPages = Math.ceil(sortedPokemons.length / ITEMS_PER_PAGE) || 1;
  
  // Fatiando a lista filtrada para a página atual
  const paginatedPokemons = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedPokemons.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedPokemons, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const selectedPokemonId = searchParams.get('pokemon');
  const selectedPokemonName = searchParams.get('pokemonName');
  
  const selectedPokemon = useMemo(() => {
    if (selectedPokemonId) {
      const found = initialPokemons.find(p => String(p.id) === selectedPokemonId || getPokemonIdFromUrl(p.image_url) === Number(selectedPokemonId));
      if (found) return found;

      return {
        id: selectedPokemonId,
        name: `Pokemon #${selectedPokemonId}`,
        description: '',
        type: '',
        weaknesses: [],
        image_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemonId}.png`
      };
    }
    if (selectedPokemonName) {
      const normalizedQuery = selectedPokemonName.toLowerCase().replace(/\s+/g, '-');
      const found = initialPokemons.find(p => 
        p.name.toLowerCase() === selectedPokemonName.toLowerCase() ||
        p.name.toLowerCase().replace(/\s+/g, '-') === normalizedQuery
      );
      if (found) return found;

      return {
        name: selectedPokemonName,
        description: '',
        type: '',
        weaknesses: [],
        image_url: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemonName}.png`
      };
    }
    return null;
  }, [selectedPokemonId, selectedPokemonName, initialPokemons]);

  const handleSelectPokemon = (pokemon: Pokemon) => {
    // Adiciona o parametro pokemon na URL sem recarregar a pagina
    const params = new URLSearchParams(searchParams.toString());
    const pokeApiId = getPokemonIdFromUrl(pokemon.image_url);
    if (pokemon.id) {
      params.set('pokemon', String(pokemon.id));
      params.delete('pokemonName');
    } else if (pokeApiId) {
      params.set('pokemon', String(pokeApiId));
      params.delete('pokemonName');
    } else {
      params.set('pokemonName', pokemon.name.toLowerCase().replace(/\s+/g, '-'));
      params.delete('pokemon');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSelectPokemonTarget = (target: { name: string; imageUrl?: string }) => {
    const idMatch = target.imageUrl?.match(/\/(\d+)\.(png|jpg|jpeg|gif)$/i)?.[1];
    const params = new URLSearchParams(searchParams.toString());
    if (idMatch) {
      params.set('pokemon', idMatch);
      params.delete('pokemonName');
    } else {
      params.set('pokemonName', target.name.toLowerCase().replace(/\s+/g, '-'));
      params.delete('pokemon');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('pokemon');
    params.delete('pokemonName');
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
  };

  if (!isInitialized) {
    return <div className="w-full flex items-center justify-center p-12 text-slate-500 dark:text-slate-400 dark:text-slate-500">Carregando Pokédex...</div>;
  }

  return (
    <>
      {selectedPokemon && (
        <PokemonModal 
          pokemon={selectedPokemon} 
          onClose={handleCloseModal} 
          onSelectPokemon={handleSelectPokemonTarget}
        />
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
            aria-label={t.search}
            placeholder={t.search}
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
            aria-label={t.search}
            placeholder={t.search}
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

        {/* Dropdown Geração */}
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'gen' ? null : 'gen')}
            className={`w-full px-4 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-full text-sm font-semibold transition-all flex items-center justify-between md:justify-center gap-2 shadow-md border-2 md:hover:scale-105 whitespace-nowrap ${openDropdown === 'gen' ? 'border-[#59F7E2] bg-teal-50/50 dark:bg-teal-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            {selectedGenerations.length > 0 ? `${selectedGenerations.length} ${t.selected}` : t.allGenerations}
            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${openDropdown === 'gen' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'gen' && (
            <div className="absolute z-50 flex flex-col animate-fade-in-down bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-2xl md:top-14 md:left-0 md:w-[300px] max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:rounded-b-none max-md:rounded-t-3xl max-md:shadow-[0_0_0_1000px_rgba(0,0,0,0.6)] max-md:pb-10 max-md:z-[100]">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">{t.generation}</h3>
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {GENERATIONS.map(gen => (
                  <label key={gen.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedGenerations.includes(gen.id)}
                      onChange={() => toggleGen(gen.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#59F7E2] focus:ring-[#59F7E2] transition-all cursor-pointer"
                    />
                    <span className="text-slate-600 dark:text-slate-300 group-hover:text-slate-900 transition-colors font-medium text-sm">
                      {tGens[gen.name] || gen.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dropdown Tipo */}
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
            className={`w-full px-4 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-full text-sm font-semibold transition-all flex items-center justify-between md:justify-center gap-2 shadow-md border-2 md:hover:scale-105 whitespace-nowrap ${openDropdown === 'type' ? 'border-[#59F7E2] bg-teal-50/50 dark:bg-teal-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            {selectedTypes.length > 0 ? `${selectedTypes.length} ${t.types}` : t.allTypes}
            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${openDropdown === 'type' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'type' && (
            <div className="absolute z-50 flex flex-col animate-fade-in-down bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-2xl md:top-14 md:left-0 md:w-[320px] max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:rounded-b-none max-md:rounded-t-3xl max-md:shadow-[0_0_0_1000px_rgba(0,0,0,0.6)] max-md:pb-10 max-md:z-[100]">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">{t.type}</h3>
              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {POKEMON_TAGS.map(type => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        isSelected 
                          ? 'bg-[#59F7E2] text-slate-900 border-[#59F7E2] shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {tTypes[type] || type}
                    </button>
                  )
                })}
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
            <div className="absolute z-50 flex flex-col animate-fade-in-down bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-2xl md:top-14 md:left-0 md:w-[240px] max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:rounded-b-none max-md:rounded-t-3xl max-md:shadow-[0_0_0_1000px_rgba(0,0,0,0.6)] max-md:pb-10 max-md:z-[100]">
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

        {/* Ordenação */}
        <div className="relative w-full md:w-auto">
          <select
            aria-label={t.sortBy}
            value={sortOrder ?? ''}
            onChange={(event) => handleSortChange(event.target.value)}
            className="w-full appearance-none px-4 pr-10 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-full text-sm font-semibold shadow-md border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-[#59F7E2] focus:outline-none focus:ring-2 focus:ring-[#59F7E2]/30 transition-colors cursor-pointer"
          >
            <option value="">{t.sortBy}: {t.sortDefault}</option>
            <option value="alpha">{t.sortBy}: {t.sortAlpha}</option>
            <option value="rarity">{t.sortBy}: {t.sortRarity}</option>
            <option value="gen">{t.sortBy}: {t.sortGen}</option>
            <option value="element">{t.sortBy}: {t.sortElement}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
        </div>

        {/* Dropdown Formas Especiais */}
        <div className="relative w-full md:w-auto">
          <button 
            onClick={() => setOpenDropdown(openDropdown === 'options' ? null : 'options')}
            className={`w-full px-4 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl md:rounded-full text-sm font-semibold transition-all flex items-center justify-between md:justify-center gap-2 shadow-md border-2 md:hover:scale-105 whitespace-nowrap ${openDropdown === 'options' ? 'border-[#59F7E2] bg-teal-50/50 dark:bg-teal-900/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
          >
            {(showMegas || showAlolas || showGalar || showHisui || showPaldea) ? `${[showMegas, showAlolas, showGalar, showHisui, showPaldea].filter(Boolean).length} ${t.formsSelected}` : t.specialForms}
            <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${openDropdown === 'options' ? 'rotate-180' : ''}`} />
          </button>
          
          {openDropdown === 'options' && (
            <div className="absolute z-50 flex flex-col animate-fade-in-down bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-2xl md:top-14 md:left-0 md:w-[240px] max-md:fixed max-md:bottom-0 max-md:left-0 max-md:w-full max-md:rounded-b-none max-md:rounded-t-3xl max-md:shadow-[0_0_0_1000px_rgba(0,0,0,0.6)] max-md:pb-10 max-md:z-[100]">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t.specialForms}</h3>
              <p className="mt-1 mb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t.specialFormsHelp}</p>
              <div className="flex flex-col gap-2">
                <ToggleSwitch label={t.showMegas} checked={showMegas} onChange={() => { setShowMegas(!showMegas); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showAlola} checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showGalar} checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showHisui} checked={showHisui} onChange={() => { setShowHisui(!showHisui); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showPaldea} checked={showPaldea} onChange={() => { setShowPaldea(!showPaldea); setCurrentPage(1); }} />
              </div>
            </div>
          )}
        </div>

        {/* Botão Limpar Filtros */}
        {(selectedTypes.length > 0 || selectedGenerations.length > 0 || selectedRarities.length > 0 || showMegas || showAlolas || showGalar || showHisui || showPaldea || sortOrder !== null) && (
          <button 
            onClick={() => { setSelectedTypes([]); setSelectedGenerations([]); setSelectedRarities([]); setShowMegas(false); setShowAlolas(false); setShowGalar(false); setShowHisui(false); setShowPaldea(false); setSortOrder(null); setCurrentPage(1); setOpenDropdown(null); }}
            className="w-full md:w-auto px-4 py-3 md:py-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded-xl md:rounded-full text-sm shadow-md border-2 border-red-400 transition-all md:hover:scale-105 hover:bg-red-50 flex items-center justify-center whitespace-nowrap md:ml-auto mt-2 md:mt-0"
          >
            {t.clearFilters}
          </button>
        )}
      </div>

      {/* Modal de Filtros Mobile */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-white dark:bg-slate-800 z-[200] flex flex-col md:hidden animate-fade-in-down overflow-hidden">
          {/* Header */}
          <div className="flex-none flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Filter className="w-6 h-6 text-[#59F7E2]"/> Filtros</h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-32 flex flex-col gap-8 custom-scrollbar">
            {/* Geração */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t.generation}</h3>
              <div className="flex flex-col gap-3">
                {GENERATIONS.map(gen => (
                  <label key={gen.id} className="flex items-center gap-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700">
                    <input 
                      type="checkbox" 
                      checked={selectedGenerations.includes(gen.id)}
                      onChange={() => toggleGen(gen.id)}
                      className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-[#59F7E2] focus:ring-[#59F7E2] transition-all cursor-pointer"
                    />
                    <span className="text-slate-700 dark:text-slate-200 font-medium text-base">
                      {tGens[gen.name] || gen.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t.type}</h3>
              <div className="flex flex-wrap gap-2">
                {POKEMON_TAGS.map(type => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                        isSelected 
                          ? 'bg-[#59F7E2] text-slate-900 border-[#59F7E2] shadow-md' 
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {tTypes[type] || type}
                    </button>
                  )
                })}
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

            {/* Ordenação */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t.order}</h3>
              <div className="relative">
                <select
                  aria-label={t.sortBy}
                  value={sortOrder ?? ''}
                  onChange={(event) => handleSortChange(event.target.value)}
                  className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-base font-medium text-slate-700 transition-colors cursor-pointer hover:border-slate-300 focus:border-[#59F7E2] focus:outline-none focus:ring-2 focus:ring-[#59F7E2]/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600"
                >
                  <option value="">{t.sortDefault}</option>
                  <option value="alpha">{t.sortAlpha}</option>
                  <option value="rarity">{t.sortRarity}</option>
                  <option value="gen">{t.sortGen}</option>
                  <option value="element">{t.sortElement}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 w-5 h-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              </div>
            </div>
            
            {/* Formas especiais */}
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg border-b border-slate-100 dark:border-slate-700 pb-2">{t.specialForms}</h3>
              <p className="mt-2 mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t.specialFormsHelp}</p>
              <div className="flex flex-col gap-3">
                <ToggleSwitch label={t.showMegas} checked={showMegas} onChange={() => { setShowMegas(!showMegas); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showAlola} checked={showAlolas} onChange={() => { setShowAlolas(!showAlolas); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showGalar} checked={showGalar} onChange={() => { setShowGalar(!showGalar); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showHisui} checked={showHisui} onChange={() => { setShowHisui(!showHisui); setCurrentPage(1); }} />
                <ToggleSwitch label={t.showPaldea} checked={showPaldea} onChange={() => { setShowPaldea(!showPaldea); setCurrentPage(1); }} />
              </div>
            </div>
          </div>
          
          {/* Footer Buttons */}
          <div className="flex-none p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] flex gap-4 mt-auto">
             {(selectedTypes.length > 0 || selectedGenerations.length > 0 || selectedRarities.length > 0 || showMegas || showAlolas || showGalar || showHisui || showPaldea || sortOrder !== null) && (
                <button 
                  onClick={() => { setSelectedTypes([]); setSelectedGenerations([]); setSelectedRarities([]); setShowMegas(false); setShowAlolas(false); setShowGalar(false); setShowHisui(false); setShowPaldea(false); setSortOrder(null); setCurrentPage(1); }}
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
      )}

      {paginatedPokemons.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {paginatedPokemons.map((pokemon) => (
              <PokemonCard 
                key={pokemon.id} 
                pokemon={pokemon} 
                onSelect={handleSelectPokemon}
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
                className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                    return <span key={page} className="px-2 py-2 text-slate-400 flex items-center justify-center">...</span>;
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
                className="p-3 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800 rounded-3xl shadow-soft mt-8">
          <Image src={PikachuNotFound} alt="Pikachu não encontrado" width={200} height={200} className="mb-6 opacity-90 drop-shadow-md hover:scale-105 transition-transform" />
          <p className="text-slate-500 dark:text-slate-400 mb-4 text-center">{t.noPokemon}</p>
          {(selectedTypes.length > 0 || selectedGenerations.length > 0 || selectedRarities.length > 0 || searchTerm || showMegas || showAlolas || showGalar || showHisui || showPaldea || sortOrder !== null) && (
            <button 
              onClick={() => { setSelectedTypes([]); setSelectedGenerations([]); setSelectedRarities([]); setSearchTerm(''); setShowMegas(false); setShowAlolas(false); setShowGalar(false); setShowHisui(false); setShowPaldea(false); setSortOrder(null); setCurrentPage(1); }}
              className="px-6 py-2 bg-slate-800 text-white font-bold rounded-full hover:bg-slate-700 transition-colors"
            >
              {t.clearSearch}
            </button>
          )}
        </div>
      )}
    </>
  );
}
