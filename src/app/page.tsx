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
      // Don't intercept touches on mobile, let native scrolling handle it
      if (window.innerWidth < 768) return;
      
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
    <main className="max-md:relative max-md:flex max-md:flex-col md:fixed md:inset-0 w-full max-md:h-auto md:h-full bg-slate-50 dark:bg-slate-900 md:overflow-hidden">
      {/* Primeira Sessão: O Carrossel que já existia */}
      <section 
        className={`max-md:relative max-md:w-full max-md:h-[100dvh] md:absolute md:inset-0 md:w-full md:h-full md:transition-opacity md:duration-1000 md:ease-in-out ${
          activeSection === 0 ? "md:opacity-100 md:z-10 md:pointer-events-auto" : "md:opacity-0 md:z-0 md:pointer-events-none"
        }`}
      >
        <HomeCarousel />
      </section>
      
      {/* Segunda Sessão: Galeria de GIFs */}
      <section 
        className={`max-md:relative max-md:w-full max-md:min-h-screen md:absolute md:inset-0 md:w-full md:h-full md:transition-opacity md:duration-1000 md:ease-in-out ${
          activeSection === 1 ? "md:opacity-100 md:z-10 md:pointer-events-auto" : "md:opacity-0 md:z-0 md:pointer-events-none"
        }`}
      >
        <GifGallery />
      </section>
    </main>
  );
}
