import HomeCarousel from "@/components/HomeCarousel";
import GifGallery from "@/components/GifGallery";

export default function Home() {
  return (
    <main className="flex flex-col w-full bg-white">
      {/* Primeira Sessão: O Carrossel que já existia */}
      <section className="h-screen w-full relative z-10">
        <HomeCarousel />
      </section>
      
      {/* Segunda Sessão: Galeria de GIFs */}
      <section className="h-screen w-full relative z-0">
        <GifGallery />
      </section>
    </main>
  );
}
