"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePageTransitionContext } from '@providers/PageTransitionProvider'; 

export function PageTransitionRectangles() {
  const { phase } = usePageTransitionContext();
  const [isClient, setIsClient] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  if (!isClient || isReducedMotion) return null;

  const isNotIdle = phase !== "idle";

  const getRectStyle = (index) => {
    const delayMs = phase === "entering" 
      ? 650 + 60 * index 
      : phase === "exiting" 
        ? 60 * index 
        : 0;
        
    const transformVal = phase === "entering" || phase === "holding" 
      ? "translateY(0%)" 
      : phase === "exiting" 
        ? "translateY(-110%)" 
        : "translateY(110%)";
        
    const isTransitioning = phase === "entering" || phase === "exiting";

    return {
      width: 16,
      height: 16,
      backgroundColor: "#141314",
      transform: transformVal,
      transitionProperty: "transform",
      transitionDuration: isTransitioning ? "350ms" : "0ms",
      transitionTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
      transitionDelay: isTransitioning ? `${delayMs}ms` : "0ms",
      willChange: isTransitioning ? "transform" : undefined
    };
  };

  const visibility = isNotIdle ? "visible" : "hidden";

  const containerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    zIndex: 10001,
    pointerEvents: "none",
    visibility: visibility
  };

  const innerContainerStyle = {
    display: "flex",
    gap: 2,
    overflow: "hidden"
  };

  const rectKeys = ["r0", "r1", "r2", "r3"];

  return createPortal(
    <div style={containerStyle}>
      <div style={innerContainerStyle}>
        {rectKeys.map((key, index) => (
          <div key={key} style={getRectStyle(index)} />
        ))}
      </div>
    </div>,
    document.body
  );
}

