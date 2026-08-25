"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo, useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLenis } from 'lenis/react';

import { usePageTransition } from '@shared/hooks/usePageTransition';
import { useModal } from "@shared/hooks/useModal"; 
import { usePageEnterContext } from '@providers/PageEnterProvider';
import { usePreloader } from '@providers/PreloaderProvider';
import { useBreakpoint } from '@shared/hooks/useIsTouchDevice';
import { useAsciiDelay } from '@shared/hooks/useAsciiDelay'; 
import { usePageEnter } from '@shared/hooks/usePageEnter';
import { getLenis } from '@providers/LenisProvider';
import { cx } from '@lib/vendor';
import { HeaderLogo } from '@components/utilities/HeaderLogo';
import { MenuButton } from '@components/ui/MenuButton';
import { NavigationFlyout } from '@components/layout/NavigationFlyout';
import { AnimatedButton } from '@features/animations/components/AnimatedButton';
import { SECTION_THEME_SELECTOR, NAV_SCROLL_THRESHOLDS } from '@shared/constants/NavScroll';

function useEventListener(eventName, handler, element = window, options) {
  const savedHandler = useRef(handler);
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);
  
  useEffect(() => {
    if (!element) return;
    const listener = (e) => {
      savedHandler.current(e);
    };
    element.addEventListener(eventName, listener, options);
    return () => {
      element.removeEventListener(eventName, listener, options);
    };
  }, [eventName, element, options]);
}

function useKeyPress(key, handler, options = false) {
  const listener = useCallback((e) => {
    if (e.key === key) handler(e);
  }, [key, handler]);
  
  useEffect(() => {
    window.addEventListener("keydown", listener, options);
    return () => {
      window.removeEventListener("keydown", listener, options);
    };
  }, [listener, options]);
}

