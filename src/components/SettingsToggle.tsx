"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings, Moon, Sun, Globe } from "lucide-react";
import { useEffect, useState, useRef } from "react";

export default function SettingsToggle() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 opacity-50"></div>
    );
  }

  const isDark = theme === "dark";
  const isPt = language === "pt";

  return (
    <div className="fixed bottom-8 right-8 z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 text-slate-800 dark:text-slate-100 drop-shadow-md hover:scale-110 transition-all duration-300"
        title={language === "pt" ? "Configurações" : "Settings"}
      >
        <Settings className={`w-8 h-8 transition-transform duration-500 ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 w-64 animate-fade-in-down origin-bottom-right">
          <div className="flex flex-col gap-4">
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span>{language === "pt" ? "Modo Escuro" : "Dark Mode"}</span>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isDark} 
                  onChange={() => setTheme(isDark ? "light" : "dark")} 
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${isDark ? "bg-[#59F7E2]" : "bg-slate-300 dark:bg-slate-600"}`}></div>
                <div className={`absolute left-1 top-1 bg-white dark:bg-slate-800 w-4 h-4 rounded-full transition-transform ${isDark ? "transform translate-x-4" : ""}`}></div>
              </label>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-slate-100 dark:bg-slate-700"></div>

            {/* Language Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <Globe className="w-4 h-4" />
                <span>{language === "pt" ? "Português" : "English"}</span>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={isPt} 
                  onChange={() => setLanguage(isPt ? "en" : "pt")} 
                />
                <div className={`block w-14 h-6 rounded-full transition-colors ${isPt ? "bg-blue-500" : "bg-red-500"}`}></div>
                <div className={`absolute left-1 top-1 bg-white dark:bg-slate-800 w-4 h-4 rounded-full transition-transform flex items-center justify-center text-[10px] font-bold text-slate-800 ${isPt ? "transform translate-x-8" : ""}`}>
                  {isPt ? "PT" : "EN"}
                </div>
              </label>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
