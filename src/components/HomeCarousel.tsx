"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      title: t[0].title,
      subtitle: t[0].subtitle,
      description: t[0].description,
      bgColor: "bg-[#e7da9b]",
      buttonColor: "border-[#d4c57b]",
      buttonHover: "hover:bg-slate-50",
      image: pikachuImg.src,
      price: t[0].price,
      imageContainerClass: "absolute top-[25%] left-1/2 md:left-[53%] transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-48 h-48 md:w-[280px] md:h-[280px] lg:w-[320px] lg:h-[320px] xl:w-[380px] xl:h-[380px]",
      extraImage: sylveonImg.src,
      extraImageContainerClass: "absolute top-[65%] left-1/2 md:left-[75%] transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none overflow-visible",
      extraImageSizeClass: "w-56 h-56 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] xl:w-[550px] xl:h-[550px]"
    },
    {
      id: 1,
      title: t[1].title,
      subtitle: t[1].subtitle,
      description: t[1].description,
      bgColor: "bg-[#ff914d]",
      buttonColor: "border-[#ff914d]",
      buttonHover: "hover:bg-slate-50",
      image: charizardImg.src,
      price: t[1].price,
      imageContainerClass: "absolute top-1/2 left-1/2 md:left-[65%] transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-80 h-80 md:w-[600px] md:h-[600px] lg:w-[750px] lg:h-[750px] xl:w-[850px] xl:h-[850px]"
    },
    {
      id: 2,
      title: t[2].title,
      subtitle: t[2].subtitle,
      description: t[2].description,
      bgColor: "bg-[#38b6ff]",
      buttonColor: "border-[#38b6ff]",
      buttonHover: "hover:bg-slate-50",
      image: blastoiseImg.src,
      price: t[2].price,
      imageContainerClass: "absolute top-1/2 left-1/2 md:left-[65%] transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-64 h-64 md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px]"
    },
    {
      id: 3,
      title: t[3].title,
      subtitle: t[3].subtitle,
      description: t[3].description,
      bgColor: "bg-[#00bf63]",
      buttonColor: "border-[#00bf63]",
      buttonHover: "hover:bg-slate-50",
      image: venusaurImg.src,
      price: t[3].price,
      imageContainerClass: "absolute top-1/2 left-1/2 md:left-[65%] transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none overflow-visible",
      imageSizeClass: "w-80 h-80 md:w-[600px] md:h-[600px] lg:w-[750px] lg:h-[750px] xl:w-[850px] xl:h-[850px]"
    }
  ];
};

export default function HomeCarousel() {
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);
  const slides = getSlides(language);
  const tBtns = translations[language].carousel.buttons;

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
  }, [current]);

  return (
    <div className={`relative w-full h-full rounded-none overflow-hidden transition-colors duration-700 shadow-xl ${slides[current].bgColor}`}>
      
      {/* Container branco na esquerda */}
      <div className="absolute top-0 bottom-0 left-0 w-full md:w-[65%] bg-white dark:bg-slate-900 p-8 md:p-16 flex flex-col justify-center z-10">
        
        {/* Bolinhas de fundo */}
        <div className="absolute top-[-80px] left-[-40px] w-64 h-64 md:w-96 md:h-96 bg-slate-100 dark:bg-slate-800 rounded-full opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-[-40px] right-[5%] w-40 h-40 md:w-56 md:h-56 bg-slate-100 dark:bg-slate-800 rounded-full opacity-60 pointer-events-none"></div>

        <div key={`text-${current}`} className="relative z-20 flex flex-col animate-fade-in-right" style={{ animationDelay: '300ms' }}>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 transition-all">
            {slides[current].title}
          </h2>
          <h3 className="text-3xl md:text-5xl font-light italic text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-4 transition-all uppercase">
            {slides[current].subtitle}
          </h3>
          
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 border-b-2 border-slate-200 dark:border-slate-700 pb-4 inline-block max-w-max mb-6">
            {slides[current].price}
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-md mb-8 h-20 overflow-hidden transition-all">
            {slides[current].description}
          </p>
          
          <div className="flex items-center gap-6">
            <button className={`px-10 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold rounded-full text-lg shadow-md border-2 transition-all hover:scale-105 flex items-center gap-2 ${slides[current].buttonColor} ${slides[current].buttonHover}`}>
              {tBtns.seeMore}
            </button>
            <button className="text-slate-600 dark:text-slate-300 font-semibold hover:text-slate-900 dark:text-white transition-colors">
              {tBtns.explore}
            </button>
          </div>
        </div>
      </div>

      {/* Imagem do Pokemon com posição e tamanho específicos de cada slide */}
      <div key={`image-${current}`} className={`${slides[current].imageContainerClass} animate-fade-in-right`}>
        <div className={`relative drop-shadow-2xl hover:scale-105 transition-transform duration-300 ${slides[current].imageSizeClass}`}>
          <img 
            src={slides[current].image} 
            alt={slides[current].title}
            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>

      {/* Imagem extra opcional (Ex: Sylveon no slide do Pikachu) */}
      {slides[current].extraImage && (
        <div key={`extra-image-${current}`} className={`${slides[current].extraImageContainerClass} animate-fade-in-right`} style={{ animationDelay: '150ms' }}>
          <div className={`relative drop-shadow-2xl hover:scale-105 transition-transform duration-300 ${slides[current].extraImageSizeClass}`}>
            <img 
              src={slides[current].extraImage} 
              alt="Extra Pokémon"
              className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />
          </div>
        </div>
      )}

      {/* Botões de navegação */}
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
      
      {/* Indicadores (Dots) na base */}
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
