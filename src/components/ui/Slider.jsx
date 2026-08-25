"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Slot } from '@radix-ui/react-slot';
import { cx } from '@lib/vendor';

const SliderContext = createContext(null);

export function useSliderContext() {
  const context = useContext(SliderContext);
  if (!context) {
    throw Error("useSliderContext must be used within a Slider");
  }
  return context;
}

const DEFAULT_OPTIONS = { align: "start" };

export function Root({ children, className, options }) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const [emblaRef, emblaApi] = useEmblaCarousel(mergedOptions);

  const [progress, setProgress] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const updateProgress = () => {
      setProgress(Math.max(0, Math.min(1, emblaApi?.scrollProgress() ?? 0)));
    };
    
    const updateSnaps = () => {
      setScrollSnaps(emblaApi?.scrollSnapList() ?? []);
    };
    
    const updateIndex = () => {
      setSelectedIndex(emblaApi?.selectedScrollSnap() ?? 0);
    };
    
    const updateScrollStates = () => {
      setCanScrollPrev(emblaApi?.canScrollPrev() ?? false);
      setCanScrollNext(emblaApi?.canScrollNext() ?? false);
    };

    const handleReInit = () => {
      updateProgress();
      updateSnaps();
      updateIndex();
      updateScrollStates();
    };

    const handleSelect = () => {
      updateIndex();
      updateScrollStates();
    };

    const handleScroll = () => {
      updateProgress();
      updateScrollStates();
    };

    const handleSlideFocus = () => {
      updateProgress();
    };

    handleReInit();

    emblaApi.on("reInit", handleReInit);
    emblaApi.on("scroll", handleScroll);
    emblaApi.on("select", handleSelect);
    emblaApi.on("slideFocus", handleSlideFocus);

    return () => {
      emblaApi?.off("reInit", handleReInit);
      emblaApi?.off("scroll", handleScroll);
      emblaApi?.off("select", handleSelect);
      emblaApi?.off("slideFocus", handleSlideFocus);
    };
  }, [emblaApi]);

  const contextValue = {
    embla: emblaApi,
    ref: emblaRef,
    progress,
    scrollSnaps,
    selectedIndex,
    canScrollPrev,
    canScrollNext
  };

  return (
    <div data-root className={cx("group/slider relative", className)}>
      <SliderContext.Provider value={contextValue}>
        {children}
      </SliderContext.Provider>
    </div>
  );
}

export function Viewport({ children, className, asChild, ...props }) {
  const Comp = asChild ? Slot : "div";
  const { ref } = useSliderContext();

  return (
    <Comp data-viewport ref={ref} className={className} {...props}>
      {children}
    </Comp>
  );
}

export function Slides({ children, className, asChild, ...props }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slides
      className={cx("flex items-stretch will-change-transform", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function Slide({ children, className, asChild, ...props }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slide
      className={cx("min-w-0 shrink-0 grow-0 select-none", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function NextButton({ asChild, children, className, ...props }) {
  const Comp = asChild ? Slot : "button";
  const { embla, canScrollNext } = useSliderContext();

  const handleClick = () => embla?.scrollNext();
  const isDisabled = !canScrollNext;

  return (
    <Comp
      type="button"
      aria-label="Next slide"
      onClick={handleClick}
      disabled={isDisabled}
      className={cx("cursor-pointer disabled:pointer-events-none", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function PrevButton({ asChild, children, className, ...props }) {
  const Comp = asChild ? Slot : "button";
  const { embla, canScrollPrev } = useSliderContext();

  const handleClick = () => embla?.scrollPrev();
  const isDisabled = !canScrollPrev;

  return (
    <Comp
      type="button"
      aria-label="Previous slide"
      onClick={handleClick}
      disabled={isDisabled}
      className={cx("cursor-pointer disabled:pointer-events-none", className)}
      {...props}
    >
      {children}
    </Comp>
  );
}