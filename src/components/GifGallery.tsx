'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './GifGallery.module.css';

// Import all GIFs explicitly
import gif1 from '../assets/gifs/2abc30e8edddb36244d76934fcdd005b.gif';
import gif2 from '../assets/gifs/4fd0c049c173c9beb5a0101a84deb6f9.gif';
import gif3 from '../assets/gifs/5cf9a23a8ebf6f8ffd923b32ff47f9cb.gif';
import gif4 from '../assets/gifs/5GpG.gif';
import gif5 from '../assets/gifs/2584118_964fe.gif';
import gif6 from '../assets/gifs/b902bf0319416561211f8524ff517bcb.gif';
import gif7 from '../assets/gifs/c30e4e41dee5d6c7c5857f4b295c74d2.gif';
import gif8 from '../assets/gifs/charizard_pixelgif.gif';
import gif9 from '../assets/gifs/dkj3uf3-dda93834-5372-4956-814c-aa17dcd7479b.gif';
import gif10 from '../assets/gifs/e21516ef3814c7cce41461558a41eb10.gif';
import gif11 from '../assets/gifs/picgifs-pokemon-517810.gif';
import gif12 from '../assets/gifs/pikachu_pixelgif.gif';
import gif13 from '../assets/gifs/totodile-pokemon.gif';
import gif14 from '../assets/gifs/tumblr_ml5q06jBQc1s5h198o1_500.gif';
import gif15 from '../assets/gifs/video games pokemon STICKER.gif';

// Novos GIFs
import gif16 from '../assets/gifs/part_2/tumblr_ms7w2tvude1scncwdo1_500.gif';
import gif17 from '../assets/gifs/part_2/tumblr_ml5pj2vcTR1s5h198o1_500.gif';
import gif18 from '../assets/gifs/part_2/e82be6cee446f9b3f8a0b70b2649f679.gif';
import gif19 from '../assets/gifs/part_2/dl4jx55-63e44d71-c0e2-4e66-a67c-9d32578e7b0a.gif';
import gif20 from '../assets/gifs/part_2/de4ao0q-2cb04e86-d962-41cc-bf47-9755e623fbc5.gif';
import gif21 from '../assets/gifs/part_2/meowth_bouncy.gif';
import gif22 from '../assets/gifs/part_2/830b53f8bbd0e9dbcade87da95abdad0.gif';
import gif23 from '../assets/gifs/part_2/2d1e8b2d9f918d0f8a4cf19ac2210ce6.gif';

const allGifs = [
  gif1, gif2, gif3, gif4, gif5, 
  gif6, gif7, gif8, gif9, gif10, 
  gif11, gif12, gif13, gif14, gif15,
  gif16, gif17, gif18, gif19, gif20,
  gif21, gif22, gif23
];

// Dividindo os 23 GIFs únicos entre as 4 colunas para não haver repetição
const col1 = allGifs.slice(0, 6);
const col2 = allGifs.slice(6, 12);
const col3 = allGifs.slice(12, 18);
const col4 = allGifs.slice(18, 23);

const Col = ({ gifs, direction }: { gifs: any[], direction: 'up' | 'down' }) => {
  // To make infinite scroll seamless, duplicate the content in each column
  // We duplicate it 3 times to ensure the loop is continuous without breaking
  const repeatedGifs = [...gifs, ...gifs, ...gifs]; 

  return (
    <div className={`${styles.column} ${direction === 'up' ? styles.marqueeUp : styles.marqueeDown}`}>
      {repeatedGifs.map((gif, index) => (
        <div 
          key={index} 
          className={`${styles.gifItem} bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700`}
        >
          <Image 
            src={gif} 
            alt={`Pokemon GIF ${index}`} 
            fill 
            sizes="(max-width: 768px) 150px, 220px"
            className={styles.gifImage}
            unoptimized={true} // Unoptimized keeps the original GIF animated (Next.js image optimization would convert it to a static image)
          />
        </div>
      ))}
    </div>
  );
};

const GifGallery = () => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 } // Aciona quando 40% do componente estiver visível
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return (
    <div className={`${styles.galleryContainer} bg-[#fafafa] dark:bg-slate-900`} ref={containerRef}>
      <div className={styles.galleryWrapper}>
        <Col gifs={col1} direction="up" />
        <Col gifs={col2} direction="down" />
        <Col gifs={col3} direction="up" />
        <Col gifs={col4} direction="down" />
      </div>
      <div className={`${styles.overlay} hidden md:block bg-[linear-gradient(to_right,transparent_0%,transparent_40%,rgba(250,250,250,0.95)_75%,#fafafa_100%)] dark:bg-[linear-gradient(to_right,transparent_0%,transparent_40%,rgba(15,23,42,0.95)_75%,#0f172a_100%)]`}></div>
      
      {/* Texto e botão flutuantes com fade in da direita */}
      <div className={`absolute right-0 left-0 mx-auto md:mx-0 md:left-auto md:right-[4%] lg:right-[4%] w-[90%] md:w-[40%] z-30 flex flex-col items-center md:items-end justify-center transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16'}`}>
        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-slate-800 dark:text-white tracking-tighter mb-4 uppercase text-center md:text-right drop-shadow-md leading-tight">
          Comece sua<br/>Aventura
        </h2>
        <p className="text-base md:text-lg font-medium mb-8 max-w-md text-center md:text-right text-slate-600 dark:text-slate-300">
          Desbrave o universo Pokémon. Milhares de espécies prontas para serem descobertas. Tire suas dúvidas e conheça cada detalhe desse mundo fascinante!
        </p>
        <button className="px-10 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 font-semibold rounded-full text-lg shadow-md border-2 border-teal-400 dark:border-teal-500 transition-all hover:scale-105 hover:bg-teal-50 dark:hover:bg-teal-900/30 flex items-center gap-2">
          Acessar a Wiki
        </button>
      </div>
    </div>
  );
};

export default GifGallery;
