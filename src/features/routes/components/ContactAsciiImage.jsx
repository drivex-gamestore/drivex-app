"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useIsTouchDevice } from "@shared/hooks/useIsTouchDevice";
import { useMousePosition } from "@shared/hooks/useMousePosition";
import { usePageEnter } from "@shared/hooks/usePageEnter";
import {
  ASCII_GSAP_DURATION,
  ASCII_EASE,
  ASCII_COLOR_DELAY,
} from "@shared/constants/constants";

function ContactAsciiImage({
  imageSrc,
  mobileImageSrc,
  depthMapSrc,
  color,
  cellSize,
  colorDark,
  parallaxIntensity,
  revealOriginX,
  revealOriginY,
}) {
  const isTouch = useIsTouchDevice();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [colorProgress, setColorProgress] = useState(0);
  const progressRef = useRef({ progress: 0, colorProgress: 0 });
  const [AsciiTypewriter, setAsciiTypewriter] = useState(null);

  const { prefersReducedMotion } = usePageEnter(
    useCallback((delay) => {
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
    }, []),
    { priority: 0 }
  );

  const shouldRenderAscii = mounted && !prefersReducedMotion;

  useEffect(() => {
    if (shouldRenderAscii) {

      import(/* webpackChunkName: "ascii" */ "@features/ascii/components/AsciiTypewriter").then(
        (mod) => {
          setAsciiTypewriter(() => mod.AsciiTypewriter);
        }
      );
    }
  }, [shouldRenderAscii]);

  const { mouseX, mouseY, isHovering } = useMousePosition({
    enabled: shouldRenderAscii && !isTouch,
    containerRef,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div ref={containerRef} className="absolute bottom-0 left-0 h-full w-full">
      {shouldRenderAscii && AsciiTypewriter ? (
        <AsciiTypewriter
          imageSrc={isTouch ? mobileImageSrc ?? imageSrc : imageSrc}
          color={color}
          cellSize={cellSize}
          colorDark={colorDark}
          alignX="left"
          alignY="bottom"
          fit="cover"
          mouseX={isTouch ? undefined : mouseX}
          mouseY={isTouch ? undefined : mouseY}
          enableGooeyReveal={!isTouch}
          isHovering={!isTouch && isHovering}
          gooeyRadius={0.035}
          gooeySoftness={0.04}
          gooeyNoiseIntensity={0.02}
          depthMapSrc={isTouch ? undefined : depthMapSrc}
          enableDepthParallax={!isTouch && !!depthMapSrc}
          parallaxIntensity={parallaxIntensity ?? 0.15}
          externalProgress={progress}
          externalColorProgress={colorProgress}
          disableInternalAnimation={true}
          {...(revealOriginX != null &&
            revealOriginY != null && {
              revealOrigin: { x: revealOriginX, y: revealOriginY },
            })}
        />
      ) : (
        mounted && (
          <img
            src={mobileImageSrc || imageSrc}
            alt=""
            className="size-full animate-fade-in object-cover"
          />
        )
      )}
    </div>
  );
}

export { ContactAsciiImage };
