"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import pokebolaCompleta from "@/assets/icons/pokebola_completa-removebg-preview.png";
import pokebolaMetade1 from "@/assets/icons/pokebola_metade_1_-removebg-preview.png";
import pokebolaMetade2 from "@/assets/icons/pokebola_metade_2_-removebg-preview.png";

const navItems = [
  { name: "Início", path: "/" },
  { name: "Wiki", path: "/pokedex" },
  { name: "Ajuda", path: "/ajuda" },
];

export default function NavMenu() {
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
            fill
            className="object-contain drop-shadow-md"
          />
        </div>
      </div>
    );
  }

  return (
    <nav 
      className="relative flex items-center h-12 md:h-14"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Metade Esquerda da Pokebola (Clica para fechar) */}
      <div 
        className="relative z-10 w-12 h-12 md:w-14 md:h-14 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center rotate-90 shrink-0"
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
        className={`relative z-10 flex items-center h-full transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? 'max-w-[500px] opacity-100 px-1' : 'max-w-0 opacity-0 px-0'
        }`}
      >
        {/* Fundo estilo pílula com vidro embaçado e brilho */}
        <div className="absolute inset-y-0 -left-8 -right-8 bg-white/20 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-white/40 z-0" />
        
        {/* Pílula branca indicando item ativo/hover */}
        <div 
          className="absolute top-1.5 bottom-1.5 bg-white/80 rounded-full shadow-sm transition-all duration-300 ease-out z-0"
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
                className={`px-4 md:px-5 py-2 text-sm md:text-base transition-colors duration-300 ${
                  isHovered || isActive ? "text-slate-900 font-bold" : "text-slate-700 hover:text-slate-900 font-medium"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Metade Direita da Pokebola */}
      <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center pointer-events-none rotate-90 shrink-0">
        <Image 
          src={pokebolaMetade2} 
          alt="Detalhe Pokebola" 
          width={40}
          height={40}
          className="object-contain"
        />
      </div>
    </nav>
  );
}
