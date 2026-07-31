"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import charizardImg from "@/assets/images/Charizard_3d_model_1000_0001-Photoroom.png";
import blastoiseImg from "@/assets/images/stat-blastoise-Photoroom.png";
import venusaurImg from "@/assets/images/Venusaur_art-Photoroom.png";
import pikachuImg from "@/assets/images/stat-pikachu-Photoroom.png";
import sylveonImg from "@/assets/images/stat-sylveon.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

const getSlides = (lang: 'pt' | 'en') => {
  const t = translations[lang].carousel.slides;
  return [
    {
      id: 4,
      pokemonName: "Pikachu",
      title: t[0].title,
      subtitle: t[0].subtitle,
      description: t[0].description,
      bgColor: "bg-[#e7da9b]",
      buttonColor: "border-[#d4c57b]",
      buttonHover: "hover:bg-slate-50",
      image: pikachuImg.src,
      price: t[0].price,
      imageContainerClass: "absolute top-[40%] md:top-[25%] max-md:left-[55%] md:left-[53%] transform -translate-x-1/2 -translate-y-1/2 z-10 md:z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-[22rem] h-[22rem] sm:w-[26rem] sm:h-[26rem] md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] xl:w-[380px] xl:h-[380px]",
      extraImage: sylveonImg.src,
      extraImageContainerClass: "absolute top-[65%] left-1/2 md:left-[75%] transform -translate-x-1/2 -translate-y-1/2 z-0 md:z-30 pointer-events-none overflow-visible",
      extraImageSizeClass: "w-[18rem] h-[18rem] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[550px] xl:h-[550px]"
    },
    {
      id: 1,
      pokemonName: "Charizard",
      title: t[1].title,
      subtitle: t[1].subtitle,
      description: t[1].description,
      bgColor: "bg-[#ff914d]",
      buttonColor: "border-[#ff914d]",
      buttonHover: "hover:bg-slate-50",
      image: charizardImg.src,
      price: t[1].price,
      imageContainerClass: "absolute top-[45%] md:top-1/2 max-md:left-[55%] md:left-[65%] transform -translate-x-1/2 -translate-y-1/2 z-10 md:z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-[28rem] h-[28rem] sm:w-[32rem] sm:h-[32rem] md:w-[600px] md:h-[600px] lg:w-[750px] lg:h-[750px] xl:w-[850px] xl:h-[850px]"
    },
    {
      id: 2,
      pokemonName: "Blastoise",
      title: t[2].title,
      subtitle: t[2].subtitle,
      description: t[2].description,
      bgColor: "bg-[#38b6ff]",
      buttonColor: "border-[#38b6ff]",
      buttonHover: "hover:bg-slate-50",
      image: blastoiseImg.src,
      price: t[2].price,
      imageContainerClass: "absolute top-[45%] md:top-1/2 max-md:left-[55%] md:left-[65%] transform -translate-x-1/2 -translate-y-1/2 z-10 md:z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-[26rem] h-[26rem] sm:w-[30rem] sm:h-[30rem] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
    },
    {
      id: 3,
      pokemonName: "Venusaur",
      title: t[3].title,
      subtitle: t[3].subtitle,
      description: t[3].description,
      bgColor: "bg-[#00bf63]",
      buttonColor: "border-[#00bf63]",
      buttonHover: "hover:bg-slate-50",
      image: venusaurImg.src,
      price: t[3].price,
      imageContainerClass: "absolute top-[35%] md:top-1/2 max-md:left-[40%] max-md:-scale-x-100 md:left-[65%] transform -translate-x-1/2 -translate-y-1/2 z-10 md:z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-[28rem] h-[28rem] sm:w-[32rem] sm:h-[32rem] md:w-[600px] md:h-[600px] lg:w-[750px] lg:h-[750px] xl:w-[850px] xl:h-[850px]"
    }
  ];
};

