"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from '@lib/vendor';

function HeroScrollPush({ children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const section = el.closest("section");
    if (!section) return;

    let ctx;
    const timeout = setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.to(el, {
          yPercent: 35,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }, el);
    }, 0);

    return () => {
      clearTimeout(timeout);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export { HeroScrollPush };
