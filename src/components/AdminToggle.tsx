"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LogIn, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminToggle() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div className="px-3 py-1.5 text-sm text-slate-500">Carregando...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link 
          href="/admin" 
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
        >
          <UserCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Painel</span>
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-full text-sm font-medium transition-colors"
          title="Sair"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-2 px-4 py-2 bg-[#59F7E2] text-slate-800 rounded-full text-sm font-bold shadow-soft hover:shadow-soft-hover transition-all hover:-translate-y-0.5"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Fazer Login</span>
    </Link>
  );
}
