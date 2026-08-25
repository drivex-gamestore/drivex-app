"use client";

import React, { useState, useRef, useContext, useLayoutEffect, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { AnimatedProseContext, stagger } from '@features/animations/components/AnimatedProse'; 
import { SplitText } from '@lib/vendor';
import { cx } from '@lib/vendor';

export function AnimatedText({
  children,
  className,
  staggerDelay = 0.03,
  duration = 0.5,
  delay = 0,
  margin = "0px 0px -10% 0px",
  revert = false
}) {
  const [isInView, setIsInView] = useState(false);
  const [isSplit, setIsSplit] = useState(false);
  
  const containerRef = useRef(null);
  const splitTextRef = useRef(null);
  const inAnimatedProse = useContext(AnimatedProseContext);

  useLayoutEffect(() => {
    if (containerRef.current) {
      setIsSplit(false);
      splitTextRef.current = new SplitText(containerRef.current, {
        type: "lines",
        autoSplit: true,
        aria: false,
        deepSlice: true,
        reduceWhiteSpace: false,
        mask: "lines",
        linesClass: "split-line",
        onSplit: () => setIsSplit(true)
      });
    }
    
    return () => {
      splitTextRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (inAnimatedProse || !isInView || !isSplit || !containerRef.current || !splitTextRef.current) {
      return;
    }

    const lines = splitTextRef.current.lines ?? [];
    if (lines.length === 0) return;

    containerRef.current.style.visibility = "visible";

    // TODO: no exact match in easings.js -- kept as raw literal
    const animation = animate(
      lines,
      { y: ["100%", "0%"] },
      {
        delay: stagger(staggerDelay, { startDelay: delay }),
        duration: duration,
        ease: [0.33, 1, 0.68, 1]
      }
    );

    const handleRevert = async () => {
      try {
        await animation;
        if (revert) {
          splitTextRef.current?.revert();
        }
      } catch (err) {
        // Handle potential rejection if the animation is cancelled
      }
    };

    handleRevert();

    return () => {
      animation?.cancel();
    };
  }, [isInView, isSplit, inAnimatedProse, staggerDelay, duration, delay, revert]);

  const handleViewportEnter = () => setIsInView(true);

  return (
    <motion.span
      ref={containerRef}
      onViewportEnter={handleViewportEnter}
      viewport={{ once: true, margin: margin }}
      className={cx("invisible", className)}
    >
      {children}
    </motion.span>
  );
}

