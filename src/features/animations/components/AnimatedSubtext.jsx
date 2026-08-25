import React, { forwardRef, useRef, useState, useLayoutEffect, useImperativeHandle } from 'react';
import { gsap, SplitText } from '@lib/vendor';
import { cx } from '@lib/vendor';

export const AnimatedSubtext = forwardRef(({
  children,
  className,
  skip = false,
  staggerDelay = 0.05,
  duration = 0.8
}, ref) => {
  const elementRef = useRef(null);
  const splitTextRef = useRef(null);
  const [isSplit, setIsSplit] = useState(false);

  useLayoutEffect(() => {
    if (elementRef.current && !skip) {
      setIsSplit(false);
      splitTextRef.current = new SplitText(elementRef.current, {
        type: "lines",
        autoSplit: true,
        aria: false,
        deepSlice: true,
        reduceWhiteSpace: false,
        mask: "lines",
        linesClass: "split-line",
        onSplit: () => setIsSplit(true)
      });

      return () => {
        splitTextRef.current?.revert();
        splitTextRef.current = null;
      };
    }
  }, [skip]);

  useImperativeHandle(ref, () => ({
    reveal: (delay = 0) => {
      if (!elementRef.current || !splitTextRef.current || skip) return;
      
      const lines = splitTextRef.current.lines ?? [];
      
      if (lines.length !== 0) {
        elementRef.current.style.visibility = "visible";
        gsap.fromTo(
          lines,
          { y: "100%" },
          {
            y: "0%",
            duration: duration,
            ease: "power3.out",
            stagger: staggerDelay,
            delay: delay
          }
        );
      }
    }
  }), [skip, duration, staggerDelay]);

  const renderWithLineBreaks = (text) => {
    const lines = text.split("\n");
    return lines.map((line, index) => (
      // TODO: verify key stability - index used as key for text lines
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  return skip ? (
    <p className={className}>
      {renderWithLineBreaks(children)}
    </p>
  ) : (
    <p ref={elementRef} className={cx("invisible", className)}>
      {renderWithLineBreaks(children)}
    </p>
  );
});

AnimatedSubtext.displayName = "AnimatedSubtext";