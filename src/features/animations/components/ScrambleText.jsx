"use client";

import React, { useEffect, useRef } from 'react';
import { gsap, ScrambleTextPlugin } from '@lib/vendor';
import { useScrambleGroup } from '@animations/hooks/useScrambleGroup';
import { defaultChars } from '@shared/constants/constants';

export function ScrambleText({
  children,
  className,
  duration = 0.6,
  chars = defaultChars,
  dualLayer = true,
  triggerOnHover = false,
  revealMode = false,
  theme = "dark",
  firstColorClass,
  secondColorClass,
  onComplete,
  onReady,
  multiLine = false
}) {
  const containerRef = useRef(null);
  const textElementRef = useRef(null);
  const timelineRef = useRef(null);
  const internalTextRef = useRef("");
  const isCompleteRef = useRef(false);

  const instanceIdRef = useRef(`scramble-${Math.random().toString(36).slice(2, 9)}`);

  const themeColors = theme === "brand" 
    ? { firstColorClass: "scramble-white", secondColorClass: "scramble-foreground" } 
    : { firstColorClass: "scramble-brand", secondColorClass: "scramble-foreground" };

  const color1 = firstColorClass ?? themeColors.firstColorClass;
  const color2 = secondColorClass ?? themeColors.secondColorClass;

  const scrambleGroup = useScrambleGroup();

  let childText;
  if (typeof children === "string") {
    childText = children;
  } else if (typeof children === "number") {
    childText = String(children);
  } else {
    childText = "";
  }

  useEffect(() => {
    internalTextRef.current = childText;
  }, [childText]);

  const killTimeline = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
    }
  };

  const triggerAnimation = () => {
    if (!textElementRef.current) return null;
    
    const targetEl = textElementRef.current;
    const textToScramble = internalTextRef.current || childText;

    if (!textToScramble || textToScramble.length === 0) return null;

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targetEl.textContent = textToScramble;
      targetEl.className = targetEl.className.replace(/\bscramble-\w+\b/g, "");
      isCompleteRef.current = true;
      onComplete?.();
      return null;
    }

    killTimeline();

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        timelineRef.current = null;
        isCompleteRef.current = true;
        onComplete?.();
      }
    });

    if (dualLayer) {
      const generateScrambledString = (targetString, charset = defaultChars) => {
        let result = "";
        for (let t = 0; t < targetString.length; t++) {
          let char = targetString[t];
          if (char === " " || char === "\n" || char === "\r") {
            result += char;
          } else {
            result += charset[Math.floor(Math.random() * charset.length)];
          }
        }
        return result;
      };

      const scrambledText = generateScrambledString(textToScramble, chars);
      const nonWhitespaceLength = textToScramble.replace(/\s/g, "").length;
      const stepDuration = nonWhitespaceLength > 0 ? duration / nonWhitespaceLength : 0;

      if (revealMode && !isCompleteRef.current) {
        targetEl.textContent = textToScramble.replace(/[^\s\n\r]/g, " ");
        timelineRef.current.to(targetEl, {
          duration: duration,
          scrambleText: {
            text: scrambledText,
            chars: chars,
            speed: 1,
            revealDelay: 0.1,
            oldClass: color1,
            newClass: color1
          },
          ease: "none"
        });
      } else {
        timelineRef.current.to(targetEl, {
          duration: duration,
          scrambleText: {
            text: scrambledText,
            chars: chars,
            speed: 1,
            revealDelay: 0.1,
            oldClass: color2,
            newClass: color1
          },
          ease: "none"
        });
      }

      timelineRef.current.to(targetEl, {
        duration: duration,
        scrambleText: {
          text: textToScramble,
          chars: chars,
          speed: 1,
          revealDelay: 0.1,
          oldClass: color1,
          newClass: color2
        },
        ease: "none"
      }, stepDuration);

    } else {
      timelineRef.current.to(targetEl, {
        duration: duration,
        scrambleText: {
          text: textToScramble,
          chars: chars,
          speed: 1,
          revealDelay: 0.2
        },
        ease: "none"
      });
    }

    return timelineRef.current;
  };


  useEffect(() => {
    if (scrambleGroup) {
      scrambleGroup.register(instanceIdRef.current, triggerAnimation);
      return () => {
        scrambleGroup.unregister(instanceIdRef.current);
      };
    }
  }, [scrambleGroup, triggerAnimation]);

  // Expose the trigger animation function
  useEffect(() => {
    onReady?.(triggerAnimation);
  }, [onReady, triggerAnimation]);

  // Handle trigger on hover
  const handleMouseEnter = () => {
    if (triggerOnHover) {
      triggerAnimation();
    }
  };

  useEffect(() => {
    return () => {
      killTimeline();
    };
  }, []);

  const initialDisplayText = revealMode ? childText.replace(/[^\s\n\r]/g, " ") : childText;
  const whiteSpaceValue = multiLine ? "normal" : "nowrap";
  const displayValue = multiLine ? "inline" : "inline-block";

  const containerStyle = {
    position: "relative",
    display: displayValue,
    whiteSpace: whiteSpaceValue
  };

  const hiddenSpanStyle = {
    visibility: "hidden",
    whiteSpace: whiteSpaceValue
  };

  const animatedSpanStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    whiteSpace: whiteSpaceValue,
    ...(multiLine ? { width: "100%" } : {})
  };

  return (
    <span
      ref={containerRef}
      className={className}
      style={containerStyle}
      onMouseEnter={triggerOnHover ? handleMouseEnter : undefined}
    >
      <span className="sr-only">{childText}</span>
      <span aria-hidden="true" style={hiddenSpanStyle}>
        {childText}
      </span>
      <span ref={textElementRef} aria-hidden="true" style={animatedSpanStyle}>
        {initialDisplayText}
      </span>
    </span>
  );
}

export default ScrambleText;