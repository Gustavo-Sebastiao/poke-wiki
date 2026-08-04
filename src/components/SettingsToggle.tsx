"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Settings, Moon, Sun, Globe } from "lucide-react";
import { useEffect, useState, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createDraggable, spring } from "animejs";

interface SettingsToggleProps {
  variant?: 'floating' | 'inline';
}

const subscribeToHydration = () => () => {};

interface SegmentedOption {
  label: ReactNode;
  ariaLabel: string;
}

interface DraggableSegmentedControlProps {
  label: string;
  options: [SegmentedOption, SegmentedOption];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function DraggableSegmentedControl({
  label,
  options,
  selectedIndex,
  onSelect,
}: DraggableSegmentedControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<ReturnType<typeof createDraggable> | null>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    onSelectRef.current = onSelect;
  }, [selectedIndex, onSelect]);

  useEffect(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return;

    const travel = () => (track.clientWidth - 4) / 2;
    const applyCenterDetent = (value: number) => {
      const distance = travel();
      if (distance <= 0) return 0;

      const progress = Math.min(Math.max(value / distance, 0), 1);
      const resistance = 0.48;
      const resistedProgress = (sideProgress: number) => (
        sideProgress - resistance * sideProgress * sideProgress
      );

      return progress < 0.5
        ? distance * resistedProgress(progress)
        : distance * (1 - resistedProgress(1 - progress));
    };
    const draggable = createDraggable(thumb, {
      trigger: track,
      container: track,
      containerPadding: 2,
      x: {
        modifier: applyCenterDetent,
        snap: () => [0, travel()],
      },
      y: false,
      dragThreshold: 2,
      velocityMultiplier: 0,
      releaseEase: spring({
        stiffness: 420,
        damping: 28,
        mass: 0.7,
      }),
      cursor: {
        onHover: 'grab',
        onGrab: 'grabbing',
      },
      onSnap: (self) => {
        onSelectRef.current(self.destX >= travel() / 2 ? 1 : 0);
      },
      onSettle: () => {
        thumb.style.zIndex = '0';
      },
      onAfterResize: (self) => {
        const selectedPosition = selectedIndexRef.current === 1 ? travel() : 0;
        self.setX(selectedPosition, true);
        self.snapped[0] = selectedPosition;
      },
    });

    const initialPosition = selectedIndexRef.current === 1 ? travel() : 0;
    draggable.setX(initialPosition, true);
    draggable.snapped[0] = initialPosition;
    draggableRef.current = draggable;

    return () => {
      draggableRef.current = null;
      draggable.revert();
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const draggable = draggableRef.current;
    if (!track || !draggable || draggable.grabbed) return;

    const travel = (track.clientWidth - 4) / 2;
    const selectedPosition = selectedIndex === 1 ? travel : 0;
    draggable.snapped[0] = selectedPosition;
    draggable.animate[draggable.xProp](selectedPosition, 220, 'outCirc');
  }, [selectedIndex]);

  return (
    <div
      ref={trackRef}
      className="relative isolate flex h-9 w-24 shrink-0 touch-pan-y items-center overflow-hidden rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800"
      role="group"
      aria-label={label}
    >
      <div
        ref={thumbRef}
        className="pointer-events-none absolute left-0.5 top-0.5 z-0 h-8 w-[calc(50%-0.125rem)] rounded-lg bg-white shadow-sm will-change-transform dark:bg-slate-700"
      />
      {options.map((option, index) => (
        <button
          key={option.ariaLabel}
          type="button"
          onClick={() => onSelect(index)}
          className={`relative z-20 flex h-8 flex-1 items-center justify-center rounded-lg text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59F7E2] ${
            selectedIndex === index
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
          aria-label={option.ariaLabel}
          aria-pressed={selectedIndex === index}
        >
          <span className="relative z-20 flex items-center justify-center">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function SettingsToggle({ variant = 'floating' }: SettingsToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      <div
        className={variant === 'inline'
          ? "h-[7.25rem] w-full"
          : "fixed bottom-8 right-8 z-50 hidden h-14 w-14 opacity-50 lg:flex"
        }
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  const controls = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span>{language === "pt" ? "Tema" : "Theme"}</span>
        </div>

        <DraggableSegmentedControl
          label={language === "pt" ? "Tema" : "Theme"}
          options={[
            { label: <Sun className="h-4 w-4" />, ariaLabel: language === "pt" ? "Tema claro" : "Light theme" },
            { label: <Moon className="h-4 w-4" />, ariaLabel: language === "pt" ? "Tema escuro" : "Dark theme" },
          ]}
          selectedIndex={isDark ? 1 : 0}
          onSelect={(index) => setTheme(index === 1 ? 'dark' : 'light')}
        />
      </div>

      <div className="h-px w-full bg-slate-100 dark:bg-slate-700" />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Globe className="h-4 w-4" />
          <span>{language === "pt" ? "Idioma" : "Language"}</span>
        </div>

        <DraggableSegmentedControl
          label={language === "pt" ? "Idioma" : "Language"}
          options={[
            { label: 'PT', ariaLabel: 'Português' },
            { label: 'EN', ariaLabel: 'English' },
          ]}
          selectedIndex={language === 'en' ? 1 : 0}
          onSelect={(index) => setLanguage(index === 1 ? 'en' : 'pt')}
        />
      </div>
    </div>
  );

  if (variant === 'inline') {
    return <div className="w-full px-1">{controls}</div>;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 hidden lg:block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 text-slate-800 dark:text-slate-100 drop-shadow-md hover:scale-110 transition-all duration-300"
        title={language === "pt" ? "Configurações" : "Settings"}
      >
        <Settings className={`w-8 h-8 transition-transform duration-500 ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 mb-4 w-64 origin-bottom-right animate-fade-in-down rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {controls}
        </div>
      )}
    </div>
  );
}
