"use client";

import React, { Fragment, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { SpotsBadge } from "@components/utilities/SpotsBadge";
import { ScrambleText } from "@features/animations/components/ScrambleText";
import { useIsTouchDevice } from "@shared/hooks/useIsTouchDevice";
import { useMousePosition } from "@shared/hooks/useMousePosition";
import { NewsletterForm } from "@features/newsletters/NewsletterForm";

import { SanityRichText } from "@lib/sanity/components/SanityRichText";
import { SanityLink } from "@lib/sanity/components/SanityLink";
import { SanityImage } from "@lib/sanity/components/SanityImage";
import { getImageSrc } from "@lib/sanity/utils/sanity-imageutils";
import { cx } from '@lib/vendor';
import { DriveXWatermark } from "@components/utilities/DriveXWatermark";

const AsciiTypewriter = dynamic(
    () => import("@features/ascii/components/AsciiTypewriter").then((mod) => mod.AsciiTypewriter),
    { ssr: false }
);

const DEFAULT_COLOR = "#FB460D";

function clamp(value) {
    return Math.max(0, Math.min(1, value));
}

function easeOutSine(x) {
    return Math.sin((x * Math.PI) / 2);
}

function dispatchChangeColor() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "c", bubbles: true }));
}

function dispatchToggleGrid() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g", metaKey: true, bubbles: true }));
}

function NavigationItem(item) {
    return (
        <li key={item._key}>
            {item.link && item.text && (
                <SanityLink
                    link={item.link}
                    className="text-accent text-foreground-muted"
                    aria-label={item.text}
                >
                    <ScrambleText triggerOnHover={true} secondColorClass="scramble-inherit">
                        {item.text}
                    </ScrambleText>
                </SanityLink>
            )}
        </li>
    );
}

function AsciiWrapper(props) {
    const {
        imageSrc,
        color,
        colorDark,
        cellSize,
        alignX = "center",
        externalProgress,
        externalColorProgress,
        depthMapSrc,
        parallaxIntensity = 0.02,
        mouseRef,
        isHovering = false,
        isTouch = false,
        mobileFit,
        revealOriginX,
        revealOriginY,
        frameloop,
        dpr
    } = props;

    const isExternalAnimation = externalProgress !== undefined;
    const progress = isExternalAnimation ? externalProgress : undefined;
    const colorProgress = isExternalAnimation ? externalColorProgress : undefined;
    const enableDepthParallax = !isTouch && !!depthMapSrc;
    const enableGooeyReveal = !isTouch && !!depthMapSrc;

    const revealOrigin = (revealOriginX != null && revealOriginY != null) 
        ? { revealOrigin: { x: revealOriginX, y: revealOriginY } } 
        : undefined;
    const frameloopConfig = frameloop !== undefined ? { frameloop } : undefined;
    const dprConfig = dpr !== undefined ? { dpr } : undefined;

    return (
        <AsciiTypewriter
            imageSrc={imageSrc}
            color={color}
            colorDark={colorDark}
            cellSize={cellSize}
            alignX={alignX}
            alignY="center"
            fit="contain"
            mobileFit={mobileFit}
            className="size-full"
            externalProgress={progress}
            externalColorProgress={colorProgress}
            disableInternalAnimation={isExternalAnimation}
            enableDepthParallax={enableDepthParallax}
            depthMapSrc={depthMapSrc}
            parallaxIntensity={parallaxIntensity}
            mouseRef={mouseRef}
            enableGooeyReveal={enableGooeyReveal}
            isHovering={isHovering}
            gooeyRadius={0.035}
            gooeySoftness={0.04}
            gooeyNoiseIntensity={0.02}
            {...revealOrigin}
            {...frameloopConfig}
            {...dprConfig}
            skipContentBounds={true}
        />
    );
}

