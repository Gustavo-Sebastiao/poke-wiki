"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
    >
      <ArrowLeft className="w-5 h-5" />
      Voltar para a Pokédex
    </button>
  );
}
