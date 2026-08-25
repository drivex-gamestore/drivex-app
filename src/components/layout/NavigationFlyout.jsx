"use client";

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap, useGSAP } from '@lib/vendor';
import { motion } from 'framer-motion';
import { useBreakpoint } from '@shared/hooks/useIsTouchDevice';
import { usePageTransition } from '@shared/hooks/usePageTransition';
import useDualLayerScramble from '@features/animations/hooks/useDualLayerScramble';
import { SanityLink } from '@lib/sanity/components/SanityLink';
import { SanityImage } from '@lib/sanity/components/SanityImage';
import { AnimatedLink } from '@features/animations/components/AnimatedLink';
import { cx } from '@lib/vendor';
import { easings } from '@shared/utils/easings';

const S = easings.power3InOut;
const w = easings.backInOut;

export function NavigationFlyout({
  navItems,
  flyout,
  onClose,
  isOpen,
  spotsRemaining
}) {
  const isLg = useBreakpoint("lg");
  const markerSize = isLg ? 32 : 20;
  const hoverOffset = isLg ? 64 : 36;
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const navRef = useRef(null);
  const navItemRefs = useRef([]);
  const navLinkRefs = useRef([]);
  const contactRefs = useRef([]);
  const availabilityDotRef = useRef(null);
  const spotsDotRef = useRef(null);
  const imagesContainerRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  
  const { startTransition, isTransitioning } = usePageTransition();
  
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [hoverCount, setHoverCount] = useState(0);
  const lastHoveredIndexRef = useRef(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  const activeIndex = useMemo(() => {
    if (!navItems) return null;
    const index = navItems.findIndex(item => 
      !!item.link?.href && (pathname === item.link.href || pathname.startsWith(`${item.link.href}/`))
    );
    return index >= 0 ? index : null;
  }, [navItems, pathname]);
  
  const targetMarkerIndex = hoveredIndex ?? (isAnimationComplete ? activeIndex : null);
  
  useEffect(() => {
    if (targetMarkerIndex === null) {
      setMarkerPos(null);
      return;
    }
    const frameId = requestAnimationFrame(() => {
      const targetItem = navItemRefs.current[targetMarkerIndex];
      const navContainer = navRef.current;
      if (targetItem && navContainer) {
        const navRect = navContainer.getBoundingClientRect();
        const itemRect = targetItem.getBoundingClientRect();
        setMarkerPos({
          y: itemRect.top - navRect.top + (itemRect.height - markerSize) / 2
        });
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [targetMarkerIndex, markerSize]);
  
  const centerCaptionScramble = useDualLayerScramble({ duration: 0.5 });
  const featuredCaptionScramble = useDualLayerScramble({ duration: 0.5 });
  const availabilityScramble = useDualLayerScramble({ duration: 0.5 });
  const spotsScramble = useDualLayerScramble({ duration: 0.5 });
  
  useEffect(() => {
    if (!isOpen) {
      setHoveredIndex(null);
      setMarkerPos(null);
      setHoverCount(0);
      setIsAnimationComplete(false);
      lastHoveredIndexRef.current = null;
      centerCaptionScramble.kill();
      featuredCaptionScramble.kill();
      availabilityScramble.kill();
      spotsScramble.kill();
    }
  }, [isOpen, centerCaptionScramble, featuredCaptionScramble, availabilityScramble, spotsScramble]);
  
  const clearHover = () => {
    setHoveredIndex(null);
  };
  
  const contact = flyout?.contact;
  const team = flyout?.team;
  const socials = flyout?.socials;
  const location = flyout?.location;
  const availability = flyout?.availability;
  const centerImage = flyout?.centerImage;
  const featuredProject = flyout?.featuredProject;
  
  const { contextSafe } = useGSAP(() => {
    if (containerRef.current) {
      if (timelineRef.current?.kill(), isOpen) {
        timelineRef.current = gsap.timeline();
        
        gsap.set(containerRef.current, {
          clipPath: "none",
          gridTemplateRows: "0fr"
        });
        
        timelineRef.current.to(containerRef.current, {
          gridTemplateRows: "1fr",
          duration: 1,
          ease: "expo.inOut"
        });
        
        const currentNavLinks = navLinkRefs.current.filter(Boolean);
        if (currentNavLinks.length > 0) {
          timelineRef.current.fromTo(currentNavLinks, {
            yPercent: 110
          }, {
            yPercent: 0,
            duration: 1.4,
            ease: "expo.out",
            stagger: 0.1,
            force3D: true
          }, "<+50%");
        }
        
        const currentContactRefs = contactRefs.current.filter(Boolean);
        if (currentContactRefs.length > 0) {
          timelineRef.current.fromTo(currentContactRefs, {
            yPercent: 110
          }, {
            yPercent: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.04,
            force3D: true
          }, "<+25%");
        }
        
        if (imagesContainerRef.current) {
          timelineRef.current.fromTo(imagesContainerRef.current, {
            opacity: 0
          }, {
            opacity: 1,
            duration: 1,
            ease: "power1.out"
          }, "<+25%");
        }
        
        timelineRef.current.add(() => {
          centerCaptionScramble.kill();
          featuredCaptionScramble.kill();
          availabilityScramble.kill();
          spotsScramble.kill();
          centerCaptionScramble.scramble();
          featuredCaptionScramble.scramble();
          availabilityScramble.scramble();
          spotsScramble.scramble();
        }, "<");
        
        if (availabilityDotRef.current) {
          timelineRef.current.to(availabilityDotRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              availabilityDotRef.current?.classList.add("animate-pulse");
            }
          }, "<");
        }
        
        if (spotsDotRef.current) {
          timelineRef.current.to(spotsDotRef.current, {
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              spotsDotRef.current?.classList.add("animate-pulse");
            }
          }, "<");
        }
        
        timelineRef.current.add(() => {
          setIsAnimationComplete(true);
        }, "<+50%");
        
      } else {
        timelineRef.current = gsap.timeline();
        
        gsap.set(containerRef.current, {
          clipPath: "inset(0% 0% 0% 0%)"
        });
        
        timelineRef.current.to(containerRef.current, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.6,
          ease: "expo.inOut",
          onComplete: () => {
            if (containerRef.current) {
              gsap.set(containerRef.current, {
                gridTemplateRows: "0fr",
                clipPath: "none"
              });
            }
            if (availabilityDotRef.current) {
              gsap.set(availabilityDotRef.current, { opacity: 0 });
              availabilityDotRef.current.classList.remove("animate-pulse");
            }
            if (spotsDotRef.current) {
              gsap.set(spotsDotRef.current, { opacity: 0 });
              spotsDotRef.current.classList.remove("animate-pulse");
            }
            if (imagesContainerRef.current) {
              gsap.set(imagesContainerRef.current, { opacity: 0 });
            }
          }
        });
      }
    }
  }, {
    dependencies: [isOpen],
    scope: containerRef
  });
  
  const handleCenterImageHover = contextSafe(() => {
    centerCaptionScramble.scramble();
  });
  
  const handleFeaturedImageHover = contextSafe(() => {
    featuredCaptionScramble.scramble();
  });
  
  const handleNavigate = useCallback((e, href) => {
    e.preventDefault();
    if (!isTransitioning) {
      onClose();
      setTimeout(() => {
        startTransition(() => {
          router.push(href, { scroll: true });
        });
      }, 150);
    }
  }, [onClose, router, startTransition, isTransitioning]);
  
  return (
    <div className="grid-container">
      <div 
        ref={containerRef} 
        className="grid bg-surface transition-colors duration-300" 
        style={{ gridTemplateRows: "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="p-24 lg:p-64">
            <div className="grid-layout gap-y-32">
              <nav 
                ref={navRef} 
                className="grid-span-12 lg:grid-span-4 relative flex flex-col items-start gap-4"
              >
                {markerPos && (
                  <motion.div
                    className="pointer-events-none absolute left-0 bg-brand"
                    style={{
                      width: markerSize,
                      height: markerSize
                    }}
                    initial={{
                      x: -hoverOffset,
                      y: markerPos.y,
                      opacity: 0
                    }}
                    animate={{
                      x: 0,
                      y: markerPos.y,
                      rotate: 90 * hoverCount,
                      opacity: 1
                    }}
                    transition={{
                      x: { duration: 0.6, ease: S },
                      y: { duration: 0.6, ease: w },
                      rotate: { duration: 0.6, ease: w },
                      opacity: { duration: 0.15 }
                    }}
                  />
                )}
                {navItems?.map((item, index) => {
                  if (!item.link) return null;
                  const isActive = index === activeIndex;
                  const isHovered = index === hoveredIndex;
                  const isTarget = index === targetMarkerIndex;
                  
                  return (
                    <div
                      key={item._key}
                      ref={node => {
                        navItemRefs.current[index] = node;
                      }}
                      className="overflow-y-clip overflow-x-visible"
                    >
                      <motion.div
                        animate={{
                          x: isTarget ? hoverOffset : 0
                        }}
                        transition={{
                          duration: 0.6,
                          ease: S
                        }}
                        onMouseEnter={() => {
                          if (lastHoveredIndexRef.current !== null && lastHoveredIndexRef.current !== index) {
                            setHoverCount(prev => prev + 1);
                          }
                          lastHoveredIndexRef.current = index;
                          setHoveredIndex(index);
                        }}
                        onMouseLeave={clearHover}
                      >
                        <SanityLink
                          ref={node => {
                            navLinkRefs.current[index] = node;
                          }}
                          link={item.link}
                          onClick={e => handleNavigate(e, item.link?.href ?? "/")}
                          className={cx(
                            "block py-4 text-h2 transition-colors duration-300", 
                            isActive || isHovered ? "text-brand" : ""
                          )}
                        >
                          {item.text}
                        </SanityLink>
                      </motion.div>
                    </div>
                  );
                })}
              </nav>
              
              <div className="grid-span-12 lg:grid-span-2 lg:grid-start-5 flex flex-col gap-24">
                {(contact?.email || contact?.phone) && (
                  <div className="flex flex-col gap-4">
                    <div className="overflow-hidden">
                      <p
                        ref={node => {
                          contactRefs.current[0] = node;
                        }}
                        className="text-accent text-foreground-muted transition-colors duration-300"
                      >
                        Contact
                      </p>
                    </div>
                    {contact.email && (
                      <div className="overflow-hidden">
                        <AnimatedLink
                          ref={node => {
                            contactRefs.current[1] = node;
                          }}
                          href={`mailto:${contact.email}`}
                          className="block text-body-sm transition-colors duration-300 lg:text-body"
                        >
                          {contact.email}
                        </AnimatedLink>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="overflow-hidden">
                        <AnimatedLink
                          ref={node => {
                            contactRefs.current[2] = node;
                          }}
                          href={`tel:${contact.phone.replace(/\s/g, "")}`}
                          className="block text-body-sm transition-colors duration-300 lg:text-body"
                        >
                          {contact.phone}
                        </AnimatedLink>
                      </div>
                    )}
                  </div>
                )}
                
                {team && team.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {team.map((member, index) => (
                      <div key={member._key} className="overflow-hidden">
                        <AnimatedLink
                          ref={node => {
                            contactRefs.current[3 + index] = node;
                          }}
                          href={`mailto:${member.email}`}
                          className="block text-body-sm transition-colors duration-300 lg:text-body"
                        >
                          {member.name}: {member.email}
                        </AnimatedLink>
                      </div>
                    ))}
                  </div>
                )}
                
                {socials && socials.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {socials.map((social, index) => (
                      <div key={social._key} className="overflow-hidden">
                        <AnimatedLink
                          ref={node => {
                            contactRefs.current[3 + (team?.length ?? 0) + index] = node;
                          }}
                          href={social.href ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-body-sm transition-colors duration-300 lg:text-body"
                        >
                          {social.name}: {social.handle}
                        </AnimatedLink>
                      </div>
                    ))}
                  </div>
                )}
                
                {location && (
                  <div className="overflow-hidden">
                    <p
                      ref={node => {
                        contactRefs.current[3 + (team?.length ?? 0) + (socials?.length ?? 0)] = node;
                      }}
                      className="text-accent-sm text-foreground-muted transition-colors duration-300"
                    >
                      {location}
                    </p>
                  </div>
                )}
                
                <div className="mt-auto flex flex-col gap-8">
                  {availability?.text && (
                    <p className="inline-flex items-start gap-8 text-accent-sm transition-colors duration-300">
                      {availability.isAvailable && (
                        <span
                          ref={availabilityDotRef}
                          className="mt-6 inline-block size-8 shrink-0 bg-brand opacity-0"
                        />
                      )}
                      <span ref={availabilityScramble.ref} className="opacity-0">
                        {availability.text}
                      </span>
                    </p>
                  )}
                  {spotsRemaining && spotsRemaining > 0 ? (
                    <p className="inline-flex items-start gap-8 text-accent-sm transition-colors duration-300">
                      <span
                        ref={spotsDotRef}
                        className="mt-6 inline-block size-8 shrink-0 bg-brand opacity-0"
                      />
                      <span ref={spotsScramble.ref} className="opacity-0">
                        {`Only ${spotsRemaining} spot${1 === spotsRemaining ? "" : "s"} left`}
                      </span>
                    </p>
                  ) : null}
                </div>
              </div>
              
              <div
                ref={imagesContainerRef}
                className="grid-span-5 grid-start-8 hidden gap-16 opacity-0 lg:flex"
              >
                <div className="flex flex-1 flex-col gap-8">
                  {centerImage?.image ? (
                    centerImage.link ? (
                      <SanityLink
                        link={centerImage.link}
                        onClick={e => handleNavigate(e, centerImage.link?.href ?? "/")}
                        onMouseEnter={handleCenterImageHover}
                        className="block flex-1 overflow-hidden"
                      >
                        <SanityImage
                          image={centerImage.image}
                          className="zoom-in-image h-full w-full object-cover"
                          alt={centerImage.image.altText ?? ""}
                        />
                      </SanityLink>
                    ) : (
                      <SanityImage
                        image={centerImage.image}
                        className="zoom-in-image h-full w-full object-cover"
                        alt={centerImage.image.altText ?? ""}
                      />
                    )
                  ) : (
                    <div className="h-full w-full bg-foreground/5" />
                  )}
                  {centerImage?.caption && (
                    <p
                      ref={centerCaptionScramble.ref}
                      className="text-accent-sm transition-colors duration-300"
                    >
                      {centerImage.caption}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-1 flex-col gap-8">
                  {featuredProject?.project?.uri && featuredProject.project.image ? (
                    <Link
                      href={featuredProject.project.uri}
                      onClick={e => handleNavigate(e, featuredProject.project?.uri ?? "/")}
                      onMouseEnter={handleFeaturedImageHover}
                      className="block flex-1 overflow-hidden transition-opacity duration-300 hover:opacity-80"
                    >
                      <SanityImage
                        image={featuredProject.project.image}
                        className="zoom-in-image h-full w-full object-cover"
                        alt={featuredProject.project.title ?? "Featured Project"}
                      />
                    </Link>
                  ) : (
                    <div className="h-full w-full bg-foreground/5" />
                  )}
                  {featuredProject?.caption && (
                    <p
                      ref={featuredCaptionScramble.ref}
                      className="text-accent-sm transition-colors duration-300"
                    >
                      {featuredProject.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
