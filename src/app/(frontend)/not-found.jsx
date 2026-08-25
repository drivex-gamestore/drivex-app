"use client"

import { useState, useRef, useEffect } from 'react';
import { useGSAP, gsap } from '@lib/vendor';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AnimatedHeadline } from '@features/animations/components/AnimatedHeadline';
import { AnimatedButton } from '@features/animations/components/AnimatedButton';
import { useAsciiDelay } from '@shared/hooks/useAsciiDelay'; 
import { useIsTouchDevice } from '@shared/hooks/useIsTouchDevice';
import { useMousePosition } from '@shared/hooks/useMousePosition';
import { usePageEnter } from '@shared/hooks/usePageEnter';
import { useHideFooter } from '@providers/FooterProvider';
import { ASCII_GSAP_DURATION, ASCII_EASE, ASCII_COLOR_DELAY } from '@shared/constants/constants';

const AsciiTypewriter = dynamic(
  () => import('@features/ascii/components/AsciiTypewriter').then((mod) => mod.AsciiTypewriter),
  { ssr: false }
);

export default function NotFoundPage(props = {}) {
  const {
    headline = "Seems like you're lost.",
    description = "Looks like this page was moved or the link is broken.",
    imageSrc = "/images/mlbb_xBorg_Skin.heif",
    mobileImageSrc,
    depthMapSrc = "/images/yuzhong_mlbb.heif",
    color = "#ff6b4a",
    colorDark = "#1a0a2e",
    cellSize = 10,
    parallaxIntensity = 0.12,
    revealOriginX,
    revealOriginY
  } = props;

  const isTouchDevice = useIsTouchDevice();
  const [isMounted, setIsMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);

  const asciiDelay = useAsciiDelay();
  const [progress, setProgress] = useState(0);
  const [colorProgress, setColorProgress] = useState(0);

  const gsapState = useRef({ progress: 0, colorProgress: 0 });

  const isReady = isMounted && !prefersReducedMotion;
  const mouseEnabled = isReady && !isTouchDevice;

  const { mouseX, mouseY, isHovering } = useMousePosition({
    enabled: mouseEnabled,
    containerRef
  });

  const onReveal = (delay) => {
    if (prefersReducedMotion) {
      setProgress(1);
      setColorProgress(1);
      headlineRef.current?.reveal();
      
      if (descriptionRef.current) {
        gsap.set(descriptionRef.current.querySelector('[data-line-inner]'), { yPercent: 0 });
      }
      if (buttonRef.current) {
        gsap.set(buttonRef.current, { opacity: 1 });
      }
      return;
    }

    gsap.to(gsapState.current, {
      progress: 1,
      duration: ASCII_GSAP_DURATION,
      delay: delay,
      ease: ASCII_EASE,
      onUpdate: () => setProgress(gsapState.current.progress)
    });

    gsap.to(gsapState.current, {
      colorProgress: 1,
      duration: ASCII_GSAP_DURATION,
      delay: delay + ASCII_COLOR_DELAY,
      ease: ASCII_EASE,
      onUpdate: () => setColorProgress(gsapState.current.colorProgress)
    });

    const totalDelay = delay + asciiDelay;
    headlineRef.current?.reveal(totalDelay);

    if (descriptionRef.current) {
      const lineInner = descriptionRef.current.querySelector('[data-line-inner]');
      if (lineInner) {
        gsap.to(lineInner, {
          yPercent: 0,
          duration: 0.8,
          ease: 'expo.out',
          delay: totalDelay + 0.15
        });
      }
    }

    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: totalDelay + 0.3
      });
    }
  };

  usePageEnter(onReveal, { priority: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = (e) => setPrefersReducedMotion(e.matches);
    
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion || !descriptionRef.current) return;
    const lineInner = descriptionRef.current.querySelector('[data-line-inner]');
    if (lineInner) {
      gsap.set(lineInner, { yPercent: 110 });
    }
  }, { dependencies: [prefersReducedMotion] });

  useHideFooter();

  const asciiComponent = isReady ? (
    <AsciiTypewriter
      imageSrc={isTouchDevice ? mobileImageSrc ?? imageSrc : imageSrc}
      alignX="center"
      alignY="bottom"
      fit="contain"
      mobileFit="cover"
      mouseX={isTouchDevice ? undefined : mouseX}
      mouseY={isTouchDevice ? undefined : mouseY}
      enableGooeyReveal={!isTouchDevice}
      isHovering={!isTouchDevice && isHovering}
      gooeyRadius={0.035}
      gooeySoftness={0.04}
      gooeyNoiseIntensity={0.02}
      color={color}
      colorDark={colorDark}
      cellSize={cellSize}
      depthMapSrc={isTouchDevice ? undefined : depthMapSrc}
      enableDepthParallax={!isTouchDevice && !!depthMapSrc}
      parallaxIntensity={parallaxIntensity}
      externalProgress={progress}
      externalColorProgress={colorProgress}
      disableInternalAnimation={true}
      {...(revealOriginX != null && revealOriginY != null && {
        revealOrigin: { x: revealOriginX, y: revealOriginY }
      })}
    />
  ) : (
    isMounted && (mobileImageSrc || imageSrc) && (
      <div className="absolute inset-0 flex animate-fade-in items-end justify-end">
        <img src={mobileImageSrc || imageSrc} alt="" className="h-full" />
      </div>
    )
  );

  return (
    <div data-theme="dark" className="relative flex h-svh flex-col bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[115%] w-full">
          <div ref={containerRef} className="relative size-full">
            {asciiComponent}
          </div>
        </div>
      </div>
      
      <div className="pointer-events-none relative z-10 mb-[10vh] flex flex-1 flex-col items-center justify-center px-16">
        <div className="flex flex-col items-center gap-36 text-center">
          <div className="flex flex-col items-center gap-4">
            <AnimatedHeadline
              ref={headlineRef}
              as="h1"
              className="text-foreground text-h3"
              skip={prefersReducedMotion}
            >
              {headline}
            </AnimatedHeadline>
            <p
              ref={descriptionRef}
              className="-mb-[0.1em] overflow-hidden pb-[0.1em] text-body text-foreground-muted"
            >
              <span data-line-inner className="block">
                {description}
              </span>
            </p>
          </div>
          
          <div ref={buttonRef} className="pointer-events-auto opacity-0">
            <AnimatedButton asChild>
              <Link href="/">Back to homepage</Link>
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
