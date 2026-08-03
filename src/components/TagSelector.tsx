"use client";

import React from 'react';
import Image, { StaticImageData } from 'next/image';

import fogoImg from '@/assets/elements/fire_pokemon.png';
import aguaImg from '@/assets/elements/water_pokemon.png';
import eletricoImg from '@/assets/elements/eletric_pokemon.png';
import acoImg from '@/assets/elements/steel_pokemon.png';
import lutaImg from '@/assets/elements/fight_pokemon.png';
import psiquicoImg from '@/assets/elements/psychic_pokemon.png';
import escuridaoImg from '@/assets/elements/dark_pokemon.png';
import normalImg from '@/assets/elements/normal_pokemon.png';
import dragaoImg from '@/assets/elements/dragon_pokemon.png';
import fadaImg from '@/assets/elements/fary_pokemon.png';
import geloImg from '@/assets/elements/ice_pokemon.png';
import plantaImg from '@/assets/elements/grass_pokemon.png';
import insetoImg from '@/assets/elements/bug_pokemon.png';
import voadorImg from '@/assets/elements/flying_pokemon.png';
import fantasmaImg from '@/assets/elements/ghost_pokemon.png';
import terraImg from '@/assets/elements/ground_pokemon.png';
import venenosoImg from '@/assets/elements/poison_pokemon.png';
import rochaImg from '@/assets/elements/rock_pokemon.png';

export const POKEMON_TAGS = [
  'Fogo', 'Água', 'Elétrico', 'Aço', 'Luta', 'Psíquico', 'Escuridão', 'Normal', 'Dragão', 'Fada', 'Gelo', 'Planta',
  'Venenoso', 'Terra', 'Voador', 'Inseto', 'Rocha', 'Fantasma'
];

export const tagImages: Record<string, StaticImageData> = {
  'Fogo': fogoImg,
  'Água': aguaImg,
  'Elétrico': eletricoImg,
  'Aço': acoImg,
  'Luta': lutaImg,
  'Psíquico': psiquicoImg,
  'Escuridão': escuridaoImg,
  'Normal': normalImg,
  'Dragão': dragaoImg,
  'Fada': fadaImg,
  'Gelo': geloImg,
  'Planta': plantaImg,
  'Venenoso': venenosoImg,
  'Terra': terraImg,
  'Voador': voadorImg,
  'Inseto': insetoImg,
  'Rocha': rochaImg,
  'Fantasma': fantasmaImg,
};

const tagStyles: Record<string, string> = {
  'Fogo': 'scale-[1.2]',
  'Planta': 'scale-[1.5]',
  'Luta': 'scale-[1.3]'
};

interface TagSelectorProps {
  options: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  limit?: number;
}

export default function TagSelector({ options, selectedTags, onChange, limit }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      if (limit && selectedTags.length >= limit) {
        return; // Reached limit
      }
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5 sm:gap-3 w-full">
      {options.map(tag => {
        const isSelected = selectedTags.includes(tag);
        const isAtLimit = limit ? selectedTags.length >= limit : false;
        const isDisabled = !isSelected && isAtLimit;
        
        const extraStyle = tagStyles[tag] || 'scale-110';

        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            disabled={isDisabled}
            title={tag}
            className={`relative rounded-full transition-all duration-200 border-2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center overflow-hidden shrink-0
              ${isSelected 
                ? 'border-[#59F7E2] bg-white dark:bg-slate-800 shadow-md scale-105' 
                : isDisabled 
                  ? 'border-transparent bg-slate-50 dark:bg-slate-900/40 cursor-not-allowed opacity-30' 
                  : 'border-transparent bg-white dark:bg-slate-700/70 shadow-sm hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            {tagImages[tag] ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src={tagImages[tag]} 
                  alt={tag} 
                  fill sizes="(max-width: 768px) 100vw, 33vw" className={`object-cover drop-shadow-sm ${extraStyle}`}
                />
              </div>
            ) : (
              <span className="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-200">{tag}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
