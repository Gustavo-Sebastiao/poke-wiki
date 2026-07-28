"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-slate-800 dark:bg-slate-100 opacity-50"></div>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 bg-slate-800 text-amber-400 dark:bg-slate-100 dark:text-slate-800 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      title="Alternar Tema"
    >
      {isDark ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
    </button>
  );
}