export function FooterClient(props) {
    const {
        navigation,
        contactInformation,
        copyrightNotice,
        asciiImageLeft,
        asciiDepthMapLeft,
        asciiColorLeft,
        asciiColorDarkLeft,
        asciiCellSizeLeft,
        asciiParallaxIntensityLeft,
        asciiRevealOriginXLeft,
        asciiRevealOriginYLeft,
        asciiMobileFallbackLeft,
        asciiImage,
        asciiDepthMap,
        asciiColor,
        asciiColorDark,
        asciiCellSize,
        asciiParallaxIntensity,
        asciiRevealOriginX,
        asciiRevealOriginY,
        asciiMobileFallback,
        showWatermark,
        spotsRemaining
    } = props;

    const footerWrapperRef = useRef(null);
    const footerRef = useRef(null);
    const contentRef = useRef(null);
    const animationRafRef = useRef(null);
    const scrollRafRef = useRef(null);
    const leftContainerRef = useRef(null);
    const rightContainerRef = useRef(null);
    const hasIntersectedRef = useRef(false);

    const [isMounted, setIsMounted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    
    const isTouchDevice = useIsTouchDevice();
    const [isScrollReady, setIsScrollReady] = useState(false);

    const leftProgressRef = useRef({ progress: 0, colorProgress: 0 });
    const rightProgressRef = useRef({ progress: 0, colorProgress: 0 });
    
    const [progressState, setProgressState] = useState({
        left: 0,
        leftColor: 0,
        right: 0,
        rightColor: 0
    });

    useEffect(() => {
        if (!document.documentElement.classList.contains("scroll-locked")) {
            const rafId = requestAnimationFrame(() => setIsScrollReady(true));
            return () => cancelAnimationFrame(rafId);
        }

        const observer = new MutationObserver(() => {
            if (!document.documentElement.classList.contains("scroll-locked")) {
                observer.disconnect();
                requestAnimationFrame(() => setIsScrollReady(true));
            }
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        });

        return () => observer.disconnect();
    }, []);

    const leftImageSrc = asciiImageLeft ? getImageSrc(asciiImageLeft, isTouchDevice ? { width: 400 } : undefined) : null;
    const leftDepthSrc = isTouchDevice ? null : (asciiDepthMapLeft ? getImageSrc(asciiDepthMapLeft) : null);
    
    const rightImageSrc = asciiImage ? getImageSrc(asciiImage, isTouchDevice ? { width: 400 } : undefined) : null;
    const rightDepthSrc = isTouchDevice ? null : (asciiDepthMap ? getImageSrc(asciiDepthMap) : null);

    const isReadyForAscii = isMounted && !prefersReducedMotion;
    
    const { isHovering: isHoveringLeft, mouseRef: mouseRefLeft } = useMousePosition({
        enabled: isReadyForAscii && !isTouchDevice,
        containerRef: leftContainerRef,
        refOnly: true
    });

    const { isHovering: isHoveringRight, mouseRef: mouseRefRight } = useMousePosition({
        enabled: isReadyForAscii && !isTouchDevice,
        containerRef: rightContainerRef,
        refOnly: true
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener("change", handleChange);
        
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        if (!footerRef.current) return;

        if (prefersReducedMotion) {
            setIsAnimating(true);
            leftProgressRef.current = { progress: 1, colorProgress: 1 };
            rightProgressRef.current = { progress: 1, colorProgress: 1 };
            setProgressState({ left: 1, leftColor: 1, right: 1, rightColor: 1 });
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            
            if (entry?.isIntersecting && !hasIntersectedRef.current) {
                hasIntersectedRef.current = true;
                setIsAnimating(true);
                
                const startTime = performance.now();
                
                const animate = (time) => {
                    const elapsed = time - startTime;
                    const valProgress = easeOutSine(clamp(elapsed / 3000));
                    const valColorProgress = easeOutSine(clamp((elapsed - 500) / 3000));

                    if (leftImageSrc) {
                        leftProgressRef.current = { progress: valProgress, colorProgress: valColorProgress };
                    }
                    if (rightImageSrc) {
                        rightProgressRef.current = { progress: valProgress, colorProgress: valColorProgress };
                    }

                    setProgressState({
                        left: leftProgressRef.current.progress,
                        leftColor: leftProgressRef.current.colorProgress,
                        right: rightProgressRef.current.progress,
                        rightColor: rightProgressRef.current.colorProgress
                    });

                    if (elapsed < 3500) {
                        animationRafRef.current = requestAnimationFrame(animate);
                        return;
                    }
                    
                    animationRafRef.current = null;
                    setProgressState({ left: 1, leftColor: 1, right: 1, rightColor: 1 });
                };

                if (animationRafRef.current) cancelAnimationFrame(animationRafRef.current);
                animationRafRef.current = requestAnimationFrame(animate);
            }
        }, { threshold: 0.2 });

        observer.observe(footerRef.current);

        return () => {
            observer.disconnect();
            if (animationRafRef.current) {
                cancelAnimationFrame(animationRafRef.current);
                animationRafRef.current = null;
            }
        };
    }, [leftImageSrc, rightImageSrc, prefersReducedMotion]);

    useEffect(() => {
        if (!footerRef.current || !footerWrapperRef.current || !isScrollReady || prefersReducedMotion) return;

        const footerEl = footerRef.current;
        const wrapperEl = footerWrapperRef.current;
        const contentEl = contentRef.current;

        const updateScroll = () => {
            scrollRafRef.current = null;
            const rect = wrapperEl.getBoundingClientRect();
            // Calculate scroll progress percentage based on window height and footer height
            const progress = clamp((window.innerHeight - rect.top) / Math.max(rect.height, 1));
            
            // Translate from -20% to 0%
            footerEl.style.transform = `translate3d(0, ${-20 + 20 * progress}%, 0)`;
            if (contentEl) {
                contentEl.style.opacity = String(progress);
            }
        };

        const requestUpdate = () => {
            if (scrollRafRef.current == null) {
                scrollRafRef.current = requestAnimationFrame(updateScroll);
            }
        };

        const onScroll = () => requestUpdate();
        const onResize = () => requestUpdate();

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        const resizeObserver = new ResizeObserver(() => {
            requestUpdate();
        });
        resizeObserver.observe(document.body);
        
        requestUpdate();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            resizeObserver.disconnect();
            
            if (scrollRafRef.current) {
                cancelAnimationFrame(scrollRafRef.current);
                scrollRafRef.current = null;
            }
            
            footerEl.style.transform = "";
            if (contentEl) contentEl.style.opacity = "";
        };
    }, [isScrollReady, prefersReducedMotion]);

    return (
        <Fragment>
            <div ref={footerWrapperRef}>
                <footer
                    data-theme="dark"
                    ref={footerRef}
                    className="relative h-auto min-h-svh overflow-hidden bg-background pt-48 lg:h-svh"
                >
                    {/* Left Ascii Typewriter */}
                    {leftImageSrc && isReadyForAscii && (
                        <div ref={leftContainerRef} className="pointer-events-none absolute top-[12.5%] bottom-0 left-0 z-20 w-1/2">
                            <AsciiWrapper
                                imageSrc={leftImageSrc}
                                color={asciiColorLeft ?? DEFAULT_COLOR}
                                colorDark={asciiColorDarkLeft ?? undefined}
                                cellSize={asciiCellSizeLeft ?? 20}
                                alignX="left"
                                mobileFit="contain"
                                externalProgress={progressState.left}
                                externalColorProgress={progressState.leftColor}
                                depthMapSrc={isTouchDevice ? undefined : (leftDepthSrc ?? undefined)}
                                parallaxIntensity={asciiParallaxIntensityLeft ?? 0.02}
                                mouseRef={isTouchDevice ? undefined : mouseRefLeft}
                                isHovering={!isTouchDevice && isHoveringLeft}
                                isTouch={isTouchDevice}
                                revealOriginX={asciiRevealOriginXLeft ?? undefined}
                                revealOriginY={asciiRevealOriginYLeft ?? undefined}
                                frameloop="demand"
                                dpr={[1, 1.5]}
                            />
                        </div>
                    )}

                    {/* Left Mobile Fallback Image */}
                    {asciiMobileFallbackLeft && isMounted && !isReadyForAscii && (
                        <div className="pointer-events-none absolute top-1/5 -left-1/3 flex w-3/4 items-end lg:hidden">
                            <SanityImage
                                image={asciiMobileFallbackLeft}
                                className="h-full w-full"
                                style={{ objectFit: "contain", objectPosition: "left bottom" }}
                            />
                        </div>
                    )}

                    {/* Right Ascii Typewriter */}
                    {rightImageSrc && isReadyForAscii && (
                        <div ref={rightContainerRef} className="pointer-events-none absolute top-[12.5%] right-0 bottom-0 z-20 w-1/2">
                            <AsciiWrapper
                                imageSrc={rightImageSrc}
                                color={asciiColor ?? DEFAULT_COLOR}
                                colorDark={asciiColorDark ?? undefined}
                                cellSize={asciiCellSize ?? 20}
                                alignX="right"
                                mobileFit="contain"
                                externalProgress={progressState.right}
                                externalColorProgress={progressState.rightColor}
                                depthMapSrc={isTouchDevice ? undefined : (rightDepthSrc ?? undefined)}
                                parallaxIntensity={asciiParallaxIntensity ?? 0.02}
                                mouseRef={isTouchDevice ? undefined : mouseRefRight}
                                isHovering={!isTouchDevice && isHoveringRight}
                                isTouch={isTouchDevice}
                                revealOriginX={asciiRevealOriginX ?? undefined}
                                revealOriginY={asciiRevealOriginY ?? undefined}
                                frameloop="demand"
                                dpr={[1, 1.5]}
                            />
                        </div>
                    )}

                    {/* Right Mobile Fallback Image */}
                    {asciiMobileFallback && isMounted && !isReadyForAscii && (
                        <div className="pointer-events-none absolute top-1/5 -right-1/3 flex w-3/4 items-end lg:hidden">
                            <SanityImage
                                image={asciiMobileFallback}
                                className="h-full w-full"
                                style={{ objectFit: "contain", objectPosition: "right bottom" }}
                            />
                        </div>
                    )}

                    <div ref={contentRef} className="grid-container pointer-events-none relative z-30 flex h-full flex-col">
                        <div className="grid-layout !gap-y-48 lg:gap-y-0">
                            
                            {/* Newsletter & Availability Section */}
                            <div className="grid-span-12 lg:grid-span-3 lg:grid-start-1 pointer-events-auto flex flex-col gap-16">
                                <NewsletterForm
                                    heading="Don't miss out on future updates."
                                    buttonText="Subscribe"
                                    buttonTheme="light"
                                />
                                {navigation?.availability?.isAvailable && navigation.availability.text && (
                                    <div className="flex flex-col items-start gap-4">
                                        <p className="flex items-center gap-8 text-accent-sm text-foreground-muted">
                                            <span className="inline-block size-8 shrink-0 animate-pulse bg-brand" />
                                            <span>{navigation.availability.text}</span>
                                        </p>
                                        <SpotsBadge className="tex-foreground-muted" spots={spotsRemaining} />
                                    </div>
                                )}
                            </div>

                            {/* Navigation Links */}
                            {navigation?.items && navigation.items.length > 0 && (
                                <div className="grid-span-12 lg:grid-span-2 lg:grid-start-6 pointer-events-auto">
                                    <ul className="flex flex-col items-start gap-4 space-y-4 lg:items-center">
                                        {navigation.items.map(NavigationItem)}
                                    </ul>
                                </div>
                            )}

                            {/* Contact Info & Hidden Shortcuts */}
                            <div className="grid-span-12 lg:grid-span-3 lg:grid-start-10 pointer-events-auto flex flex-col gap-16">
                                {contactInformation && (
                                    <div className="prose prose-sm text-foreground-muted">
                                        <SanityRichText value={contactInformation} />
                                    </div>
                                )}
                                <div className="flex flex-col gap-4 text-accent-sm text-foreground-muted opacity-40">
                                    <button
                                        type="button"
                                        className="flex cursor-pointer items-center gap-6"
                                        onClick={dispatchToggleGrid}
                                    >
                                        <kbd className="bg-surface px-4 py-2">⌘G</kbd> grid
                                    </button>
                                    <button
                                        type="button"
                                        className="flex cursor-pointer items-center gap-6"
                                        onClick={dispatchChangeColor}
                                    >
                                        <kbd className="bg-surface px-4 py-2">C</kbd> change color
                                    </button>
                                </div>
                            </div>
                            
                        </div>

                        {/* Copyright Notice */}
                        <div className="pointer-events-auto pt-[12.5%] text-center text-body text-foreground-muted">
                            <span>© {new Date().getFullYear()}</span>
                            {copyrightNotice && (
                                <span className="prose prose-sm inline">
                                    {" "}
                                    <SanityRichText value={copyrightNotice} />
                                </span>
                            )}
                        </div>

                        {/* Animated Background Watermark */}
                        <div className="mt-auto flex flex-col">
                            {showWatermark && (
                                <div className="mt-auto overflow-hidden">
                                    <DriveXWatermark
                                        className={cx(
                                            "text-foreground opacity-10",
                                            isAnimating && !prefersReducedMotion && "animate-watermark"
                                        )}
                                        animate={isAnimating && !prefersReducedMotion}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </footer>
            </div>
        </Fragment>
    );
}

