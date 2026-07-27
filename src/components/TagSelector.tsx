"use client";

import React from 'react';

export const POKEMON_TAGS = [
  'Grama', 'Fogo', 'Terra', 'Chama', 'Elétrico', 'Água', 
  'Rocha', 'Voador', 'Gelo', 'Normal', 'Inseto', 
  'Fantasma', 'Lutador', 'Dragão', 'Psíquico'
];

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
    <div className="flex flex-wrap gap-2">
      {options.map(tag => {
        const isSelected = selectedTags.includes(tag);
        const isAtLimit = limit ? selectedTags.length >= limit : false;
        const isDisabled = !isSelected && isAtLimit;

        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            disabled={isDisabled}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 border
              ${isSelected 
                ? 'bg-[#59F7E2] text-slate-800 border-[#59F7E2] shadow-sm scale-105' 
                : isDisabled 
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-50' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }
            `}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
