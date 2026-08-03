"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, UserCircle, Plus, Users, Shield } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/lib/translations';

interface AdminToggleProps {
  direction?: 'down' | 'up';
  onNavigate?: () => void;
}

export default function AdminToggle({ direction = 'down', onNavigate }: AdminToggleProps) {
  const { user, role, loading, signOut } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].adminMenu;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (action?: () => void) => {
    setIsOpen(false);
    if (action) action();
    if (onNavigate) onNavigate();
  };

  if (loading) {
    return <div className="px-3 py-1.5 text-sm text-slate-500">...</div>;
  }

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#59F7E2] focus:ring-offset-2"
        >
          <UserCircle className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className={`absolute w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-right ${direction === 'up' ? 'bottom-full mb-3 left-1/2 -translate-x-1/2' : 'right-0 mt-2'}`}>
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {user.email}
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mt-0.5">
                {role || 'user'}
              </p>
            </div>
            
            <div className="p-2 flex flex-col gap-1">
              <Link 
                href="/admin" 
                onClick={() => handleItemClick()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                {t.dashboard}
              </Link>
              
              {(role === 'admin' || role === 'superadmin') && (
                <Link 
                  href="/admin/novo" 
                  onClick={() => handleItemClick()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t.addPokemon}
                </Link>
              )}

              {role === 'superadmin' && (
                <Link 
                  href="/admin/usuarios" 
                  onClick={() => handleItemClick()}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Users className="w-4 h-4" />
                  {t.addAdmin}
                </Link>
              )}
              
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
              
              <button
                onClick={() => handleItemClick(() => signOut())}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                {t.logout}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      onClick={() => onNavigate && onNavigate()}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold shadow-soft hover:shadow-soft-hover transition-all hover:-translate-y-0.5"
    >
      <Shield className="w-4 h-4" />
      <span>Admin</span>
    </Link>
  );
}
