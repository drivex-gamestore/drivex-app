"use client";

import React, { 
  createContext, 
  useState, 
  useTransition, 
  useRef, 
  useCallback, 
  useEffect, 
  useMemo, 
  useContext 
} from 'react';

import { scrollToTop } from '@providers/LenisProvider';

const PageTransitionContext = createContext(null);
let scrollTriggerModulePromise = null;

function getScrollTriggerModule() {
  if (!scrollTriggerModulePromise) {
    
    scrollTriggerModulePromise = import('gsap/ScrollTrigger'); 
  }
  return scrollTriggerModulePromise;
}

function clearScrollMemory() {
  const modulePromise = getScrollTriggerModule();
  if (modulePromise) {
    modulePromise.then(({ ScrollTrigger }) => {
      ScrollTrigger.clearScrollMemory();
    });
  }
}

function refreshScrollTrigger() {
  const modulePromise = getScrollTriggerModule();
  if (modulePromise) {
    modulePromise.then(({ ScrollTrigger }) => {
      ScrollTrigger.refresh(true);
    });
  }
}


function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageTransitionProvider({ children }) {
  const [phase, setPhase] = useState("idle");
  const [isPending, startTransitionReact] = useTransition();
  const timerRef = useRef(null);
  const pendingCallbackRef = useRef(null);
  const startTimeRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePopState = useCallback(() => {
    clearTimer();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startTimeRef.current = 0;
      pendingCallbackRef.current = null;
      setPhase("holding");
      clearScrollMemory();
      
      timerRef.current = window.setTimeout(() => {
        setPhase("exiting");
        timerRef.current = window.setTimeout(() => {
          setPhase("idle");
          refreshScrollTrigger();
        }, 1200);
      }, 100);
    }
  }, [clearTimer]);

  const startTransition = useCallback((callback) => {
    clearTimer();
    pendingCallbackRef.current = callback;
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      callback();
    } else {
      setPhase("entering");
      timerRef.current = window.setTimeout(() => {
        startTimeRef.current = Date.now();
        setPhase("holding");
        clearScrollMemory();
        scrollToTop();
        
        startTransitionReact(() => {
          pendingCallbackRef.current?.();
        });
      }, 1300);
    }
  }, [clearTimer, startTransitionReact]);

  
  useEffect(() => {
    if (phase === "holding" && !isPending && startTimeRef.current > 0) {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingDelay = Math.max(0, 100 - elapsed);
      
      timerRef.current = window.setTimeout(() => {
        setPhase("exiting");
        startTimeRef.current = 0;
        
        timerRef.current = window.setTimeout(() => {
          setPhase("idle");
          refreshScrollTrigger();
        }, 1200);
      }, remainingDelay);
    }
  }, [phase, isPending]);

  
  useEffect(() => {
    const onPopState = () => {
      handlePopState();
    };
    
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [handlePopState]);

  
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const contextValue = useMemo(() => ({
    phase,
    startTransition,
    isPending
  }), [phase, startTransition, isPending]);

  return (
    <PageTransitionContext.Provider value={contextValue}>
      {children}
    </PageTransitionContext.Provider>
  );
}

const defaultContextValue = {
  phase: "idle",
  startTransition: (t) => t(),
  isPending: false
};

export function usePageTransitionContext() {
  return useContext(PageTransitionContext) ?? defaultContextValue;
}
