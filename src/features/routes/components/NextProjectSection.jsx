"use client";

import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap, ScrollTrigger, useGSAP } from '@lib/vendor';
import { usePageTransition } from '@shared/hooks/usePageTransition';
import { Link } from '@shared/constants/navigation';
import { SanityMedia } from '@lib/sanity/components/SanityMedia';


function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hideFooterOnMount() {
  document.body.dataset.hideFooter = "true";
  return restoreFooterOnUnmount;
}

function restoreFooterOnUnmount() {
  delete document.body.dataset.hideFooter;
}

export function NextProjectSection({ nextProject }) {
  const sectionRef = useRef(null);
  const progressBarRef = useRef(null);
  const subtextRef = useRef(null);
  const titleRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const router = useRouter();
  
  const { startTransition, isTransitioning } = usePageTransition();
  const isTransitioningRef = useRef(isTransitioning);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  const handleClick = (e) => {
    e.preventDefault();
    if (!isTransitioning && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      if (prefersReducedMotion()) {
        router.push(nextProject.uri, { scroll: true });
        return;
      }
      startTransition(() => {
        router.push(nextProject.uri, { scroll: true });
      });
    }
  };

  useEffect(hideFooterOnMount, []);

  const setupGSAPAnimations = () => {
    if (!sectionRef.current || !progressBarRef.current) return;
    
    hasTriggeredRef.current = false;
    gsap.set(progressBarRef.current, { scaleX: 0 });
    
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (e) => {
        gsap.set(progressBarRef.current, { scaleX: e.progress });
        
        if (e.progress >= 0.99 && !hasTriggeredRef.current && !isTransitioningRef.current) {
          hasTriggeredRef.current = true;
          
          if (prefersReducedMotion()) {
            router.push(nextProject.uri, { scroll: true });
            return;
          }
          
          startTransition(() => {
            router.push(nextProject.uri, { scroll: true });
          });
        }
      }
    });

    const textElements = [subtextRef.current, titleRef.current].filter(Boolean);
    
    if (textElements.length > 0) {
      gsap.set(textElements, { yPercent: 110 });
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 10%",
        end: "top 10%",
        onEnter: () => {
          gsap.to(textElements, {
            yPercent: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1
          });
        },
        onLeaveBack: () => {
          gsap.to(textElements, {
            yPercent: 110,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1
          });
        }
      });
    }
  };

  useGSAP(setupGSAPAnimations, {
    scope: sectionRef,
    dependencies: [nextProject.uri]
  });

  return (
    <section
      ref={sectionRef}
      data-theme="dark"
      data-hide-header={true}
      className="h-[300vh]"
    >
      <Link
        href={nextProject.uri}
        onClick={handleClick}
        className="sticky top-0 block h-dvh"
        data-cursor-text="VIEW PROJECT"
      >
        {nextProject.mainImage && (
          <SanityMedia
            media={nextProject.mainImage}
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay={true}
            loop={true}
          />
        )}
        
        <div
          className="absolute inset-x-0 top-0 h-256"
          style={{ background: "linear-gradient(to bottom, rgb(20 19 20 / 0.5), transparent)" }}
        />
        
        <div className="grid-container absolute inset-x-0 top-0 pt-32">
          <p className="text-accent text-foreground uppercase">
            [Keep scrolling to see more]
          </p>
        </div>
        
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent)" }}
        />
        
        <div className="absolute inset-x-0 bottom-0 pb-32">
          <div className="grid-container">
            <div className="grid-layout !gap-y-0 items-end">
              <div className="grid-span-12 lg:grid-span-6 overflow-hidden">
                <p ref={subtextRef} className="text-foreground-muted text-h2">
                  Next case
                </p>
              </div>
              <div className="grid-span-12 lg:grid-span-6 overflow-hidden lg:text-right">
                <h2 ref={titleRef} className="text-foreground text-h1">
                  {nextProject.title}
                </h2>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-4 bg-foreground/10">
          <div ref={progressBarRef} className="h-full origin-left bg-brand" />
        </div>
      </Link>
    </section>
  );
}

