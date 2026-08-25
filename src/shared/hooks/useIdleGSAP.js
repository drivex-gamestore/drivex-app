"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { usePageTransition } from '@shared/hooks/usePageTransition';

export function useIdleGSAP(callback, config) {
  const { phase } = usePageTransition();
  const [isIdle, setIsIdle] = useState(phase === "idle");

  useEffect(() => {
    if (phase === "idle") {
      setIsIdle(true);
    } else if (phase === "holding") {
      setIsIdle(false);
    }
  }, [phase]);

  const wrappedCallback = useCallback((context, contextSafe) => {
    if (isIdle) {
      return callback(context, contextSafe);
    }
  }, [callback, isIdle]);

  const gsapConfig = useMemo(() => {
    const configDependencies = config?.dependencies ?? [];
    const combinedDependencies = [...configDependencies, isIdle];

    return {
      ...config,
      dependencies: combinedDependencies
    };
  }, [config, isIdle]);

  return useGSAP(wrappedCallback, gsapConfig);
}

export default useIdleGSAP;
