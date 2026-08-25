"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { gsap, SplitText } from '@lib/vendor';
import { ScrambleGroup } from '@shared/contexts/ScrambleContext';
import { ScrambleText } from '@features/animations/components/ScrambleText';
import { SanityRichText } from '@lib/sanity/components/SanityRichText';
import { useBreakpoint } from '@shared/hooks/useIsTouchDevice';

function AccordionItem({
  headline,
  text,
  isOpen,
  onToggle,
  isDesktop,
  duration = 0.8,
  ease = "expo.inOut",
  enableStagger = false,
  staggerDuration = 0.6,
  staggerDelay = 0.15,
  staggerEase = "expo.out"
}) {
  const containerRef = useRef(null);
  const iconRef = useRef(null);
  const iconLineRef = useRef(null);
  const timelineRef = useRef(null);
  const splitTextRef = useRef(null);
  const linesAnimRef = useRef(null);
  const prevIsOpenRef = useRef(isOpen);
  const scrambleReadyRef = useRef(null);

  const initSplitText = useCallback(() => {
    if (!enableStagger || !containerRef.current) return;
    const elements = containerRef.current.querySelectorAll("p, span");
    
    if (elements.length) {
      elements.forEach(el => {
        if (el.querySelector(".split-line")) return;
        
        splitTextRef.current = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line"
        });
        
        const lines = splitTextRef.current.lines;
        gsap.set(lines, { yPercent: 110, force3D: true });
        
        linesAnimRef.current = gsap.to(lines, {
          yPercent: 0,
          duration: staggerDuration,
          stagger: staggerDelay,
          ease: staggerEase,
          force3D: true
        });
      });
    }
  }, [enableStagger, staggerDuration, staggerDelay, staggerEase]);

  const cleanupSplitText = useCallback(() => {
    if (linesAnimRef.current) {
      linesAnimRef.current.kill();
      linesAnimRef.current = null;
    }
    if (splitTextRef.current) {
      splitTextRef.current.revert();
      splitTextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && containerRef.current) {
      gsap.set(containerRef.current, { height: 0, overflow: "hidden", force3D: true });
      timelineRef.current = gsap.timeline({ paused: true, defaults: { duration, ease } });
      
      timelineRef.current.to(containerRef.current, { height: "auto", duration, ease }, 0);
      if (iconRef.current) {
        timelineRef.current.to(iconRef.current, { rotation: -180, duration, ease }, 0);
      }
      if (iconLineRef.current) {
        timelineRef.current.to(iconLineRef.current, { opacity: 0, duration: 0.5 * duration, ease: "power2.inOut" }, 0.25 * duration);
      }
    }
    return () => {
      timelineRef.current?.kill();
      linesAnimRef.current?.kill();
      splitTextRef.current?.revert();
    };
  }, [duration, ease]);

  useEffect(() => {
    if (!timelineRef.current || isOpen === prevIsOpenRef.current) return;
    
    prevIsOpenRef.current = isOpen;

    if (isOpen) {
      timelineRef.current.play();
      if (isDesktop && scrambleReadyRef.current) {
        scrambleReadyRef.current();
      }
      if (enableStagger && containerRef.current) {
        setTimeout(() => {
          document.fonts.ready.then(() => initSplitText());
        }, 200);
      }
    } else {
      timelineRef.current.reverse();
      cleanupSplitText();
    }
  }, [isOpen, enableStagger, initSplitText, cleanupSplitText, isDesktop]);

  const buttonClasses = `group flex w-full cursor-pointer items-start justify-between gap-16 py-24 text-left transition-colors lg:items-center ${
    isOpen ? "text-foreground" : "text-foreground-muted hover:text-foreground"
  }`;

  return (
    <div className="border-border border-b">
      <button type="button" onClick={onToggle} className={buttonClasses} aria-expanded={isOpen}>
        <span className="text-accent uppercase">
          {isDesktop ? (
            <ScrambleText
              revealMode={true}
              multiLine={true}
              secondColorClass="scramble-inherit"
              onReady={e => { scrambleReadyRef.current = e; }}
            >
              {headline}
            </ScrambleText>
          ) : (
            headline
          )}
        </span>
        
        <svg ref={iconRef} className="h-16 w-16 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path ref={iconLineRef} d="M8 1V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M1 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
        </svg>
      </button>
      
      <div ref={containerRef}>
        <div className="pb-24 text-body text-foreground-muted lg:max-w-2/3">
          <SanityRichText value={text} />
        </div>
      </div>
    </div>
  );
}


export default function AccordionClient({
  items,
  allowMultiple = false,
  duration = 0.8,
  ease = "expo.inOut",
  enableStagger = true
}) {
  const isDesktop = useBreakpoint("lg");
  const [openItems, setOpenItems] = useState(new Set());

  const handleToggle = useCallback((key) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(key);
      }
      return next;
    });
  }, [allowMultiple]);

  return (
    <ScrambleGroup stagger={0.08} start="top 85%">
      <div className="w-full">
        {items.map((item) => (
          <AccordionItem
            key={item._key}
            headline={item.headline}
            text={item.text}
            isOpen={openItems.has(item._key)}
            onToggle={() => handleToggle(item._key)}
            isDesktop={isDesktop}
            duration={duration}
            ease={ease}
            enableStagger={enableStagger}
          />
        ))}
      </div>
    </ScrambleGroup>
  );
}

