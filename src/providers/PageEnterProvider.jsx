"use client";

import React, { 
  createContext, 
  useState, 
  useRef, 
  useEffect, 
  useCallback, 
  useMemo, 
  useContext 
} from 'react';

import { usePageTransition } from '@shared/hooks/usePageTransition';
import { usePreloader } from '@providers/PreloaderProvider';

const PageEnterContext = createContext(null);

function sortByPriority(a, b) {
  return a.priority - b.priority;
}

export function PageEnterProvider({ children }) {
  const { phase: pageTransitionPhase } = usePageTransition();
  const { phase: preloaderPhase } = usePreloader();
  
  const [phase, setPhase] = useState("waiting");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const callbacksMapRef = useRef(new Map());
  const isTriggeringRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleMediaQueryChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  const register = useCallback((id, trigger, priority = 0) => {
    callbacksMapRef.current.set(id, { id, trigger, priority });
  }, []);

  const unregister = useCallback((id) => {
    callbacksMapRef.current.delete(id);
  }, []);

  const triggerEnter = useCallback(() => {
    if (isTriggeringRef.current) {
      return;
    }
    
    isTriggeringRef.current = true;
    setPhase("entering");
    
    const callbacks = Array.from(callbacksMapRef.current.values());
    callbacks.sort(sortByPriority);
    
    let lastPriority = null;
    let staggerIndex = 0;

    for (const item of callbacks) {
      if (lastPriority !== null && item.priority >
      lastPriority) {
        staggerIndex += 0.08;
      }
      lastPriority = item.priority;
      item.trigger(staggerIndex);
    }
    
    setTimeout(() => {
      setPhase("complete");
    }, 1000 * (staggerIndex + 1));
  }, []);

  useEffect(() => {
    const isPreloaderReady = preloaderPhase === "revealing" || preloaderPhase === "hidden";
    
    if (
      (pageTransitionPhase === "exiting" || pageTransitionPhase === "idle") && 
      phase === "waiting" && 
      isPreloaderReady
    ) {
      const timerId = setTimeout(() => {
        triggerEnter();
      }, 250);
      
      return () => clearTimeout(timerId);
    }
  }, [pageTransitionPhase, preloaderPhase, phase, triggerEnter]);

  useEffect(() => {
    if (pageTransitionPhase === "entering" || pageTransitionPhase === "holding") {
      setPhase("waiting");
      isTriggeringRef.current = false;
    }
  }, [pageTransitionPhase]);

  const contextValue = useMemo(() => ({
    phase,
    register,
    unregister,
    prefersReducedMotion
  }), [phase, register, unregister, prefersReducedMotion]);

  return (
    <PageEnterContext.Provider value={contextValue}>
      {children}
    </PageEnterContext.Provider>
  );
}

const defaultContextValue = {
  phase: "complete",
  register: () => {},
  unregister: () => {},
  prefersReducedMotion: false
};

export function usePageEnterContext() {
  return useContext(PageEnterContext) ?? defaultContextValue;
}

