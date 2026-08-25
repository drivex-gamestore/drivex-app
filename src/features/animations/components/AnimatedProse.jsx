"use client";

import React, { createContext, useState, useRef, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { easingDefinitionToFunction } from '@shared/utils/easings';
import { cx } from '@lib/vendor';

export function stagger(amount = 0.1, { startDelay = 0, from = 0, ease } = {}) {
  return (index, totalElements) => {
    let fromVal = typeof from === "number" ? from : (function(fromStr, total) {
      if (fromStr === "first") return 0;
      let lastIndex = total - 1;
      return fromStr === "last" ? lastIndex : lastIndex / 2;
    })(from, totalElements);

    let distance = amount * Math.abs(fromVal - index);

    if (ease) {
      let maxStagger = totalElements * amount;
      distance = easingDefinitionToFunction(ease)(distance / maxStagger) * maxStagger;
    }
    
    return startDelay + distance;
  };
}

export const AnimatedProseContext = createContext(false);

export function AnimatedProse({
  children,
  className,
  staggerDelay = 0.03,
  duration = 0.5,
  delay = 0,
  margin = "0px 0px -10% 0px"
}) {
  const [isInView, setIsInView] = useState(false);
  const [hasSplitLines, setHasSplitLines] = useState(false);
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const checkSplitLines = () => {
      const lines = containerRef.current?.querySelectorAll(".split-line");
      if (lines && lines.length > 0) {
        setHasSplitLines(true);
        return true;
      }
      return false;
    };

    if (checkSplitLines()) return;

    const intervalId = setInterval(() => {
      if (checkSplitLines()) {
        clearInterval(intervalId);
      }
    }, 50);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setHasSplitLines(true);
    }, 500);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!isInView || !hasSplitLines || !containerRef.current || hasAnimatedRef.current) return;

    const lines = containerRef.current.querySelectorAll(".split-line");
    if (lines.length === 0) return;

    hasAnimatedRef.current = true;
    containerRef.current.querySelectorAll(".invisible").forEach(makeVisible);

    // TODO: no exact match in easings.js — kept as raw literal
    const animation = animate(
      Array.from(lines),
      { y: ["100%", "0%"] },
      {
        delay: stagger(staggerDelay, { startDelay: delay }),
        duration: duration,
        ease: [0.33, 1, 0.68, 1]
      }
    );

    return () => {
      animation?.cancel();
    };
  }, [isInView, hasSplitLines, staggerDelay, duration, delay]);

  const handleViewportEnter = () => setIsInView(true);

  return (
    <AnimatedProseContext.Provider value={true}>
      <motion.div
        ref={containerRef}
        onViewportEnter={handleViewportEnter}
        viewport={{ once: true, margin: margin }}
        className={cx(className)}
      >
        {children}
      </motion.div>
    </AnimatedProseContext.Provider>
  );
}

function makeVisible(el) {
  el.style.visibility = "visible";
}

