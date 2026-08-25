"use client";

import React from 'react';
import { cx } from '@lib/vendor';
import { useSliderContext } from '@components/ui/Slider';

export function SliderNavigation({ className }) {
  const { embla, scrollSnaps, selectedIndex } = useSliderContext();

  return (
    <div className={cx("flex items-center justify-center gap-2", className)}>
      {scrollSnaps.map((snap, index) => (
        <button
          key={`slide-${index}${snap}`}
          type="button"
          onClick={() => embla?.scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
          className={cx(
            "size-6 cursor-pointer rounded-full bg-current transition-opacity duration-400 ease-in-out",
            selectedIndex === index ? "opacity-100" : "opacity-30"
          )}
        />
      ))}
    </div>
  );
}