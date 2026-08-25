"use client";

import { useMemo } from 'react';
import { usePageTransitionContext } from '@providers/PageTransitionProvider';

export function usePageTransition() {
  const {
    startTransition,
    phase,
    isPending
  } = usePageTransitionContext();

  const isTransitioning = phase !== "idle";

  const transitionState = useMemo(() => ({
    startTransition,
    isTransitioning,
    phase,
    isPending
  }), [isPending, phase, startTransition, isTransitioning]);

  return transitionState;
}
