"use client";

import { useEffect, useMemo, useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@lib/vendor";
import { usePageEnter } from "@shared/hooks/usePageEnter"; 
import { usePageEnterContext } from '@providers/PageEnterProvider';
import { AnimatedHeadline } from "@features/animations/components/AnimatedHeadline"; 
import { AnimatedSubtext } from "@animations/components/AnimatedSubtext"; 
import { ButtonGroup } from "@components/utilities/ButtonGroup"; 
import { Image } from "@lib/sanity/components/Image"; 
import { SanityMedia } from "@lib/sanity/components/SanityMedia"; 
import { getImageSrc, getImageSrcSet } from "@lib/sanity/utils/sanity-imageutils"; 
import { DriveXWatermark } from "@components/utilities/DriveXWatermark"; 
import { cx } from '@lib/vendor';
import { HIGH_RES_SOURCE_WIDTHS } from "@shared/constants/constants"; 

function ScrollText({ text, className }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const update = () => {
      if (!container || !textEl) return;
      textEl.style.fontSize = "100px";
      textEl.style.width = "max-content";
      const containerWidth = container.offsetWidth;
      const textWidth = textEl.offsetWidth;
      textEl.style.width = "";
      if (textWidth > 0) {
        textEl.style.fontSize = `${(100 * containerWidth) / textWidth}px`;
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const chars = text.split("").map((char, index) => (
    <span
      key={index}
      data-scroll-char={true}
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div
        ref={textRef}
        className="whitespace-nowrap font-bold tracking-tighter"
        style={{ lineHeight: "0.75em" }}
      >
        {chars}
      </div>
    </div>
  );
}

function HeroParallax({
  media,
  mobileImage,
  headline,
  headlineLevel,
  headlineDisplay,
  subtext,
  ctas,
  scrollText,
  useWatermark,
  className,
}) {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);
  const contentRef = useRef(null);
  const subtextRef = useRef(null);
  const ctaRef = useRef(null);
  const bottomRef = useRef(null);
  const hasRevealedRef = useRef(false);
  const { prefersReducedMotion } = usePageEnterContext();
  const headlineRef = useRef(null);

  const isVideo = media.type === "video" || media.type === "externalVideo";
  const highResOptions = media.highResolution
    ? { sourceWidths: HIGH_RES_SOURCE_WIDTHS }
    : {};
  const desktopSrc =
    media.type === "image" && media.image
      ? getImageSrc(media.image, { width: 1920, ...highResOptions })
      : null;
  const desktopSrcSet =
    media.type === "image" && media.image
      ? getImageSrcSet(media.image, highResOptions)
      : undefined;
  const desktopAlt =
    media.type === "image" && media.image
      ? media.image.altText ?? media.image.description ?? media.image.title ?? ""
      : "";
  const mobileSrc = mobileImage
    ? getImageSrc(mobileImage, { width: 720, quality: 80 })
    : null;
  const mobileSrcSet = mobileImage
    ? getImageSrcSet(mobileImage, {
        quality: 80,
        sourceWidths: [320, 480, 600, 720, 828, 960, 1080, 1200, 1440],
      })
    : undefined;
  const mobileAlt = mobileImage
    ? mobileImage.altText ?? mobileImage.description ?? mobileImage.title ?? ""
    : "";

  const { contextSafe } = useGSAP(
    () => {
      if (sectionRef.current && mediaRef.current) {
        if (!prefersReducedMotion) {
          const targets = [ctaRef.current].filter(Boolean);
          gsap.set(targets, { opacity: 0, y: 20 });
        }

        if (!prefersReducedMotion) {
          gsap.set(mediaRef.current, { clearProps: "transform" });
          gsap.to(mediaRef.current, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        if (!prefersReducedMotion && contentRef.current) {
          gsap.set(contentRef.current, { clearProps: "transform" });
          gsap.to(contentRef.current, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        if (!prefersReducedMotion && bottomRef.current) {
          const isScrollText = !!scrollText;
          const targets = bottomRef.current.querySelectorAll(
            isScrollText ? "[data-scroll-char]" : "svg > g"
          );
          if (targets.length > 0) {
            gsap.set(targets, { clearProps: "all" });
            const isMobile = window.matchMedia("(max-width: 1023px)").matches;
            if (isScrollText) {
              gsap.set(targets, { yPercent: 110 });
            } else {
              gsap.set(targets, { y: 345 });
            }
            gsap.to(targets, {
              y: 0,
              yPercent: 0,
              ease: "power3.out",
              stagger: isMobile ? 0.01 : 0.025,
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "10% top",
                end: isMobile ? "30% top" : "80% top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }
        }
      }
    },
    {
      scope: sectionRef,
      dependencies: [prefersReducedMotion, scrollText, useWatermark],
    }
  );

  const onEnter = useMemo(
    () =>
      contextSafe((delay) => {
        if (hasRevealedRef.current) return;
        hasRevealedRef.current = true;
        const revealDelay = delay + 0.3;
        headlineRef.current?.reveal(revealDelay);
        subtextRef.current?.reveal(revealDelay + 0.15);
        const timeline = gsap.timeline({ delay: revealDelay + 0.2 });
        if (ctaRef.current) {
          timeline.to(
            ctaRef.current,
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power3.out",
            },
            0.1
          );
        }
      }),
    [contextSafe]
  );

  usePageEnter(onEnter, { priority: 1, skip: prefersReducedMotion });

  return (
    <div
      ref={sectionRef}
      className={cx("relative h-svh lg:h-[150vh]", className)}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {mobileSrc && (
          <div className="size-full lg:hidden">
            <Image
              src={mobileSrc}
              srcSet={mobileSrcSet}
              sizes="100vw lg:0px"
              loading="eager"
              alt={mobileAlt}
              className="size-full object-cover"
            />
          </div>
        )}
        <div
          ref={mediaRef}
          className={cx("size-full", mobileSrc && "hidden lg:block")}
          style={{ willChange: "transform" }}
        >
          {isVideo ? (
            <SanityMedia
              media={media}
              className="size-full"
              autoPlay={true}
              loop={true}
              imageProps={{ sizes: "100vw" }}
            />
          ) : desktopSrc ? (
            <Image
              src={desktopSrc}
              srcSet={desktopSrcSet}
              sizes="100vw"
              priority={true}
              alt={desktopAlt}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-background/10" />
        <div
          className="absolute inset-x-0 top-0 h-1/2"
          style={{
            background:
              "linear-gradient(to bottom, rgb(20 19 20 / 0.5), transparent)",
          }}
        />
      </div>

      <div
        ref={contentRef}
        className="grid-container relative min-h-svh pt-80 lg:h-screen"
      >
        <div className="grid-layout">
          <div className="grid-span-12 lg:grid-subgrid flex flex-col justify-center gap-16">
            {headline && (
              <AnimatedHeadline
                ref={headlineRef}
                as={headlineLevel ?? "h1"}
                displayAs={headlineDisplay ?? undefined}
                className="lg:grid-span-12 lg:grid-subgrid text-foreground"
                skip={prefersReducedMotion}
              >
                {headline}
              </AnimatedHeadline>
            )}
            {subtext && (
              <AnimatedSubtext
                ref={subtextRef}
                className="text-body lg:max-w-xl"
                skip={prefersReducedMotion}
              >
                {subtext}
              </AnimatedSubtext>
            )}
            {ctas && (
              <div ref={ctaRef}>
                <ButtonGroup buttonGroup={ctas} />
              </div>
            )}
          </div>
        </div>
      </div>

      {(scrollText || useWatermark) && (
        <div
          ref={bottomRef}
          className="absolute inset-x-0 bottom-0 overflow-hidden text-foreground/40"
        >
          {scrollText ? (
            <ScrollText text={scrollText} className="w-full" />
          ) : (
            <DriveXWatermark />
          )}
        </div>
      )}
    </div>
  );
}
export default HeroParallax;
