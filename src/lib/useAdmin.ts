"use client";

import { useState, useEffect } from 'react';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Ao carregar no cliente, lemos o estado do localStorage
    const saved = localStorage.getItem('pokewiki_is_admin');
    if (saved === 'true') {
      setIsAdmin(true);
    }

    // Ouvir mudanças (para quando ativarmos/desativarmos no Header)
    const handleStorageChange = () => {
      const current = localStorage.getItem('pokewiki_is_admin');
      setIsAdmin(current === 'true');
    };

    window.addEventListener('admin_toggled', handleStorageChange);
    return () => window.removeEventListener('admin_toggled', handleStorageChange);
  }, []);

  const toggleAdmin = () => {
    const newState = !isAdmin;
    localStorage.setItem('pokewiki_is_admin', String(newState));
    setIsAdmin(newState);
    // Dispara o evento para outros componentes que usam o hook se atualizarem
    window.dispatchEvent(new Event('admin_toggled'));
  };

  return { isAdmin, toggleAdmin };
}
