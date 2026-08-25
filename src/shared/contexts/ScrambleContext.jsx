import React, { createContext, useContext, useRef, useState, useCallback, useMemo } from 'react';
import { gsap, ScrollTrigger } from '@lib/vendor';
import { useIdleGSAP } from '@shared/hooks/useIdleGSAP';

const ScrambleContext = createContext(null);

export function ScrambleGroup({
  children,
  stagger = 0.1,
  start = "top 80%",
  markers = false,
  manual = false,
  className
}) {
  const childrenMapRef = useRef(new Map());
  
  const [hasTriggered, setHasTriggered] = useState(false);
  const isTriggering = useRef(false);
  const scrollTriggerRef = useRef(null);
  const containerRef = useRef(null);

  const register = useCallback((id, callback) => {
    childrenMapRef.current.set(id, callback);
  }, []);

  const unregister = useCallback((id) => {
    childrenMapRef.current.delete(id);
  }, []);

  const triggerAll = useCallback((customStagger) => {
    if (isTriggering.current) return;
    
    isTriggering.current = true;
    
    const callbacks = Array.from(childrenMapRef.current.values());
    const staggerValue = customStagger ?? stagger;

    callbacks.forEach((callbackFn, index) => {
      gsap.delayedCall(index * staggerValue, () => {
        callbackFn();
      });
    });

    setHasTriggered(true);
  }, [stagger]);

  const setupScrollTrigger = useCallback(() => {
    if (manual || !containerRef.current) return;
    isTriggering.current = false;
    const tween = gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: start,
        markers: markers,
        toggleActions: "play none none none"
      },
      onStart: () => {
        triggerAll();
      },
      duration: 0.001
    });

    scrollTriggerRef.current = tween.scrollTrigger ?? null;

    return () => {
      tween.kill();
      scrollTriggerRef.current?.kill();
    };
  }, [manual, start, markers, triggerAll]);

  useIdleGSAP(setupScrollTrigger, {
    dependencies: [manual, start, markers, triggerAll]
  });

  const contextValue = useMemo(() => ({
    register,
    unregister,
    triggerAll,
    hasTriggered
  }), [register, unregister, triggerAll, hasTriggered]);

  return (
    <ScrambleContext.Provider value={contextValue}>
      <div ref={containerRef} className={className}>
        {children}
      </div>
    </ScrambleContext.Provider>
  );
}

export function useScrambleGroup() {
  return useContext(ScrambleContext);
}
