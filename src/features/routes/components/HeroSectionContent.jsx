"use client";

import { useMemo, useRef } from "react";
import { useGSAP, gsap } from '@lib/vendor';
import { AnimatedHeadline } from "@animations/components/AnimatedHeadline"; 
import { AnimatedSubtext } from "@animations/components/AnimatedSubtext"; 
import { ButtonGroup } from "@components/utilities/ButtonGroup"; 
import { useAsciiDelay } from "@shared/hooks/useAsciiDelay"; 
import { usePageEnter } from "@shared/hooks/usePageEnter"; 
import { usePageEnterContext } from "@providers/PageEnterProvider"; 
import { SanityImage } from "@lib/sanity/components/SanityImage"; 
import { cx } from '@lib/vendor';
import { LOGO_HEIGHTS, getLogoSizeVars } from "@components/utilities/getLogoSizeVars"; 


export function HeroSectionContent({
  className,
  headline,
  headlineLevel,
  headlineDisplay,
  subtext,
  ctas,
  trustedBy,
  children
}) {
  const containerRef = useRef(null);
  const subtextRef = useRef(null);
  const ctasRef = useRef(null);
  const trustedByTitleRef = useRef(null);
  const logoRefs = useRef([]);
  const hasAnimatedRef = useRef(false);

  const { prefersReducedMotion } = usePageEnterContext();
  const headlineRef = useRef(null);
  const asciiDelay = useAsciiDelay();

  const { contextSafe } = useGSAP(() => {
    if (prefersReducedMotion) return;
    
    const elementsToHide = [
      ctasRef.current,
      trustedByTitleRef.current,
      ...logoRefs.current
    ].filter(Boolean);
    
    gsap.set(elementsToHide, { opacity: 0, y: 20 });
  }, {
    scope: containerRef,
    dependencies: [prefersReducedMotion]
  });

  const revealAnimation = useMemo(() => contextSafe((delayOffset) => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const totalDelay = delayOffset + asciiDelay;
    headlineRef.current?.reveal(totalDelay);
    subtextRef.current?.reveal(totalDelay + 0.15);

    const tl = gsap.timeline({ delay: totalDelay + 0.2 });

    if (ctasRef.current) {
      tl.to(ctasRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: 'power3.out' 
      }, 0.1);
    }

    if (trustedByTitleRef.current) {
      tl.to(trustedByTitleRef.current, { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: 'power3.out' 
      }, 0.2);
    }

    const validLogoRefs = logoRefs.current.filter(Boolean);
    if (validLogoRefs.length > 0) {
      tl.to(validLogoRefs, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
        onComplete: () => {
          for (const el of validLogoRefs) {
            if (el) {
              gsap.set(el, { clearProps: 'y,opacity' });
            }
          }
        }
      }, 0.3);
    }
  }), [contextSafe, asciiDelay]);

  usePageEnter(revealAnimation, { priority: 1, skip: prefersReducedMotion });

  return (
    <div ref={containerRef} className={cx(className)}>
      <div className="grid-span-12 lg:grid-span-8 flex flex-col justify-start gap-24 pt-24 lg:mt-auto lg:mb-auto lg:justify-center lg:gap-32 lg:pt-0">
        {headline && (
          <AnimatedHeadline
            ref={headlineRef}
            as={headlineLevel ?? 'h1'}
            displayAs={headlineDisplay ?? undefined}
            className="text-foreground"
            skip={prefersReducedMotion}
          >
            {headline}
          </AnimatedHeadline>
        )}
        {subtext && (
          <AnimatedSubtext
            ref={subtextRef}
            className="max-w-xl text-body-sm text-foreground lg:text-body lg:text-foreground-muted"
            skip={prefersReducedMotion}
          >
            {subtext}
          </AnimatedSubtext>
        )}
        <div ref={ctasRef} className="pointer-events-auto">
          {ctas && <ButtonGroup buttonGroup={ctas} />}
        </div>
      </div>

      {children}

      {trustedBy?.items && trustedBy.items.length > 0 && (
        <div className="grid-span-12 lg:grid-span-7 pointer-events-auto mt-32 flex flex-col items-center gap-16 text-center lg:mt-0 lg:flex-row lg:items-center lg:text-left">
          {trustedBy.title && (
            <div ref={trustedByTitleRef} className="max-w-auto shrink-0 lg:max-w-240">
              <p className="text-accent-sm text-foreground-muted">
                {trustedBy.title}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-8 lg:justify-start lg:gap-x-16">
            {trustedBy.items.map((item, index) => {
              if (item._type === 'image' && item.image) {
                const variant = item.variant ?? 'horizontal';
                const { desktop: desktopHeight } = LOGO_HEIGHTS[variant];
                
                return (
                  <span
                    key={item._key}
                    ref={(el) => { logoRefs.current[index] = el; }}
                    style={getLogoSizeVars(variant)}
                  >
                    <SanityImage
                      image={item.image}
                      alt={item.alt ?? 'Client logo'}
                      height={desktopHeight}
                      priority={true}
                      className="[&_img]:!h-(—logo-h) [&_img]:!w-auto [&_img]:!object-contain sm:[&_img]:!h-(—logo-h-desktop) h-auto w-auto grayscale transition-all hover:grayscale-0"
                    />
                  </span>
                );
              }
              
              if (item._type === 'svgItem' && item.svgCode) {
                const variant = item.variant ?? 'horizontal';
                return (
                  <span
                    key={item._key}
                    ref={(el) => { logoRefs.current[index] = el; }}
                    role="img"
                    aria-label={item.alt ?? 'Client logo'}
                    style={getLogoSizeVars(variant)}
                    className="block h-(—logo-h) text-foreground-muted transition-colors hover:text-foreground sm:h-(—logo-h-desktop) [&_svg]:h-full [&_svg]:w-auto"
                    dangerouslySetInnerHTML={{ __html: item.svgCode }}
                  />
                );
              }
              
              if (item._type === 'textItem' && item.text) {
                return (
                  <span
                    key={item._key}
                    ref={(el) => { logoRefs.current[index] = el; }}
                    className="text-accent-sm text-foreground-muted"
                  >
                    {item.text}
                  </span>
                );
              }
              
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}