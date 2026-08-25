"use client";

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePageTransition } from '@shared/hooks/usePageTransition';

gsap.registerPlugin(ScrollTrigger);

const DIGITS_ARRAY = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];


export function RollerNumber({
  value,
  className = "",
  suffix,
  minDigits = 2,
  triggerMode = "scroll",
  triggerElement,
  delay = 0,
  duration = 1.5,
  stagger = 0.08
}) {
  const containerRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const { phase } = usePageTransition();
  const isPageIdle = phase === "idle";

  const digits = useMemo(() => {
    const arr = Math.round(value).toString().split("").map(Number);
    while (arr.length < minDigits) {
      arr.unshift(0);
    }
    return arr;
  }, [value, minDigits]);

  const animateRollers = useCallback(() => {
    if (hasTriggeredRef.current || !containerRef.current) return;
    
    hasTriggeredRef.current = true;
    const innerRollers = containerRef.current.querySelectorAll("[data-roller-inner]");
    
    if (innerRollers && innerRollers.length !== 0) {
      innerRollers.forEach((roller, index) => {
        const digitValue = digits[index] ?? 0;
        gsap.fromTo(
          roller,
          { y: "-10em" },
          {
            y: `${-20 - digitValue}em`,
            duration: duration,
            delay: delay + (digits.length - 1 - index) * stagger,
            ease: "expo.inOut"
          }
        );
      });
    }
  }, [digits, duration, delay, stagger]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (triggerMode === "immediate") {
      animateRollers();
      return;
    }

    if (!isPageIdle) return;

    hasTriggeredRef.current = false;
    const triggerNode = triggerElement?.current ?? containerRef.current;

    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: triggerNode,
      start: "top bottom",
      once: true,
      invalidateOnRefresh: true,
      onEnter: animateRollers
    });

    return () => {
      scrollTriggerInstance.kill();
    };
  }, [isPageIdle, animateRollers, triggerElement, triggerMode]);

  const containerClasses = `flex items-start justify-start overflow-hidden leading-none ${className}`;
  const containerStyle = { height: "1em" };

  return (
    <div ref={containerRef} className={containerClasses} style={containerStyle}>
      {digits.map((digit, index) => (
        <div
          key={`${index}-${digits.length}`}
          className="relative flex flex-col items-center justify-start overflow-hidden"
          style={{ width: "1ch", height: "1em" }}
        >
          <div
            data-roller-inner={true}
            className="flex flex-col will-change-transform"
            style={{ transform: "translateY(-10em)" }}
          >
            {DIGITS_ARRAY.map(renderDigitBlockA)}
            {DIGITS_ARRAY.map(renderDigitBlockB)}
            {DIGITS_ARRAY.map(renderDigitBlockC)}
          </div>
        </div>
      ))}
      
      {suffix && (
        <span
          className="flex items-center leading-none"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {suffix}
        </span>
      )}
    </div>
  );
}

function renderDigitBlockA(digit) {
  return (
    <div
      key={`a-${digit}`}
      className="flex items-center justify-center leading-none"
      style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}
    >
      {digit}
    </div>
  );
}

function renderDigitBlockB(digit) {
  return (
    <div
      key={`b-${digit}`}
      className="flex items-center justify-center leading-none"
      style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}
    >
      {digit}
    </div>
  );
}

function renderDigitBlockC(digit) {
  return (
    <div
      key={`c-${digit}`}
      className="flex items-center justify-center leading-none"
      style={{ height: "1em", fontVariantNumeric: "tabular-nums" }}
    >
      {digit}
    </div>
  );
}

