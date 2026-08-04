"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { animate, createScope, createTimeline, utils } from "animejs";

import AdminToggle from './AdminToggle';
import SettingsToggle from './SettingsToggle';

import pokebolaMetade1 from "@/assets/icons/pokebola_metade_1_-removebg-preview.png";
import pokebolaMetade2 from "@/assets/icons/pokebola_metade_2_-removebg-preview.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";

function animateClosedMark(target: HTMLElement | null, active: boolean) {
  if (!target) return;

  animate(target, {
    rotate: active ? -20 : 0,
    scale: active ? 1.1 : 1,
    duration: active ? 180 : 220,
    ease: 'out(3)',
  });

  const glow = target.querySelector<HTMLElement>('[data-pokeball-glow]');
  if (glow) {
    animate(glow, {
      opacity: active ? 1 : 0,
      duration: active ? 180 : 220,
      ease: 'out(3)',
    });
  }
}

function getTransformState(target: HTMLElement) {
  const matrix = new DOMMatrixReadOnly(getComputedStyle(target).transform);

  return {
    rotate: Math.atan2(matrix.b, matrix.a) * (180 / Math.PI),
    scale: Math.hypot(matrix.a, matrix.b),
  };
}

function animateMarkToNeutral(
  target: HTMLElement,
  glow: HTMLElement,
  duration: number,
) {
  const startTransform = getTransformState(target);
  const startGlowOpacity = Number(getComputedStyle(glow).opacity);

  utils.remove(target);
  utils.remove(glow);
  utils.set(target, {
    rotate: startTransform.rotate,
    scale: startTransform.scale,
  });
  utils.set(glow, { opacity: startGlowOpacity });

  const interactionAnimation = animate(target, {
    rotate: 0,
    scale: 1,
    duration,
    ease: 'inOutCirc',
    autoplay: false,
  });
  const glowAnimation = animate(glow, {
    opacity: 0,
    duration,
    ease: 'inOutCirc',
    autoplay: false,
  });

  interactionAnimation.play();
  glowAnimation.play();

  return interactionAnimation;
}

function playTimelineToward(
  timeline: ReturnType<typeof createTimeline>,
  open: boolean,
) {
  timeline.reversed = !open;
}

const getNavItems = (lang: 'pt' | 'en') => {
  const t = translations[lang].menu;
  return [
    { name: t.home, path: "/" },
    { name: t.pokedex, path: "/pokedex" },
    { name: t.items, path: "/itens" },
  ];
};

