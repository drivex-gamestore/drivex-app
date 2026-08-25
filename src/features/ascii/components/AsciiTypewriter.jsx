"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cx } from "@lib/vendor";
import { ASCII_ANIMATION_DURATION } from "@shared/constants/constants";
import { AsciiCanvas } from "@features/ascii/components/AsciiCanvas";
import { computeContentBounds } from "@features/ascii/utils/computeContentBounds";

const ANIMATION_MS = 1000 * ASCII_ANIMATION_DURATION;


function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function AsciiTypewriter({
  imageSrc,
  className,
  color = "#ff6b4a",
  cellSize,
  delay = 100,
  duration = ANIMATION_MS,
  colorDelay = 150,
  onComplete,
  alignX = "center",
  alignY = "bottom",
  fit = "cover",
  mobileFit,
  enableHover = false,
  hoverMode = "stretch",
  hoverIntensity,
  mouseX = 0,
  mouseY = 0,
  mouseRef,
  revealEnd = 0.85,
  randomness = 0.3,
  linear = false,
  enableGooeyReveal = false,
  gooeyRadius = 0.06,
  gooeySoftness = 0.08,
  gooeyNoiseIntensity = 0.03,
  isHovering = false,
  enableDepthParallax = false,
  depthMapSrc,
  parallaxIntensity = 0.02,
  externalProgress,
  externalColorProgress,
  disableInternalAnimation = false,
  colorDark,
  depthDetailMin,
  revealOrigin = { x: 0.5, y: 0.5 },
  frameloop,
  debugLabel,
  dpr,
  skipContentBounds = false,
}) {
  const effectRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [colorProgress, setColorProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [contentBoundsScale, setContentBoundsScale] = useState(1);
  const [clickColorProgress, setClickColorProgress] = useState(null);
  const [clickPoint, setClickPoint] = useState(null);
  const [clickRadialInvert, setClickRadialInvert] = useState(false);
  const [impactProgress, setImpactProgress] = useState(0);

  const hasCompletedRef = useRef(false);
  const clickAnimFrameRef = useRef(null);
  const impactAnimFrameRef = useRef(null);
  const animationFinishedRef = useRef(false);
  const clickStartTimeRef = useRef(0);
  const revealOriginRef = useRef(revealOrigin);
  revealOriginRef.current = revealOrigin;

  const containerRef = useRef(null);
  const isInViewRef = useRef(false);

  useEffect(() => {
    if (skipContentBounds) return;
    computeContentBounds(imageSrc, revealOrigin).then((scale) => {
      setContentBoundsScale(scale);
    });
  }, [imageSrc, revealOrigin.x, revealOrigin.y, revealOrigin, skipContentBounds]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const useExternal = disableInternalAnimation && externalProgress !== undefined;

  useEffect(() => {
    if (disableInternalAnimation) {
      animationFinishedRef.current = true;
      return;
    }
    if (prefersReducedMotion) {
      setProgress(1);
      setColorProgress(1);
      animationFinishedRef.current = true;
      onComplete?.();
      return;
    }

    const start = performance.now();
    let rafId;

    const tick = (now) => {
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const t = Math.min(elapsed / duration, 1);
      setProgress(linear ? t : easeOutCubic(t));

      const colorElapsed = elapsed - colorDelay;
      if (colorElapsed > 0) {
        const ct = Math.min(colorElapsed / duration, 1);
        setColorProgress(linear ? ct : easeOutCubic(ct));
      }

      const colorDone = colorElapsed >= duration;
      if (t < 1 || !colorDone) {
        rafId = requestAnimationFrame(tick);
      } else {
        animationFinishedRef.current = true;
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [delay, duration, colorDelay, linear, prefersReducedMotion, onComplete, disableInternalAnimation]);

  // Click-triggered radial color animation
  const triggerClickReveal = useRef(() => {});
  triggerClickReveal.current = (point, delayMs = 0) => {
    if (!animationFinishedRef.current || clickAnimFrameRef.current !== null)
      return;

    const invert = !hasCompletedRef.current;
    hasCompletedRef.current = invert;
    const startTime = performance.now();
    clickStartTimeRef.current = startTime;

    setClickPoint(point);
    if (point) setClickRadialInvert(invert);

    if (prefersReducedMotion) {
      setClickColorProgress(+!invert);
      setClickPoint(null);
      setClickRadialInvert(false);
      return;
    }

    const run = () => {
      const from = +!!invert;
      const to = +!invert;
      const start = performance.now();

      const step = (now) => {
        const t = Math.min((now - start) / ANIMATION_MS, 1);
        setClickColorProgress(from + (to - from) * easeOutCubic(t));
        if (t < 1) {
          clickAnimFrameRef.current = requestAnimationFrame(step);
        } else {
          clickAnimFrameRef.current = null;
          if (clickStartTimeRef.current === startTime) {
            setClickPoint(null);
            setClickRadialInvert(false);
          }
        }
      };
      clickAnimFrameRef.current = requestAnimationFrame(step);
    };

    if (delayMs > 0) {
      setTimeout(run, delayMs);
    } else {
      run();
    }
  };

  // Impact flash animation
  const triggerImpact = useRef(() => {});
  triggerImpact.current = () => {
    if (prefersReducedMotion) return;
    if (impactAnimFrameRef.current !== null) {
      cancelAnimationFrame(impactAnimFrameRef.current);
    }
    setImpactProgress(0);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 500, 1);
      setImpactProgress(Math.sin((t * Math.PI) / 2));
      if (t < 1) {
        impactAnimFrameRef.current = requestAnimationFrame(step);
      } else {
        impactAnimFrameRef.current = null;
      }
    };
    impactAnimFrameRef.current = requestAnimationFrame(step);
  };

  // Keyboard shortcut "C" to re-trigger from current origin
  useEffect(() => {
    const onKey = (e) => {
      if (
        (e.key !== "c" && e.key !== "C") ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      const tag = e.target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable
      )
        return;
      if (isInViewRef.current) {
        clickStartTimeRef.current = performance.now();
        setClickPoint(revealOriginRef.current);
        triggerImpact.current();
        triggerClickReveal.current(revealOriginRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      if (clickAnimFrameRef.current !== null) {
        cancelAnimationFrame(clickAnimFrameRef.current);
        clickAnimFrameRef.current = null;
      }
      if (impactAnimFrameRef.current !== null) {
        cancelAnimationFrame(impactAnimFrameRef.current);
        impactAnimFrameRef.current = null;
      }
    },
    []
  );

  // Track in-view for keyboard shortcut
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) isInViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback((e) => {
    if (!animationFinishedRef.current || clickAnimFrameRef.current !== null)
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    clickStartTimeRef.current = performance.now();
    setClickPoint({ x, y });
    triggerImpact.current();
    triggerClickReveal.current({ x, y });
  }, []);

  const effectiveColorProgress =
    clickColorProgress !== null
      ? clickColorProgress
      : prefersReducedMotion
        ? 1
        : useExternal
          ? (externalColorProgress ?? externalProgress)
          : colorProgress;

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="size-full cursor-pointer"
    >
      <AsciiCanvas
        imageSrc={imageSrc}
        className={cx("size-full", className)}
        color={color}
        {...(cellSize !== undefined && { cellSize })}
        progress={
          (prefersReducedMotion
            ? 1
            : useExternal
              ? externalProgress
              : progress) * contentBoundsScale
        }
        colorProgress={effectiveColorProgress * contentBoundsScale}
        randomness={randomness}
        revealDirection={alignX === "right" ? -1 : 1}
        revealEnd={revealEnd}
        effectRef={effectRef}
        alignX={alignX}
        alignY={alignY}
        fit={fit}
        mobileFit={mobileFit}
        enableHover={enableHover}
        hoverMode={hoverMode}
        hoverIntensity={hoverIntensity}
        mouseX={mouseX}
        mouseY={mouseY}
        mouseRef={mouseRef}
        enableGooeyReveal={enableGooeyReveal}
        gooeyRadius={gooeyRadius}
        gooeySoftness={gooeySoftness}
        gooeyNoiseIntensity={gooeyNoiseIntensity}
        isHovering={isHovering}
        enableDepthParallax={enableDepthParallax}
        depthMapSrc={depthMapSrc}
        parallaxIntensity={parallaxIntensity}
        clickPoint={clickPoint}
        clickRadialInvert={clickRadialInvert}
        impactProgress={impactProgress}
        revealOrigin={revealOrigin}
        {...(colorDark !== undefined && { colorDark })}
        {...(depthDetailMin !== undefined && { depthDetailMin })}
        {...(frameloop !== undefined && { frameloop })}
        {...(debugLabel !== undefined && { debugLabel })}
        {...(dpr !== undefined && { dpr })}
      />
    </div>
  );
}

export default AsciiTypewriter;
