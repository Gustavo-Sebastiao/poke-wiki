"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import AdminToggle from './AdminToggle';

import pokebolaCompleta from "@/assets/icons/pokebola_completa-removebg-preview.png";
import pokebolaMetade1 from "@/assets/icons/pokebola_metade_1_-removebg-preview.png";
import pokebolaMetade2 from "@/assets/icons/pokebola_metade_2_-removebg-preview.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

const getNavItems = (lang: 'pt' | 'en') => {
  const t = translations[lang].menu;
  return [
    { name: t.home, path: "/" },
    { name: t.pokedex, path: "/pokedex" },
    { name: t.items, path: "/itens" },
  ];
};

export default function NavMenu() {
  const { language } = useLanguage();
  const navItems = getNavItems(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  
  const pathname = usePathname();
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const currentIdx = navItems.findIndex(item => item.path === pathname);
    setActiveIndex(currentIdx !== -1 ? currentIdx : 0);
  }, [pathname]);

  const updatePill = () => {
    if (!isOpen || !isExpanded) return;
    
    const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
    const targetEl = navRefs.current[targetIndex];
    
    if (targetEl) {
      setPillStyle({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    if (isOpen && isExpanded) {
      // Delay update pill slightly to allow flex container to expand
      setTimeout(updatePill, 50);
      window.addEventListener("resize", updatePill);
      return () => window.removeEventListener("resize", updatePill);
    }
  }, [hoveredIndex, activeIndex, isOpen, isExpanded]);

  const handleOpen = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      setIsOpen(true);
      // Timeout to allow DOM render before triggering CSS transition
      setTimeout(() => setIsExpanded(true), 10);
    }, 500); // Tempo do giro
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
    }, 500); // Tempo do deslize de fechamento
  };

  if (!isOpen) {
    return (
      <div 
        className="flex items-center justify-center cursor-pointer group px-2 py-1"
        onClick={handleOpen}
      >
        <div className={`relative w-14 h-14 transition-all duration-500 ease-in-out ${isSpinning ? 'rotate-[360deg] scale-50 opacity-0' : 'group-hover:scale-110 group-hover:rotate-12'}`}>
          <Image 
            src={pokebolaCompleta} 
            alt="Menu" 
            fill sizes="56px" priority className="object-contain drop-shadow-md"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Menu (Efeito Leque/Pílula) */}
      <nav 
        className={`hidden md:flex relative items-center h-14 transition-all duration-300 ${
          isExpanded ? 'bg-white dark:bg-slate-800 rounded-full shadow-md pr-2 py-1' : 'bg-transparent py-2'
        }`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Metade Esquerda da Pokebola (Clica para fechar) */}
        <div 
          className="relative z-10 w-14 h-14 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center rotate-90 shrink-0"
          onClick={handleClose}
        >
          <Image 
            src={pokebolaMetade1} 
            alt="Fechar Menu" 
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        
        {/* Área Central (Links + Fundo) que expande e colapsa */}
        <div 
          className={`relative z-10 flex items-center h-full transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-w-[500px] opacity-100 px-1 overflow-visible' : 'max-w-0 opacity-0 px-0 overflow-hidden'
          }`}
        >
          {/* Pílula branca indicando item ativo/hover */}
          <div 
            className="absolute top-1.5 bottom-1.5 bg-white/80 dark:bg-slate-700/80 rounded-full shadow-sm transition-all duration-300 ease-out z-0"
            style={{
              left: `${pillStyle.left}px`,
              width: `${pillStyle.width}px`,
              opacity: pillStyle.opacity,
            }}
          />
          
          <div className="relative z-10 flex items-center w-max gap-1">
            {navItems.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const isActive = activeIndex === index && hoveredIndex === null;
              
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  ref={(el) => {
                    if (el) navRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  className={`px-5 py-2 text-base transition-colors duration-300 ${
                    isHovered || isActive ? "text-slate-900 dark:text-white font-bold" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
            
            <div className="px-2 pl-4 flex items-center z-20">
               <AdminToggle />
            </div>
          </div>
        </div>

        {/* Metade Direita da Pokebola */}
        <div className="relative z-10 w-14 h-14 flex items-center justify-center pointer-events-none rotate-90 shrink-0">
          <Image 
            src={pokebolaMetade2} 
            alt="Detalhe Pokebola" 
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
      </nav>

      {/* Mobile Menu (Sidebar Deslizante) */}
      <div className={`md:hidden fixed inset-0 z-[999] flex transition-opacity duration-300 ${isExpanded && !isClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop Escuro */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Painel Lateral */}
        <div 
          className={`relative w-[70%] max-w-[300px] h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col p-6 transition-transform duration-300 ease-out delay-75 ${
            isExpanded && !isClosing ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Image src={pokebolaCompleta} alt="Menu" width={32} height={32} className="object-contain" />
            </div>
            <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={handleClose}
                className={`px-4 py-3.5 rounded-2xl text-lg transition-colors ${
                  pathname === item.path 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <AdminToggle />
          </div>
        </div>
      </div>
    </>
  );
}
