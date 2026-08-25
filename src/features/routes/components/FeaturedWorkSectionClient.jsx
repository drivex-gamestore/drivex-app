"use client";

import React, { useRef, useEffect, useState, Fragment } from 'react';
import { gsap, ScrollTrigger } from '@lib/vendor';
import Link from 'next/link';
import { useLenis } from '@providers/LenisProvider';
import { ScrollAnimatedHeadline } from '@animations/components/ScrollAnimatedHeadline';
import { FlipIndicator } from '@animations/components/FlipIndicator';
import { SanityButton } from '@lib/sanity/components/SanityButton';
import { SanityMedia } from '@lib/sanity/components/SanityMedia';
import { SanityImage } from '@lib/sanity/components/SanityImage';
import useDualLayerScramble from '@animations/hooks/useDualLayerScramble';
import { useIdleGSAP } from '@shared/hooks/useIdleGSAP';
import { cx } from '@lib/vendor';

function easeOutCubic(e) {
  return 1 - (1 - e) ** 3;
}

function incrementRotation(e) {
  return e + 1;
}

function CaseStudyTitle({ title, onRegisterScramble }) {
  const { ref, scramble } = useDualLayerScramble({ duration: 0.5 });
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    onRegisterScramble(scramble);
  }, [scramble, onRegisterScramble]);

  useIdleGSAP(
    () => {
      if (ref.current) {
        hasEnteredRef.current = false;
        ScrollTrigger.create({
          trigger: ref.current,
          start: 'top 95%',
          onEnter: () => {
            if (!hasEnteredRef.current) {
              hasEnteredRef.current = true;
              scramble();
            }
          },
        });
      }
    },
    { dependencies: [scramble] }
  );

  return (
    <h3 ref={ref} className="text-accent-lg">
      {title}
    </h3>
  );
}


function MobileCaseStudy(caseStudy, index) {
  return (
    <div key={caseStudy._id} className="flex flex-col">
      <Link
        href={caseStudy.uri ?? '#'}
        className="group relative block aspect-[16/10] overflow-hidden"
        data-cursor-text="VIEW PROJECT"
      >
        {caseStudy.featuredMedia && (
          <SanityMedia
            media={caseStudy.featuredMedia}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            imageProps={index === 0 ? { priority: true } : undefined}
          />
        )}
      </Link>
      <div className="mt-16 flex flex-col gap-8">
        <h3 className="text-h5">{caseStudy.title}</h3>
        {caseStudy.tags && caseStudy.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-8 text-accent-sm text-foreground-muted">
            {caseStudy.tags.map(MobileTag)}
          </div>
        )}
      </div>
    </div>
  );
}

function MobileTag(tag, index) {
  return (
    <Fragment key={tag}>
      {index > 0 && <span className="text-foreground-muted">—</span>}
      <span>[{tag}]</span>
    </Fragment>
  );
}

function DesktopTag(tag, index) {
  return (
    <Fragment key={tag}>
      {index > 0 && <span className="text-foreground-muted">—</span>}
      <span className="text-accent-sm uppercase">[{tag}]</span>
    </Fragment>
  );
}


