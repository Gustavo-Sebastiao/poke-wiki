"use client";

import { useAdmin } from '@/lib/useAdmin';
import { Shield, ShieldAlert } from 'lucide-react';

export default function AdminToggle() {
  const { isAdmin, toggleAdmin } = useAdmin();

  return (
    <button
      onClick={toggleAdmin}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        isAdmin 
          ? 'bg-slate-800 text-white shadow-sm' 
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      }`}
      title={isAdmin ? "Desativar modo Admin" : "Ativar modo Admin"}
    >
      {isAdmin ? <Shield className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
      <span className="hidden sm:inline">{isAdmin ? 'Admin Ativo' : 'Modo Usuário'}</span>
    </button>
  );
}
