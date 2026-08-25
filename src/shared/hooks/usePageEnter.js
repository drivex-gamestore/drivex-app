"use client";

import { useRef, useEffect, useMemo } from 'react';
import { usePageEnterContext } from '@providers/PageEnterProvider';


export function usePageEnter(callback, options = {}) {
  const { priority = 0, skip = false } = options;

  const {
    register,
    unregister,
    phase,
    prefersReducedMotion
  } = usePageEnterContext();

  
  
  const uuid = useMemo(() => crypto.randomUUID(), []);
  const idRef = useRef(uuid);

  useEffect(() => {
    if (skip) {
      return;
    }

    const currentId = idRef.current;
    
    register(currentId, callback, priority);
    
    return () => {
      unregister(currentId);
    };
  }, [register, unregister, callback, priority, skip]);

  const isEntering = phase === "entering";
  const isComplete = phase === "complete";

  const returnedState = useMemo(() => ({
    phase,
    prefersReducedMotion,
    isEntering,
    isComplete
  }), [phase, prefersReducedMotion, isEntering, isComplete]);

  return returnedState;
}