export default function FeaturedWorkSectionClient({ section }) {
  const content = section.content ?? {};
  const { headline, text, viewAllButton, caseStudies } = content;

  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationCount, setRotationCount] = useState(0);
  const currentIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

  const sectionRefs = useRef([]);
  const scrambleFns = useRef([]);
  const imageRefs = useRef([]);

  const lenis = useLenis();

  useEffect(() => {
    if (!caseStudies?.length) return;
    
    const observers = [];
    sectionRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (!isScrollingRef.current) {
            entries.forEach((entry) => {
              if (
                entry.isIntersecting &&
                entry.intersectionRatio >= 0.5 &&
                currentIndexRef.current !== index
              ) {
                currentIndexRef.current = index;
                setActiveIndex(index);
              }
            });
          }
        },
        { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      for (const obs of observers) {
        obs.disconnect();
      }
    };
  }, [caseStudies?.length]);

  useIdleGSAP(
    () => {
      if (!window.matchMedia('(max-width: 1023px)').matches) {
        for (const img of imageRefs.current) {
          if (img) {
            gsap.set(img, { scale: 1.3 });
            gsap.fromTo(
              img,
              { yPercent: -15 },
              {
                yPercent: 15,
                ease: 'none',
                scrollTrigger: {
                  trigger: img.parentElement,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            );
          }
        }
      }
    },
    { dependencies: [caseStudies?.length] }
  );

  if (!caseStudies?.length) return null;

  return (
    <Fragment>
      {/* Desktop Layout */}
      <div className="hidden py-128 lg:block">
        <div className="grid-container">
          <div className="grid-layout">
            <div className="grid-span-3">
              <div className="sticky top-header flex h-[calc(100vh-var(--site-header-height))] flex-col justify-between py-32 align-start">
                <div>
                  {headline?.text && (
                    <ScrollAnimatedHeadline
                      headline={{ text: headline.text, level: headline.level ?? 'h2' }}
                      className="mb-24"
                    />
                  )}
                  {text && (
                    <p className="whitespace-pre-line text-body text-foreground-muted">
                      {text}
                    </p>
                  )}
                </div>

                <nav className="flex flex-col items-start gap-8">
                  {caseStudies.map((caseStudy, index) => (
                    <button
                      key={caseStudy._id}
                      type="button"
                      onClick={() => {
                        const el = sectionRefs.current[index];
                        if (!el || !lenis || currentIndexRef.current === index) return;
                        
                        isScrollingRef.current = true;
                        setRotationCount(incrementRotation);
                        currentIndexRef.current = index;
                        setActiveIndex(index);
                        
                        const rect = el.getBoundingClientRect();
                        const targetScroll =
                          window.scrollY +
                          rect.top -
                          window.innerHeight / 2 +
                          rect.height / 2;
                          
                        lenis.scrollTo(targetScroll, {
                          duration: 0.8,
                          easing: easeOutCubic,
                          onComplete: () => {
                            isScrollingRef.current = false;
                          },
                        });
                      }}
                      onMouseEnter={() => scrambleFns.current[index]?.()}
                      className="group relative flex cursor-pointer items-center gap-12"
                      aria-label={`Go to ${caseStudy.title ?? `case study ${index + 1}`}`}
                      aria-current={index === activeIndex ? 'true' : undefined}
                    >
                      <div
                        className={cx(
                          'relative aspect-[16/9] w-128 overflow-hidden transition-opacity duration-300',
                          index === activeIndex ? 'opacity-100' : 'opacity-40'
                        )}
                      >
                        {caseStudy.thumbnail && (
                          <SanityImage
                            image={caseStudy.thumbnail}
                            alt={caseStudy.title ?? 'Case study thumbnail'}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      {index === activeIndex && (
                        <FlipIndicator
                          layoutId="featured-work-indicator"
                          className="h-8 w-8 bg-brand"
                          rotate={90 * rotationCount}
                        />
                      )}
                    </button>
                  ))}
                </nav>

                {viewAllButton && (
                  <div>
                    <SanityButton button={viewAllButton} />
                  </div>
                )}
              </div>
            </div>

            <div className="grid-span-8 grid-start-5 flex flex-col gap-64 py-32">
              {caseStudies.map((caseStudy, index) => (
                <div
                  key={caseStudy._id}
                  ref={(e) => {
                    sectionRefs.current[index] = e;
                  }}
                  className="flex flex-col"
                >
                  <Link
                    href={caseStudy.uri ?? '#'}
                    className="group relative block aspect-[16/10] overflow-hidden"
                    data-cursor-text="VIEW PROJECT"
                    onMouseEnter={() => scrambleFns.current[index]?.()}
                  >
                    {caseStudy.featuredMedia && (
                      <div
                        ref={(e) => {
                          imageRefs.current[index] = e;
                        }}
                        className="h-full w-full"
                        style={{ willChange: 'transform' }}
                      >
                        <SanityMedia
                          media={caseStudy.featuredMedia}
                          className="zoom-in-image h-full w-full object-cover"
                          imageProps={index === 0 ? { priority: true } : undefined}
                        />
                      </div>
                    )}
                  </Link>
                  <div className="mt-16 flex items-start justify-between gap-16">
                    <CaseStudyTitle
                      title={caseStudy.title}
                      onRegisterScramble={(e) => {
                        scrambleFns.current[index] = e;
                      }}
                    />
                    {caseStudy.tags && caseStudy.tags.length > 0 && (
                      <div className="flex items-center gap-8 text-body text-foreground-muted">
                        {caseStudy.tags.map(DesktopTag)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="grid-container py-32 lg:hidden">
        <div className="mb-32">
          {headline?.text && (
            <ScrollAnimatedHeadline
              headline={{ text: headline.text, level: headline.level ?? 'h2' }}
              className="mb-16"
            />
          )}
          {text && (
            <p className="whitespace-pre-line text-body text-foreground-muted">
              {text}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-32">
          {caseStudies.map(MobileCaseStudy)}
        </div>

        {viewAllButton && (
          <div className="mt-32">
            <SanityButton button={viewAllButton} />
          </div>
        )}
      </div>
    </Fragment>
  );
}