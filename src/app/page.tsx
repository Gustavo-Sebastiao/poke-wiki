"use client";

import { useState, useEffect, useRef } from "react";
import HomeCarousel from "@/components/HomeCarousel";
import GifGallery from "@/components/GifGallery";

export default function Home() {
  const [activeSection, setActiveSection] = useState(0);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);

  const handleScroll = (direction: 'down' | 'up') => {
    if (isScrolling.current) return;
    
    if (direction === 'down' && activeSection < 1) {
      isScrolling.current = true;
      setActiveSection(1);
      setTimeout(() => { isScrolling.current = false; }, 1200); // tempo de debounce igual/maior que a animação
    } else if (direction === 'up' && activeSection > 0) {
      isScrolling.current = true;
      setActiveSection(0);
      setTimeout(() => { isScrolling.current = false; }, 1200);
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10) return;
      handleScroll(e.deltaY > 0 ? 'down' : 'up');
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling.current) return;
      
      const touchEndY = e.touches[0].clientY;
      const diff = touchStartY.current - touchEndY;

      if (Math.abs(diff) > 50) { // threshold para o swipe
        handleScroll(diff > 0 ? 'down' : 'up');
        touchStartY.current = touchEndY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeSection]);

  return (
    <main className="fixed inset-0 w-full h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Primeira Sessão: O Carrossel que já existia */}
      <section 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          activeSection === 0 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        <HomeCarousel />
      </section>
      
      {/* Segunda Sessão: Galeria de GIFs */}
      <section 
        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
          activeSection === 1 ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
        }`}
      >
        <GifGallery />
      </section>
    </main>
  );
}
