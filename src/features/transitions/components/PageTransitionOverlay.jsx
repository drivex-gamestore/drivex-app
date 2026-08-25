"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePageTransitionContext } from '@providers/PageTransitionProvider';

export function PageTransitionOverlay() {
  const { phase } = usePageTransitionContext();
  
  const [isClient, setIsClient] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  const scrollOffsetRef = useRef(0);
  const prevPhaseRef = useRef(phase);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsClient(true);
    setIsReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      delete document.body.dataset.transitionPhase;
      document.body.style.removeProperty("--page-scroll-offset");
    };
  }, []);

  useEffect(() => {
    if (!isClient || isReducedMotion) return;

    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === "entering" && prevPhase === "idle") {
      scrollOffsetRef.current = window.scrollY;
      document.body.style.setProperty("--page-scroll-offset", `${scrollOffsetRef.current}px`);
    }

    document.body.dataset.transitionPhase = phase;

    if (phase === "idle") {
      requestAnimationFrame(() => {
        if (isMountedRef.current && document.body.dataset.transitionPhase === "idle") {
          document.body.style.removeProperty("--page-scroll-offset");
          scrollOffsetRef.current = 0;
        }
      });
    }
  }, [phase, isClient, isReducedMotion]);

  if (!isClient || isReducedMotion) {
    return null;
  }

  const overlayStyle = {
    position: "fixed",
    width: "200vmax",
    height: "200vmax",
    bottom: 0,
    left: "calc(-50vw - var(--square-extend-left))",
    backgroundColor: "var(--color-brand)",
    zIndex: 9999,
    pointerEvents: "none"
  };

  return createPortal(
    <div
      data-phase={phase}
      className="page-transition-square"
      style={overlayStyle}
    />,
    document.body
  );
}

