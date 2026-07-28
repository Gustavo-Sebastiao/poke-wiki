import NavMenu from './NavMenu';

export default function Header() {
  return (
    <header className="absolute top-0 z-50 w-full bg-transparent">
      <div className="max-w-[1440px] mx-auto flex h-20 items-center px-4 md:px-8 gap-4">
        
        {/* Lado Esquerdo com o NavMenu Expansível */}
        <div className="flex-1 flex justify-start -ml-2">
          <NavMenu />
        </div>

        {/* Menu Centralizado (Vazio agora, pois o NavMenu foi para a esquerda) */}
        <div className="flex-shrink-0">
        </div>
        
        {/* Lado Direito */}
        <div className="flex-1 flex justify-end">
        </div>
      </div>
    </header>
  );
}
