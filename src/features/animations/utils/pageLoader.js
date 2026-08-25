"use client";

import React, { useRef, useState, useEffect } from 'react';
import { gsap, useGSAP, cx } from '@lib/vendor';
import { usePreloader } from '@providers/PreloaderProvider';
import ScrambleText from '@features/animations/components/ScrambleText';

export function Preloader() {
  const { phase, setPhase, isInitialLoad } = usePreloader();

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const squaresContainerRef = useRef(null);

  const squaresRefs = useRef([]);
  const onReadyRef = useRef(null);
  const timelineRef = useRef(null);

  const hasStartedRef = useRef(false);

  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleReady = (readyFn) => {
    onReadyRef.current = readyFn;
  };

  useGSAP(() => {
    if (!isInitialLoad || phase !== "loading" || hasStartedRef.current) return;

    if (isReducedMotion) {
      setPhase("complete");
      return;
    }

    const squares = squaresRefs.current.filter(Boolean);
    if (squares.length === 0) return;

    hasStartedRef.current = true;

    let timeoutId;

    const runAnimation = () => {
      if (!onReadyRef.current) {
        requestAnimationFrame(runAnimation);
        return;
      }

      timelineRef.current = gsap.timeline();
      onReadyRef.current();

      squares.forEach((square, index) => {
        timelineRef.current?.fromTo(
          square,
          {
            x: index === 0 ? -16 : (index - 1) * 18,
            rotate: 0
          },
          {
            x: index * 18 - 16,
            rotate: 90,
            duration: 0.7,
            ease: "expo.inOut",
            immediateRender: false
          },
          index === 0 ? 0 : ">-25%"
        );
      });

      const timeOffset = 2.2749999999999995;

      timelineRef.current?.to(
        contentRef.current,
        { opacity: 0, duration: 0.4, ease: "power3.out" },
        timeOffset + 0.2
      );

      const clipState = { value: 0 };
      const eventState = { value: false };

      timelineRef.current?.to(
        clipState,
        {
          value: 1,
          duration: 1.5,
          ease: "expo.inOut",
          onUpdate: () => {
            if (containerRef.current) {
              const val = clipState.value;
              containerRef.current.style.clipPath =
                val <= 0 ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" :
                val >= 1 ? "polygon(0% 100%, 0% 100%, 0% 100%)" :
                val <= 0.5 ? `polygon(0% 100%, ${2 * val * 100}% 0%, 100% 0%, 100% 100%)` :
                `polygon(0% 100%, 100% ${(val - 0.5) * 200}%, 100% 100%)`;
            }
            if (!eventState.value && clipState.value >= 0.9) {
              eventState.value = true;
              setPhase("revealing");
            }
          }
        },
        timeOffset
      );
    };

    timeoutId = setTimeout(runAnimation, 100);

    return () => {
      clearTimeout(timeoutId);
      timelineRef.current?.kill();
    };
    
  }, { dependencies: [isInitialLoad, isReducedMotion, setPhase] });

  if (!isInitialLoad || phase === "hidden") return null;

  const pointerEventsClass = phase === "complete" ? "pointer-events-none" : "";
  const containerClasses = cx("fixed inset-0 z-[10000] flex items-center justify-center bg-background", pointerEventsClass);

  return (
    <div ref={containerRef} data-theme="brand" className={containerClasses}>
      <div ref={contentRef} className="flex flex-col items-center gap-4">
        
        <div> 
        <div 
          ref={squaresContainerRef}
          className="relative overflow-x-clip overflow-y-visible"
          style={{ width: 70, height: 16 }}
        >
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              ref={(el) => { squaresRefs.current[index] = el; }}
              className="absolute top-0 left-0 bg-foreground"
              style={{
                width: 16,
                height: 16,
                transform: "translateX(-16px)",
                transformOrigin: "bottom right"
              }}
            />
          ))}
        </div>
        </div> 
        <div>
        <div className="overflow-hidden">
          <ScrambleText revealMode={true} duration={1} onReady={handleReady}>
            LOADING
          </ScrambleText>
        </div>
        </div>       
      </div>
    </div>
  );
}