function useHeaderLogic(headerContentRefNode) {
  const [scrollState, setScrollState] = useState("top");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerTheme, setHeaderTheme] = useState("dark");
  usePathname();

  const { phase } = usePageTransition();

  const checkTheme = useCallback((offsetTop) => {
    const sections = document.querySelectorAll(SECTION_THEME_SELECTOR);
    if (sections.length === 0) return false;
    
    const activeSection = Array.from(sections).find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= offsetTop && rect.bottom > offsetTop;
    });
    
    if (activeSection) {
      const theme = activeSection.dataset.theme;
      if (theme && ["light", "dark", "brand"].includes(theme)) {
        setHeaderTheme(theme);
        return true;
      }
    }
    
    const firstSection = sections[0];
    const firstTheme = firstSection?.dataset.theme;
    if (firstTheme && ["light", "dark", "brand"].includes(firstTheme)) {
      setHeaderTheme(firstTheme);
      return true;
    }
    
    return false;
  }, []);

  useEventListener("scroll", () => {
    setScrollState(window.scrollY > 50 ? "scrolled" : "top");
    if (headerContentRefNode.current) {
      checkTheme(headerContentRefNode.current.offsetTop);
    }
  }, window, { passive: true });

  useEffect(() => {
    if (headerContentRefNode.current && (phase === "exiting" || phase === "idle")) {
      checkTheme(headerContentRefNode.current.offsetTop);
    }
  }, [phase, checkTheme, headerContentRefNode]);

  useEffect(() => {
    if (!headerContentRefNode.current) return;
    const offsetTop = headerContentRefNode.current.offsetTop;
    
    if (document.querySelectorAll(SECTION_THEME_SELECTOR).length > 0) {
      checkTheme(offsetTop);
      return;
    }
    
    const observer = new MutationObserver(() => {
      if (document.querySelectorAll(SECTION_THEME_SELECTOR).length > 0) {
        checkTheme(offsetTop);
        observer.disconnect();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    
    return () => observer.disconnect();
  }, [checkTheme, headerContentRefNode]);

  const headerState = useMemo(() => (isMenuOpen ? "menuOpen" : scrollState), [isMenuOpen, scrollState]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useKeyPress("Escape", () => {
    if (isMenuOpen) closeMenu();
  });

  const scrollLockRef = useRef(false);
  useEffect(() => {
    if (isMenuOpen) {
      getLenis()?.stop();
      scrollLockRef.current = true;
    } else if (scrollLockRef.current) {
      getLenis()?.start();
      scrollLockRef.current = false;
    }
  }, [isMenuOpen]);

  return {
    scrollState,
    isMenuOpen,
    headerState,
    headerTheme,
    sectionTheme: headerTheme,
    toggleMenu,
    closeMenu
  };
}

export function HeaderClient({
  navItems,
  headerCta,
  flyout,
  spotsRemaining
}) {
  const headerRef = useRef(null);
  const headerContentRef = useRef(null);
  
  const {
    isMenuOpen,
    headerState,
    headerTheme,
    toggleMenu,
    closeMenu
  } = useHeaderLogic(headerContentRef);
  
  const { openModal } = useModal();
  const { prefersReducedMotion } = usePageEnterContext();
  const { isInitialLoad } = usePreloader();
  const isLg = useBreakpoint("lg");
  const asciiDelay = useAsciiDelay();
  
  useLayoutEffect(() => {
    if (isInitialLoad && !prefersReducedMotion && headerRef.current) {
      headerRef.current.classList.add("header-hidden", "no-transition");
      requestAnimationFrame(() => {
        headerRef.current?.classList.remove("no-transition");
      });
    }
  }, [isInitialLoad, prefersReducedMotion]);

  const headerPadding = NAV_SCROLL_THRESHOLDS[headerState];
  const currentPadding = isLg 
    ? headerPadding 
    : (headerState === "top" ? 0 : (headerState === "scrolled" ? 16 : 24));

  const { phase } = usePageTransition();

  useEffect(() => {
    if (!prefersReducedMotion && headerRef.current) {
      if (phase === "entering") {
        headerRef.current.classList.add("header-hidden");
      } else if (phase === "holding") {
        headerRef.current.classList.add("header-hidden", "no-transition");
        requestAnimationFrame(() => {
          headerRef.current?.classList.remove("no-transition");
        });
      }
    }
  }, [phase, prefersReducedMotion]);

  const onPageEnter = useCallback((delay) => {
    if (headerRef.current) {
      setTimeout(() => {
        headerRef.current?.classList.remove("header-hidden");
      }, (delay + (isInitialLoad ? asciiDelay : 0)) * 1000);
    }
  }, [asciiDelay, isInitialLoad]);

  usePageEnter(onPageEnter, {
    priority: 0,
    skip: prefersReducedMotion
  });

  const hideHeaderRef = useRef(false);

  useEffect(() => {
    if (phase === "entering" || phase === "holding") {
      hideHeaderRef.current = false;
    }
  }, [phase]);

  const onLenisScroll = useCallback(() => {
    if (prefersReducedMotion || !headerRef.current) return;
    
    const threshold = 0.1 * window.innerHeight;
    let shouldHide = false;
    const footer = document.querySelector("footer");
    
    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.height > 0 && footerRect.top <= threshold) {
        shouldHide = true;
      }
    }
    
    if (!shouldHide) {
      for (const el of document.querySelectorAll("[data-hide-header]")) {
        if (el.getBoundingClientRect().top <= threshold) {
          shouldHide = true;
          break;
        }
      }
    }
    
    if (shouldHide !== hideHeaderRef.current) {
      hideHeaderRef.current = shouldHide;
      headerRef.current.classList.toggle("header-hidden", shouldHide);
    }
  }, [prefersReducedMotion]);

  useLenis(onLenisScroll);

  const backdropClass = isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0";
  const backdropClassName = cx("fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm", "transition-opacity duration-500 ease-out", backdropClass);
  
  const headerContainerClass = cx("fixed inset-x-0 top-0 z-[9999]", "flex flex-col gap-8 pt-16", "!bg-transparent transition-colors duration-300 ease-out");
  
  const containerBgClass = headerState === "top" ? "bg-transparent" : "bg-surface";
  const containerClassName = cx("grid-container transition-[padding,background-color,color] duration-500 ease-out", containerBgClass);
  
  return (
    <>
      <div 
        onClick={closeMenu} 
        className={backdropClassName} 
        aria-hidden="true" 
      />
      <header 
        ref={headerRef} 
        data-theme={headerTheme} 
        className={headerContainerClass}
      >
        <div 
          ref={headerContentRef} 
          className={containerClassName} 
          style={{ paddingLeft: currentPadding, paddingRight: currentPadding }}
        >
          <div className="py-16">
            <div className="grid grid-cols-2 items-center lg:grid-cols-3">
              <div className="justify-self-start">
                <HeaderLogo isMenuOpen={isMenuOpen} />
              </div>
              <div className="justify-self-end lg:justify-self-center">
                <MenuButton isOpen={isMenuOpen} onClick={toggleMenu} />
              </div>
              {headerCta?.text ? (
                <div className="hidden justify-self-end lg:block">
                  <AnimatedButton
                    size="sm"
                    theme="brand"
                    onClick={() => openModal("cal-booking")}
                  >
                    {headerCta.text}
                  </AnimatedButton>
                </div>
              ) : (
                <div className="hidden lg:block" />
              )}
            </div>
          </div>
        </div>
        <NavigationFlyout 
          navItems={navItems}
          flyout={flyout}
          onClose={closeMenu}
          isOpen={isMenuOpen}
          spotsRemaining={spotsRemaining}
        />
      </header>
    </>
  );
}