export default function HomeCarousel() {
  const { language } = useLanguage();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const slides = getSlides(language);
  const tBtns = translations[language].carousel.buttons;

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  return (
    <div 
      className={`relative w-full h-full rounded-none overflow-hidden transition-colors duration-700 shadow-xl max-md:bg-white max-md:dark:bg-slate-900 ${slides[current].bgColor} overscroll-y-none touch-pan-y`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      
      {/* --- Background Shapes --- */}
      {/* Desktop White Background Container */}
      <div className="hidden md:block absolute top-0 bottom-0 left-0 w-[65%] bg-white dark:bg-slate-900 z-0 transition-colors duration-700"></div>
      
      {/* Mobile Colored Diagonal Background (ON TOP of image) */}
      <div className={`md:hidden absolute inset-0 z-20 transition-colors duration-700 ${slides[current].bgColor}`} style={{ clipPath: 'polygon(0 85%, 100% 45%, 100% 100%, 0 100%)' }}></div>

      {/* --- Decorative Elements --- */}
      {/* Desktop Circles */}
      <div className="hidden md:block absolute top-[-80px] left-[-40px] w-96 h-96 bg-slate-100 dark:bg-slate-800 rounded-full opacity-60 pointer-events-none z-0"></div>
      <div className="hidden md:block absolute bottom-[-40px] right-[35%] w-56 h-56 bg-slate-100 dark:bg-slate-800 rounded-full opacity-60 pointer-events-none z-0"></div>
      
      {/* Mobile Circles */}
      <div className="md:hidden absolute top-[-40px] left-[-40px] w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-full opacity-80 pointer-events-none z-0"></div>
      <div className="md:hidden absolute top-[10%] right-[10%] w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full opacity-50 pointer-events-none z-0"></div>

      {/* --- Content Layer --- */}
      <div className="absolute inset-0 w-full h-full flex flex-col md:flex-row z-30 pointer-events-none">
        
        {/* Text Container */}
        <div className="relative w-full h-full md:w-[65%] p-8 md:p-16 flex flex-col justify-end md:justify-center items-end md:items-start pointer-events-auto pb-16 md:pb-16 z-20">
          
          <div key={`text-${current}`} className="relative flex flex-col items-end md:items-start text-right md:text-left max-md:animate-fade-in-up md:animate-fade-in-right w-full" style={{ animationDelay: '300ms' }}>
            
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white max-md:text-black max-md:dark:text-white tracking-tighter mb-0 md:mb-1 transition-all">
              {slides[current].title}
            </h2>
            
            <h3 className="text-[28px] sm:text-4xl md:text-5xl font-black md:font-light md:italic text-white dark:text-slate-400 max-md:text-white max-md:dark:text-white mb-3 md:mb-4 transition-all uppercase max-md:drop-shadow-sm max-md:tracking-wide">
              {slides[current].subtitle}
            </h3>
            
            <div className="hidden md:inline-block text-3xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-slate-200 dark:border-slate-700 pb-4 max-w-max mb-6">
              {slides[current].price}
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 max-md:text-black max-md:dark:text-black text-[13px] sm:text-sm md:text-base max-w-[260px] sm:max-w-[320px] md:max-w-md mb-6 md:mb-8 h-auto md:h-20 overflow-hidden transition-all max-md:font-medium">
              {slides[current].description}
            </p>
            
            <div className="flex items-center justify-end md:justify-start gap-4 md:gap-6 w-full">
              <button 
                onClick={() => router.push(`/pokedex?pokemonName=${slides[current].pokemonName}`)}
                className={`px-8 py-2 md:px-10 md:py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold rounded-full text-sm md:text-lg shadow-md border-2 transition-all hover:scale-105 flex items-center gap-2 max-md:bg-white max-md:text-slate-900 max-md:border-[#59F7E2] max-md:dark:bg-white max-md:dark:text-slate-900 md:${slides[current].buttonColor} md:${slides[current].buttonHover}`}
              >
                {tBtns.seeMore}
              </button>
              <button 
                onClick={() => router.push('/pokedex')}
                className="hidden md:block text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:text-white transition-colors"
              >
                {tBtns.explore}
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* --- Images --- */}
      <div key={`image-${current}`} className={`${slides[current].imageContainerClass} animate-fade-in-right`}>
        <div className={`relative drop-shadow-2xl transition-transform duration-300 ${slides[current].imageSizeClass}`}>
          <img 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-md:scale-[1.15]"
          />
        </div>
      </div>

      {slides[current].extraImage && (
        <div key={`extra-image-${current}`} className={`${slides[current].extraImageContainerClass} animate-fade-in-right max-md:hidden`} style={{ animationDelay: '150ms' }}>
          <div className={`relative drop-shadow-2xl transition-transform duration-300 ${slides[current].extraImageSizeClass}`}>
            <img 
              src={slides[current].extraImage} 
              alt="Extra Pokémon"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-md:scale-[1.15]"
            />
          </div>
        </div>
      )}

      {/* --- Navigation Buttons --- */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 hidden md:block">
        <button 
          onClick={prevSlide} 
          className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:text-slate-100 transition bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:bg-slate-900 rounded-full backdrop-blur-sm shadow-sm"
        >
          <ChevronLeft size={32} />
        </button>
      </div>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 hidden md:block">
        <button 
          onClick={nextSlide} 
          className="p-2 text-white/70 hover:text-white transition bg-black/10 hover:bg-black/20 rounded-full backdrop-blur-sm shadow-sm"
        >
          <ChevronRight size={32} />
        </button>
      </div>
      
      {/* Indicators (Dots) */}
      <div className="absolute bottom-6 left-1/2 md:left-[30%] transform -translate-x-1/2 z-40 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-slate-800 w-8" : "bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>

    </div>
  );
}
