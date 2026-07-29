import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { Item, ItemDetails } from '@/lib/itemService';
import { getItemDetails } from '@/lib/itemService';

interface ItemModalProps {
  item: Item;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const [details, setDetails] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bloquear scroll do body ao abrir
    document.body.style.overflow = 'hidden';
    
    // Buscar detalhes extras
    const fetchDetails = async () => {
      setLoading(true);
      const data = await getItemDetails(item.id);
      setDetails(data);
      setLoading(false);
    };
    
    fetchDetails();

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [item.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-fade-in-down border border-slate-200 dark:border-slate-700">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-800 dark:text-slate-200 transition-all shadow-sm backdrop-blur-md"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 pb-0 flex flex-col items-center relative">
          <div className="w-32 h-32 relative mb-6">
            <div className="absolute inset-0 bg-teal-100 dark:bg-teal-900/30 rounded-full animate-pulse blur-xl"></div>
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-contain filter drop-shadow-xl z-10"
              unoptimized
            />
          </div>
          
          <p className="text-sm font-black text-slate-400 dark:text-slate-500 mb-1 tracking-widest">
            ITEM Nº {item.id.toString().padStart(3, '0')}
          </p>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white capitalize mb-4 text-center">
            {item.name}
          </h2>
          
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700/50">
            <p className="text-slate-600 dark:text-slate-300 text-center italic text-sm md:text-base">
              "{item.description}"
            </p>
          </div>
        </div>

        <div className="p-8 pt-0 bg-white dark:bg-slate-900 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#59F7E2] animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Buscando detalhes...</p>
            </div>
          ) : details ? (
            <div className="space-y-6 animate-fade-in-down">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Categoria</p>
                  <p className="text-slate-700 dark:text-slate-200 font-semibold capitalize truncate">{details.category}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Custo</p>
                  <p className="text-slate-700 dark:text-slate-200 font-semibold">
                    {details.cost > 0 ? `₽ ${details.cost}` : 'Não comprável'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#59F7E2]"></div>
                  Efeito Detalhado
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {details.effect}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <p>Não foi possível carregar os detalhes do item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
