"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePageEnter } from "@shared/hooks/usePageEnter";
import { usePageEnterContext } from "@providers/PageEnterProvider";
import { AnimatedHeadline } from "@animations/components/AnimatedHeadline";
import { AnimatedSubtext } from "@animations/components/AnimatedSubtext";
import { cx } from "@lib/vendor";

export default function HeroTextOnly({
  headline,
  headlineLevel,
  headlineDisplay,
  subtext,
  className,
}) {
  const sectionRef = useRef(null);
  const subtextRef = useRef(null);
  const hasRevealedRef = useRef(false);
  const { prefersReducedMotion } = usePageEnterContext();
  const headlineRef = useRef(null);

  const { contextSafe } = useGSAP(() => {}, {
    scope: sectionRef,
    dependencies: [prefersReducedMotion],
  });

  const onEnter = useMemo(
    () =>
      contextSafe((delay) => {
        if (hasRevealedRef.current) return;
        hasRevealedRef.current = true;
        const revealDelay = delay + 0.3;
        headlineRef.current?.reveal(revealDelay);
        subtextRef.current?.reveal(revealDelay + 0.15);
      }),
    [contextSafe]
  );

  usePageEnter(onEnter, { priority: 1, skip: prefersReducedMotion });

  return (
    <div ref={sectionRef} className={cx("grid-container", className)}>
      <div className="grid-layout items-center justify-center">
        <div className="grid-span-12 lg:grid-span-10 lg:grid-start-2 flex flex-col items-center gap-16 text-center lg:gap-24">
          {headline && (
            <AnimatedHeadline
              ref={headlineRef}
              as={headlineLevel ?? "h1"}
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
              className="max-w-2xl text-body text-foreground-muted"
              skip={prefersReducedMotion}
            >
              {subtext}
            </AnimatedSubtext>
          )}
        </div>
      </div>
    </div>
  );
}

export { HeroTextOnly };
