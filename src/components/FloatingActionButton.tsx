"use client";

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAdmin } from '@/lib/useAdmin';

export default function FloatingActionButton() {
  const { isAdmin } = useAdmin();

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="fixed bottom-24 right-8 z-50 flex items-center justify-center w-14 h-14 bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-slate-700 transition-all duration-300"
      title="Adicionar Novo Pokémon"
    >
      <Plus className="w-6 h-6" />
    </Link>
  );
}