export default function NavMenu() {
  const { language } = useLanguage();
  const navItems = getNavItems(language);
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pathname = usePathname();
  const activeIndex = Math.max(navItems.findIndex((item) => item.path === pathname), 0);
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const letterRefs = useRef<(HTMLSpanElement | null)[][]>([]);
  const desktopNavRef = useRef<HTMLElement>(null);
  const desktopBackgroundRef = useRef<HTMLDivElement>(null);
  const desktopPillRef = useRef<HTMLDivElement>(null);
  const desktopInteractionRef = useRef<HTMLDivElement>(null);
  const desktopGlowRef = useRef<HTMLDivElement>(null);
  const desktopMarkRef = useRef<HTMLDivElement>(null);
  const desktopCircleHalfRef = useRef<HTMLButtonElement>(null);
  const desktopPlainHalfRef = useRef<HTMLButtonElement>(null);
  const desktopContentRef = useRef<HTMLDivElement>(null);
  const desktopTimelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);
  const desktopInteractionAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const desktopAnimatingRef = useRef(false);
  const desktopTargetOpenRef = useRef(false);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobileInteractionRef = useRef<HTMLDivElement>(null);
  const mobileGlowRef = useRef<HTMLDivElement>(null);
  const mobileMarkRef = useRef<HTMLDivElement>(null);
  const mobileBackdropRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileTimelineRef = useRef<ReturnType<typeof createTimeline> | null>(null);
  const mobileInteractionAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const mobileAnimatingRef = useRef(false);
  const mobileExternalCloseRef = useRef(false);
  const mobileHoveredRef = useRef(false);
  const mobileFocusedRef = useRef(false);
  const mobileTargetOpenRef = useRef(false);

  useEffect(() => {
    const emphasizedIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;
    const target = navRefs.current[emphasizedIndex];
    const content = desktopContentRef.current;
    const pill = desktopPillRef.current;

    if (!isDesktopOpen || !target || !content || !pill) return;

    let selectionTimeline: ReturnType<typeof createTimeline> | null = null;
    const animateSelection = () => {
      const targetRect = target.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      selectionTimeline?.cancel();
      selectionTimeline = createTimeline({
        defaults: {
          duration: reduceMotion ? 1 : 220,
          ease: 'out(3)',
        },
      }).add(pill, {
        left: targetRect.left - contentRect.left,
        width: targetRect.width,
        opacity: 1,
      }, 0);

      letterRefs.current.forEach((letters, index) => {
        const emphasized = index === emphasizedIndex;

        letters.forEach((letter) => {
          if (!letter) return;

          selectionTimeline?.add(letter, {
            fontWeight: emphasized ? 700 : 500,
            ease: 'out(3)',
          }, 0);
        });
      });
    };

    animateSelection();
    window.addEventListener('resize', animateSelection);

    return () => {
      window.removeEventListener('resize', animateSelection);
      selectionTimeline?.cancel();
    };
  }, [hoveredIndex, activeIndex, isDesktopOpen]);

  useEffect(() => {
    const nav = desktopNavRef.current;
    const background = desktopBackgroundRef.current;
    const interaction = desktopInteractionRef.current;
    const mark = desktopMarkRef.current;
    const circleHalf = desktopCircleHalfRef.current;
    const plainHalf = desktopPlainHalfRef.current;
    const content = desktopContentRef.current;

    if (!nav || !background || !interaction || !mark || !circleHalf || !plainHalf || !content) return;

    const scope = createScope({ root: nav }).add(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const spinDuration = reduceMotion ? 1 : 400;
      const splitAt = reduceMotion ? 0 : spinDuration;
      const openDuration = reduceMotion ? 1 : 650;
      const contentWidth = () => content.scrollWidth;
      const finishAnimation = () => {
        desktopAnimatingRef.current = false;
        setIsDesktopOpen(desktopTargetOpenRef.current);

        if (!desktopTargetOpenRef.current) {
          animateClosedMark(
            interaction,
            circleHalf.matches(':hover') || circleHalf.matches(':focus-visible'),
          );
        }
      };

      desktopTimelineRef.current = createTimeline({
        autoplay: false,
        onComplete: finishAnimation,
      })
        .call(() => {
          if (!desktopTargetOpenRef.current) finishAnimation();
        }, 0)
        .add(mark, {
          rotate: [0, 360],
          duration: spinDuration,
          ease: 'in(3)',
        }, 0)
        .add(nav, {
          width: [56, () => 112 + contentWidth()],
          duration: openDuration,
          ease: 'out(4)',
        }, splitAt)
        .add(background, {
          opacity: [0, 1],
          duration: openDuration,
          ease: 'out(3)',
        }, splitAt)
        .add(content, {
          opacity: [0, 1],
          clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'],
          duration: openDuration,
          ease: 'out(4)',
        }, splitAt)
        .add(circleHalf, {
          rotate: [0, 90],
          duration: openDuration,
          ease: 'out(4)',
        }, splitAt)
        .add(plainHalf, {
          x: [0, () => 56 + contentWidth()],
          rotate: [0, 90],
          duration: openDuration,
          ease: 'out(4)',
        }, splitAt);
    });

    return () => {
      desktopTimelineRef.current = null;
      desktopInteractionAnimationRef.current = null;
      scope.revert();
    };
  }, []);

  useEffect(() => {
    const trigger = mobileTriggerRef.current;
    const interaction = mobileInteractionRef.current;
    const mark = mobileMarkRef.current;
    const backdrop = mobileBackdropRef.current;
    const panel = mobilePanelRef.current;

    if (!trigger || !interaction || !mark || !backdrop || !panel) return;

    const scope = createScope({ root: document.body }).add(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = reduceMotion ? 1 : 1050;
      const finishAnimation = () => {
        const targetOpen = mobileTargetOpenRef.current;
        const closedExternally = mobileExternalCloseRef.current;

        mobileAnimatingRef.current = false;
        mobileExternalCloseRef.current = false;
        setIsOpen(targetOpen);
        animateClosedMark(
          interaction,
          !closedExternally
            && (mobileHoveredRef.current || mobileFocusedRef.current),
        );
      };

      mobileTimelineRef.current = createTimeline({
        autoplay: false,
        defaults: {
          duration,
          ease: 'inOutCirc',
        },
        onComplete: finishAnimation,
      })
        .call(() => {
          if (!mobileTargetOpenRef.current) finishAnimation();
        }, 0)
        .add(backdrop, {
          opacity: [0, 1],
        }, 0)
        .add(panel, {
          x: ['-100%', '0%'],
        }, 0)
        .add(mark, {
          rotate: [0, 720],
        }, 0);
    });

    return () => {
      mobileTimelineRef.current = null;
      mobileInteractionAnimationRef.current = null;
      scope.revert();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleDesktopToggle = () => {
    const timeline = desktopTimelineRef.current;
    const interaction = desktopInteractionRef.current;
    const glow = desktopGlowRef.current;
    if (!timeline || !interaction || !glow) return;

    const nextOpen = !desktopTargetOpenRef.current;
    const wasAnimating = desktopAnimatingRef.current;
    desktopTargetOpenRef.current = nextOpen;
    desktopAnimatingRef.current = true;
    setIsDesktopOpen(nextOpen);

    if (nextOpen) {
      if (!wasAnimating) timeline.refresh();

      const neutralDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 1
        : Math.max(400 - Math.min(timeline.currentTime, 400), 1);
      desktopInteractionAnimationRef.current = animateMarkToNeutral(
        interaction,
        glow,
        neutralDuration,
      );
      playTimelineToward(timeline, true);
      return;
    }

    const neutralDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 1
      : Math.max(timeline.currentTime, 1);
    desktopInteractionAnimationRef.current = animateMarkToNeutral(
      interaction,
      glow,
      neutralDuration,
    );
    playTimelineToward(timeline, false);
  };

  const handleMobileToggle = () => {
    const timeline = mobileTimelineRef.current;
    const interaction = mobileInteractionRef.current;
    const glow = mobileGlowRef.current;
    const mark = mobileMarkRef.current;
    if (!timeline || !interaction || !glow || !mark) return;

    const nextOpen = !mobileTargetOpenRef.current;
    mobileTargetOpenRef.current = nextOpen;
    mobileAnimatingRef.current = true;

    if (nextOpen) {
      mobileExternalCloseRef.current = false;
      setIsOpen(true);
      const neutralDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 1
        : Math.max(timeline.duration - timeline.currentTime, 1);
      mobileInteractionAnimationRef.current = animateMarkToNeutral(
        interaction,
        glow,
        neutralDuration,
      );
      playTimelineToward(timeline, true);
      return;
    }

    const neutralDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 1
      : Math.max(timeline.currentTime, 1);
    mobileInteractionAnimationRef.current = animateMarkToNeutral(
      interaction,
      glow,
      neutralDuration,
    );
    playTimelineToward(timeline, false);
  };

  const handleMobileClose = () => {
    mobileExternalCloseRef.current = true;
    mobileHoveredRef.current = false;
    mobileFocusedRef.current = false;
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

    const interaction = mobileInteractionRef.current;
    const glow = mobileGlowRef.current;
    if (interaction && glow) {
      utils.remove(interaction);
      utils.remove(glow);
      utils.set(interaction, { rotate: 0, scale: 1 });
      utils.set(glow, { opacity: 0 });
    }

    if (mobileTargetOpenRef.current) handleMobileToggle();
  };

  return (
    <>
      <nav
        ref={desktopNavRef}
        className="relative hidden h-14 w-14 items-center overflow-visible lg:flex"
        aria-label="Navegação principal"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <div
          ref={desktopBackgroundRef}
          className="pointer-events-none absolute inset-0 rounded-full bg-white opacity-0 shadow-md dark:bg-slate-800"
        />

        <div ref={desktopInteractionRef} className="absolute top-0 left-0 z-20 h-14 w-14">
          <div
            ref={desktopGlowRef}
            data-pokeball-glow
            className="pointer-events-none absolute inset-2 rounded-full bg-[#ff3131]/35 opacity-0 blur-md"
          />
          <div ref={desktopMarkRef} className="absolute inset-0 z-10 h-14 w-14">
            <button
              ref={desktopCircleHalfRef}
              type="button"
              className="absolute inset-0 flex cursor-pointer items-center justify-center"
              onClick={handleDesktopToggle}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse' && !isDesktopOpen && !desktopAnimatingRef.current) {
                  animateClosedMark(desktopInteractionRef.current, true);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse' && !isDesktopOpen && !desktopAnimatingRef.current) {
                  animateClosedMark(desktopInteractionRef.current, false);
                }
              }}
              onPointerDown={() => {
                if (!isDesktopOpen && !desktopAnimatingRef.current) {
                  animateClosedMark(desktopInteractionRef.current, true);
                }
              }}
              onPointerCancel={() => animateClosedMark(desktopInteractionRef.current, false)}
              onFocus={(event) => {
                if (event.currentTarget.matches(':focus-visible') && !isDesktopOpen && !desktopAnimatingRef.current) {
                  animateClosedMark(desktopInteractionRef.current, true);
                }
              }}
              onBlur={() => {
                if (!isDesktopOpen && !desktopAnimatingRef.current) {
                  animateClosedMark(desktopInteractionRef.current, false);
                }
              }}
              aria-expanded={isDesktopOpen}
              aria-label={isDesktopOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <Image
                src={pokebolaMetade1}
                alt=""
                fill
                sizes="56px"
                priority
                className="object-contain drop-shadow-md"
              />
            </button>

            <button
              ref={desktopPlainHalfRef}
              type="button"
              className={`absolute inset-0 flex cursor-pointer items-center justify-center ${
                isDesktopOpen ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              onClick={handleDesktopToggle}
              tabIndex={isDesktopOpen ? 0 : -1}
              aria-hidden={!isDesktopOpen}
              aria-label="Fechar menu"
            >
              <Image
                src={pokebolaMetade2}
                alt=""
                fill
                sizes="56px"
                priority
                className="object-contain drop-shadow-md"
              />
            </button>
          </div>
        </div>

        <div
          ref={desktopContentRef}
          className="absolute top-0 left-14 z-10 flex h-full w-max items-center overflow-hidden px-1 opacity-0"
          style={{ clipPath: 'inset(0 100% 0 0)' }}
          aria-hidden={!isDesktopOpen}
        >
          {/* Pílula branca indicando item ativo/hover */}
          <div
            ref={desktopPillRef}
            className="absolute top-1.5 bottom-1.5 z-0 w-0 rounded-full bg-white/80 opacity-0 shadow-sm dark:bg-slate-700/80"
          />
          
          <div className="relative z-10 flex items-center w-max gap-1">
            {navItems.map((item, index) => {
              const isHovered = hoveredIndex === index;
              const isActive = activeIndex === index && hoveredIndex === null;
              const isEmphasized = isHovered || isActive;
              
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  ref={(el) => {
                    if (el) navRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  tabIndex={isDesktopOpen ? undefined : -1}
                  className={`grid px-5 py-2 font-sans text-base transition-colors duration-300 ${
                    isEmphasized ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <span
                    role="text"
                    aria-label={item.name}
                    className="col-start-1 row-start-1 inline-flex justify-center"
                  >
                    {Array.from(item.name).map((character, characterIndex) => (
                      <span key={`${character}-${characterIndex}`} className="inline-grid">
                        <span
                          aria-hidden="true"
                          className="nav-menu-letter-measure invisible col-start-1 row-start-1"
                        >
                          {character === ' ' ? '\u00a0' : character}
                        </span>
                        <span
                          ref={(element) => {
                            const letters = letterRefs.current[index] ?? [];
                            letters[characterIndex] = element;
                            letterRefs.current[index] = letters;
                          }}
                          aria-hidden="true"
                          className="nav-menu-letter col-start-1 row-start-1 text-center"
                        >
                          {character === ' ' ? '\u00a0' : character}
                        </span>
                      </span>
                    ))}
                  </span>
                </Link>
              );
            })}
            
            <div className="px-2 pl-4 flex items-center z-20">
               <AdminToggle />
            </div>
          </div>
        </div>
      </nav>

      <button
        ref={mobileTriggerRef}
        type="button"
        className="relative z-[1001] flex cursor-pointer touch-manipulation items-center justify-center px-2 py-1 lg:hidden"
        onClick={handleMobileToggle}
        onPointerEnter={(event) => {
          if (
            event.pointerType === 'mouse'
            && !mobileAnimatingRef.current
          ) {
            mobileHoveredRef.current = true;
            animateClosedMark(mobileInteractionRef.current, true);
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') {
            mobileHoveredRef.current = false;
            if (!mobileAnimatingRef.current) animateClosedMark(mobileInteractionRef.current, false);
          }
        }}
        onPointerDown={() => {
          if (!mobileAnimatingRef.current) {
            animateClosedMark(mobileInteractionRef.current, true);
          }
        }}
        onPointerCancel={() => {
          if (!mobileAnimatingRef.current) animateClosedMark(mobileInteractionRef.current, false);
        }}
        onFocus={(event) => {
          if (
            event.currentTarget.matches(':focus-visible')
            && !mobileAnimatingRef.current
          ) {
            mobileFocusedRef.current = true;
            animateClosedMark(mobileInteractionRef.current, true);
          }
        }}
        onBlur={() => {
          mobileFocusedRef.current = false;
          if (!mobileAnimatingRef.current && !mobileHoveredRef.current) {
            animateClosedMark(mobileInteractionRef.current, false);
          }
        }}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-panel"
        aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        <div ref={mobileInteractionRef} className="relative">
          <div
            ref={mobileGlowRef}
            data-pokeball-glow
            className="pointer-events-none absolute inset-2 rounded-full bg-[#ff3131]/35 opacity-0 blur-md"
          />
          <div ref={mobileMarkRef} className="relative z-10 h-14 w-14">
            <Image
              src={pokebolaMetade1}
              alt=""
              fill sizes="56px" priority className="object-contain drop-shadow-md"
            />
            <Image
              src={pokebolaMetade2}
              alt=""
              fill sizes="56px" priority className="object-contain drop-shadow-md"
            />
          </div>
        </div>
      </button>

      <div
        className={`fixed inset-0 z-[1000] flex lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        <div
          ref={mobileBackdropRef}
          className="absolute inset-0 bg-black/60 opacity-0 backdrop-blur-sm"
          onClick={handleMobileClose}
        />

        <div
          id="mobile-navigation-panel"
          ref={mobilePanelRef}
          className="relative flex h-full w-[82vw] max-w-80 flex-col bg-white p-4 shadow-2xl dark:bg-slate-900"
          style={{ transform: 'translateX(-100%)' }}
        >
          <div className="relative mb-6 h-16 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="absolute -left-2 -top-2 h-16 w-[4.5rem]" aria-hidden="true" />
            <button
              type="button"
              onClick={handleMobileClose}
              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59F7E2] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Fechar menu"
              tabIndex={isOpen ? 0 : -1}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={handleMobileClose}
                tabIndex={isOpen ? undefined : -1}
                className={`px-4 py-3.5 rounded-2xl text-lg transition-colors ${
                  pathname === item.path 
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 font-medium"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-auto flex flex-col gap-5 border-t border-slate-100 pt-5 dark:border-slate-800">
            <SettingsToggle variant="inline" />
            <div className="flex justify-center">
              <AdminToggle direction="up" onNavigate={handleMobileClose} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
