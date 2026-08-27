"use client";

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, cx } from '@lib/vendor';

export function List({
  items,
  className,
  animated = true,
  pushEffect = false,
}) {
  const containerRef = useRef(null);
  const blockRef = useRef(null);
  const itemRefs = useRef([]);

  useGSAP(
    () => {
      if (!animated || window.matchMedia("(max-width: 1023px)").matches) return;

      const container = containerRef.current;
      const block = blockRef.current;

      if (!container || !block || itemRefs.current.filter((el) => el !== null).length === 0) return;

      const yTo = gsap.quickTo(block, "y", { duration: 0.3, ease: "power2.out" });
      const rotationTo = gsap.quickTo(block, "rotation", { duration: 0.1, ease: "none" });

      const updateBounds = () => {
        const bounds = container.getBoundingClientRect();
        yTo(window.innerHeight / 2 - bounds.top);
      };

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top 55%",
        end: "bottom 45%",
        onUpdate: (self) => {
          rotationTo(360 * self.progress);
          updateBounds();
        },
        onEnter: () => {
          gsap.to(block, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
        },
        onLeave: () => {
          gsap.to(block, { opacity: 0, scale: 0, duration: 0.3, ease: "power2.in" });
        },
        onEnterBack: () => {
          gsap.to(block, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" });
        },
        onLeaveBack: () => {
          gsap.to(block, { opacity: 0, scale: 0, duration: 0.3, ease: "power2.in" });
        },
      });

      const onResize = () => updateBounds();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        st.kill();
      };
    },
    { dependencies: [animated] }
  );

  useGSAP(
    () => {
      if (!pushEffect || window.matchMedia("(max-width: 1023px)").matches) return;

      const container = containerRef.current;
      if (!container) return;

      const validItems = itemRefs.current.filter((el) => el !== null);
      if (validItems.length === 0) return;

      const count = validItems.length;
      const pushMath = (val) => val >= 5 ? 0 : 64 * Math.pow(1 - val / 5, 3);
      const xTos = validItems.map((el) =>
        gsap.quickTo(el, "x", { duration: 0.5, ease: "back.out(1.4)" })
      );

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top 55%",
        end: "bottom 45%",
        onUpdate: (self) => {
          const centerIndex = self.progress * (count - 1 + 2) - 1;
          for (let i = 0; i < count; i++) {
            const dist = Math.abs(i - centerIndex);
            xTos[i]?.(pushMath(dist));
          }
        },
        onLeave: () => {
          for (const xTo of xTos) xTo(0);
        },
        onLeaveBack: () => {
          for (const xTo of xTos) xTo(0);
        },
      });

      return () => st.kill();
    },
    { dependencies: [pushEffect] }
  );

  useGSAP(
    () => {
      if (!animated || !window.matchMedia("(max-width: 1023px)").matches) return;

      const container = containerRef.current;
      if (!container) return;

      const validItems = itemRefs.current.filter((el) => el !== null);

      if (validItems.length !== 0) {
        gsap.set(validItems, { opacity: 0 });
        gsap.to(validItems, {
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            once: true,
          },
        });
      }
    },
    { dependencies: [animated] }
  );

  if (!items?.length) return null;

  return (
    <div ref={containerRef} className={cx("relative flex w-full flex-col", className)}>
      {animated && (
        <div
          ref={blockRef}
          className="pointer-events-none absolute top-0 z-10 hidden size-8 bg-brand lg:block"
          style={{ left: 0, opacity: 0, scale: 0, transform: "translateY(-50%)" }}
          aria-hidden="true"
        />
      )}
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <ul
            key={item.text}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={cx(
              "list-none py-10 text-body",
              !isFirst && "border-foreground/10 border-t",
              isLast && "pb-0",
              isFirst && "pt-0"
            )}
          >
            <li>{item.text}</li>
          </ul>
        );
      })}
    </div>
  );
}
