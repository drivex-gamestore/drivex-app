"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { composeRefs } from "@radix-ui/react-compose-refs";
import { cx } from '@lib/vendor';
import { screens } from '@shared/constants/screens'; 
import { parseResponsiveValues } from '@lib/sanity/utils/responsive'; 


function parsePixelValue(val) {
  let trimmed = val.trim();
  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

function calculateYOffset(progress) {
  return `calc(var(--parallax-overflow) * ${2 * progress - 1})`;
}

function calculateXOffset(progress) {
  return `calc(var(--parallax-overflow) * ${2 * progress - 1})`;
}

function getResponsiveStylesAndClasses(overflow) {
  let normalizedValue = typeof overflow === "number" ? `${overflow}px` : overflow;
  let parsed = parseResponsiveValues(normalizedValue);
  let screenKeys = Object.keys(screens);
  let styles = {};
  
  let defaultValue = parsePixelValue(parsed.DEFAULT?.value ?? normalizedValue);
  styles["--parallax-overflow-DEFAULT"] = defaultValue;
  
  let currentValue = defaultValue;
  
  for (let key of screenKeys) {
    let screenValue = parsePixelValue(parsed[key]?.value || currentValue);
    styles[`--parallax-overflow-${key}`] = screenValue;
    currentValue = screenValue;
  }
  
  return {
    styles,
    className: [
      "[--parallax-overflow:var(--parallax-overflow-DEFAULT)]",
      "sm:[--parallax-overflow:var(--parallax-overflow-sm)]",
      "md:[--parallax-overflow:var(--parallax-overflow-md)]",
      "lg:[--parallax-overflow:var(--parallax-overflow-lg)]",
      "xl:[--parallax-overflow:var(--parallax-overflow-xl)]",
      "2xl:[--parallax-overflow:var(--parallax-overflow-2xl)]"
    ]
  };
}

export function InnerParallax(props) {
  const {
    overflow,
    direction = "y",
    className,
    ref,
    children,
    style,
    ...rest
  } = props;

  const containerRef = useRef(null);

  const { styles: parallaxStyles, className: parallaxClassNames } = getResponsiveStylesAndClasses(overflow);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const xTransform = useTransform(scrollYProgress, calculateXOffset);
  const yTransform = useTransform(scrollYProgress, calculateYOffset);

  const motionStyles = direction === "x" 
    ? {
        width: "calc(100% + (2 * var(--parallax-overflow)))",
        left: "calc(-1 * var(--parallax-overflow))",
        x: xTransform
      } 
    : {
        height: "calc(100% + (2 * var(--parallax-overflow)))",
        top: "calc(-1 * var(--parallax-overflow))",
        y: yTransform
      };

  const mergedRefs = composeRefs(ref, containerRef);
  const mergedClassNames = cx(["relative overflow-hidden", className, ...parallaxClassNames]);
  
  const mergedStyles = {
    ...parallaxStyles,
    ...style
  };

  return (
    <div
      ref={mergedRefs}
      className={mergedClassNames}
      style={mergedStyles}
      {...rest}
    >
      <motion.div
        style={motionStyles}
        className="absolute inset-0"
      >
        {children}
      </motion.div>
    </div>
  );
}

