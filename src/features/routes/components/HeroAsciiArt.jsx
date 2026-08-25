"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Image } from "@lib/sanity/components/Image"; 
import {
  ASCII_GSAP_DURATION,
  ASCII_EASE,
  ASCII_COLOR_DELAY,
} from "@shared/constants/constants"; 
import { useIsTouchDevice } from "@shared/hooks/useIsTouchDevice"; 
import { useMousePosition } from "@shared/hooks/useMousePosition"; 
import { usePageEnter } from "@shared/hooks/usePageEnter"; 

gsap.registerPlugin(useGSAP, ScrollTrigger);

function FallbackImage({ imageSrc }) {
  return (
    <div className="absolute inset-0 flex animate-fade-in items-center justify-center">
      <Image
        src={imageSrc}
        priority={true}
        alt=""
        className="h-full object-contain"
      />
    </div>
  );
}

function HeroAsciiArt({
  imageSrc,
  mobileImageSrc,
  depthMapSrc,
  parallaxIntensity = 0.02,
  cellSize = 20,
  color,
  colorDark,
  revealOriginX,
  revealOriginY,
}) {
  const isTouch = useIsTouchDevice();
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [colorProgress, setColorProgress] = useState(0);
  const progressRef = useRef({ progress: 0, colorProgress: 0 });
  const [AsciiTypewriter, setAsciiTypewriter] = useState(null);

  const shouldRenderAscii = mounted && !prefersReducedMotion;

  useEffect(() => {
    if (shouldRenderAscii) {
      import("@features/ascii/components/AsciiTypewriter").then((mod) => {
        setAsciiTypewriter(() => mod.AsciiTypewriter);
      });
    }
  }, [shouldRenderAscii]);

  const { mouseX, mouseY, isHovering } = useMousePosition({
    enabled: shouldRenderAscii && !isTouch,
    containerRef,
  });

  const onEnter = useCallback(
    (delay) => {
      if (prefersReducedMotion) {
        setProgress(1);
        setColorProgress(1);
        return;
      }
      gsap.to(progressRef.current, {
        progress: 1,
        duration: ASCII_GSAP_DURATION,
        delay,
        ease: ASCII_EASE,
        onUpdate: () => setProgress(progressRef.current.progress),
      });
      gsap.to(progressRef.current, {
        colorProgress: 1,
        duration: ASCII_GSAP_DURATION,
        delay: delay + ASCII_COLOR_DELAY,
        ease: ASCII_EASE,
        onUpdate: () => setColorProgress(progressRef.current.colorProgress),
      });
    },
    [prefersReducedMotion]
  );

  usePageEnter(onEnter, { priority: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const finalSrc = isTouch ? mobileImageSrc ?? imageSrc : imageSrc;

  if (mounted && prefersReducedMotion) {
    return <FallbackImage imageSrc={finalSrc} />;
  }

  if (shouldRenderAscii && AsciiTypewriter) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        <AsciiTypewriter
          imageSrc={finalSrc}
          cellSize={cellSize}
          color={color}
          colorDark={colorDark}
          className="size-full"
          alignX="center"
          alignY="bottom"
          fit="contain"
          mobileFit="contain"
          revealEnd={1}
          randomness={0.6}
          mouseX={isTouch ? undefined : mouseX}
          mouseY={isTouch ? undefined : mouseY}
          enableGooeyReveal={!isTouch}
          isHovering={!isTouch && isHovering}
          gooeyRadius={0.035}
          gooeySoftness={0.04}
          gooeyNoiseIntensity={0.02}
          enableDepthParallax={!isTouch && !!depthMapSrc}
          depthMapSrc={isTouch ? undefined : depthMapSrc}
          parallaxIntensity={parallaxIntensity}
          externalProgress={progress}
          externalColorProgress={colorProgress}
          disableInternalAnimation={true}
          {...(revealOriginX != null &&
            revealOriginY != null && {
              revealOrigin: { x: revealOriginX, y: revealOriginY },
            })}
        />
      </div>
    );
  }

  return null;
}

export { HeroAsciiArt };
