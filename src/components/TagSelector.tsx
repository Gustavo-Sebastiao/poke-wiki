"use client";

import React from 'react';
import Image, { StaticImageData } from 'next/image';

import fogoImg from '@/assets/elements/fire _icon.png';
import aguaImg from '@/assets/elements/c3613977779d28d1da20e3d814ac1ce0-removebg-preview.png';
import eletricoImg from '@/assets/elements/st_small_507x507-pad_600x600_f8f8f8.u1-removebg-preview.png';
import acoImg from '@/assets/elements/images-removebg-preview (5).png';
import lutaImg from '@/assets/elements/images-removebg-preview.png';
import psiquicoImg from '@/assets/elements/images-removebg-preview (2).png';
import escuridaoImg from '@/assets/elements/images-removebg-preview (4).png';
import normalImg from '@/assets/elements/images-removebg-preview (1).png';
import dragaoImg from '@/assets/elements/images-removebg-preview (3).png';
import fadaImg from '@/assets/elements/images-removebg-preview (6).png';
import geloImg from '@/assets/elements/watermarked_img_1369503070115639316-Photoroom.png';

export const POKEMON_TAGS = [
  'Fogo', 'Água', 'Elétrico', 'Aço', 'Luta', 'Psíquico', 'Escuridão', 'Normal', 'Dragão', 'Fada', 'Gelo'
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
};

const tagStyles: Record<string, string> = {};

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
    <div className="flex flex-wrap gap-3">
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
            className={`relative rounded-full transition-all duration-200 border-2 w-12 h-12 flex items-center justify-center overflow-hidden
              ${isSelected 
                ? 'border-[#59F7E2] bg-white shadow-md scale-110' 
                : isDisabled 
                  ? 'border-transparent bg-slate-50 cursor-not-allowed opacity-40' 
                  : 'border-transparent bg-white shadow-sm hover:border-slate-200 hover:bg-slate-50'
              }
            `}
          >
            {tagImages[tag] ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image 
                  src={tagImages[tag]} 
                  alt={tag} 
                  fill
                  className={`object-cover drop-shadow-sm ${extraStyle}`}
                />
              </div>
            ) : (
              <span className="text-[10px] font-bold uppercase">{tag}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
