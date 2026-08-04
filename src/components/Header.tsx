"use client";

import NavMenu from './NavMenu';
import GlobalSearch from './GlobalSearch';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 z-50 w-full bg-transparent">
      <div className="site-header-fade pointer-events-none absolute inset-x-0 top-0 h-32" aria-hidden="true" />
      <div className="relative z-10 max-w-[1440px] mx-auto flex h-20 items-center px-4 md:px-8 gap-4">
        <div className="flex-1 flex justify-start -ml-2">
          <NavMenu />
        </div>

        <div className="flex-shrink-0 md:w-[360px]">
          {pathname !== '/login' && <GlobalSearch />}
        </div>

        <div className="hidden flex-1 md:block" aria-hidden="true" />
      </div>
    </header>
  );
}
