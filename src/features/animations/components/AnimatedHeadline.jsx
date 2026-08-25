"use client";

import React, { forwardRef, useRef, useState, useLayoutEffect, useCallback, useImperativeHandle, Fragment } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@lib/vendor';
import useIdleGSAP from '@shared/hooks/useIdleGSAP';
import { cx } from '@lib/vendor';


const typographyClasses = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  h5: "text-h5",
  h6: "text-h6"
};

const AnimatedHeadline = forwardRef(({
  children,
  as: Component = "h1",
  displayAs,
  className,
  skip,
  trigger = "manual",
  wrapperClassName
}, ref) => {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const hasRevealedRef = useRef(false);
  const [lines, setLines] = useState(null);
  
  const shouldSkip = skip ?? window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const wordNodes = containerRef.current.querySelectorAll("[data-word]");
    if (wordNodes.length === 0) return;

    const computedLines = [];
    let currentLine = [];
    let lastY = -Infinity;
    let lastExplicitLine = -1;

    for (const node of wordNodes) {
      const top = node.getBoundingClientRect().top;
      const explicitLine = Number(node.dataset.explicitLine ?? -1);
      const isNewExplicit = explicitLine !== lastExplicitLine && lastExplicitLine !== -1;

      if ((lastY > -Infinity && top - lastY > 2) || isNewExplicit) {
        computedLines.push(currentLine.join(" "));
        currentLine = [];
      }
      currentLine.push(node.textContent || "");
      lastY = top;
      lastExplicitLine = explicitLine;
    }

    if (currentLine.length > 0) {
      computedLines.push(currentLine.join(" "));
    }
    setLines(computedLines);
  }, []);

  useGSAP(() => {
    if (shouldSkip || !containerRef.current || !lines) return;
    const container = containerRef.current;
    
    gsap.set(container.querySelectorAll("[data-line-inner]"), { opacity: 0 });
    gsap.set(container.querySelectorAll("[data-brand-rect], [data-fg-rect]"), { scaleX: 0, transformOrigin: "left" });
  }, { dependencies: [shouldSkip, lines] });

  useIdleGSAP(() => {
    if (trigger !== "scroll" || shouldSkip || !lines) return;
    const triggerEl = wrapperRef.current || containerRef.current;
    
    if (triggerEl) {
      ScrollTrigger.create({
        trigger: triggerEl,
        start: "top bottom",
        once: true,
        onEnter: () => reveal()
      });
    }
  }, { dependencies: [trigger, shouldSkip, lines] });

  const reveal = useCallback((delayOffset = 0) => {
    if (hasRevealedRef.current || shouldSkip || !containerRef.current) return;
    hasRevealedRef.current = true;
    
    const lineNodes = containerRef.current.querySelectorAll("[data-line]");

    for (let r = 0; r < lineNodes.length; r++) {
      const lineNode = lineNodes[r];
      if (!lineNode) continue;

      const delay = delayOffset + 0.15 * r;
      const lineInner = lineNode.querySelector("[data-line-inner]");
      const brandRect = lineNode.querySelector("[data-brand-rect]");
      const fgRect = lineNode.querySelector("[data-fg-rect]");

      if (!lineInner || !brandRect || !fgRect) continue;

      const rects = [brandRect, fgRect];
      const tl = gsap.timeline({ delay });

      tl.to(brandRect, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, 0);
      tl.to(fgRect, { scaleX: 1, duration: 0.45, ease: "power3.inOut" }, 0.1);
      tl.set(lineInner, { opacity: 1 }, 0.5);
      tl.set(rects, { transformOrigin: "right" }, 0.5);
      tl.to(fgRect, { scaleX: 0, duration: 0.45, ease: "power3.inOut" }, 0.5);
      tl.to(brandRect, { scaleX: 0, duration: 0.45, ease: "power3.inOut" }, 0.6);
    }
  }, [shouldSkip]);

  const reset = useCallback(() => {
    hasRevealedRef.current = false;
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    gsap.set(container.querySelectorAll("[data-line-inner]"), { opacity: 0 });
    gsap.set(container.querySelectorAll("[data-brand-rect], [data-fg-rect]"), { scaleX: 0, transformOrigin: "left" });
  }, []);

  useImperativeHandle(ref, () => ({ reveal, reset }), [reveal, reset]);

  const resolvedClassName = cx(typographyClasses[displayAs ?? Component], className);

  if (!lines) {
    const manualLines = children.split("\n");
    const preRenderedContent = (
      <Component ref={containerRef} className={resolvedClassName}>
        {manualLines.map((lineStr, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {lineStr.split(/\s+/).filter(Boolean).map((word, wordIndex) => (
              <Fragment key={wordIndex}>
                {wordIndex > 0 && " "}
                <span data-word data-explicit-line={lineIndex}>
                  {word}
                </span>
              </Fragment>
            ))}
          </Fragment>
        ))}
      </Component>
    );

    return trigger === "scroll" ? (
      <div ref={wrapperRef} className={wrapperClassName}>
        {preRenderedContent}
      </div>
    ) : (
      preRenderedContent
    );
  }

  const animatedContent = (
    <Component ref={containerRef} className={resolvedClassName}>
      {lines.map((lineStr, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          <div data-line className="relative inline-block">
            <span data-line-inner className="block whitespace-nowrap">
              {lineStr}
            </span>
            {!shouldSkip && (
              <Fragment>
                <div data-brand-rect className="absolute -inset-x-[0.1em] -inset-y-[0.1em] bg-brand" />
                <div data-fg-rect className="absolute -inset-x-[0.1em] -inset-y-[0.1em] bg-foreground" />
              </Fragment>
            )}
          </div>
        </Fragment>
      ))}
    </Component>
  );

  return trigger === "scroll" ? (
    <div ref={wrapperRef} className={wrapperClassName}>
      {animatedContent}
    </div>
  ) : (
    animatedContent
  );
});

AnimatedHeadline.displayName = "AnimatedHeadline";

export { AnimatedHeadline };
