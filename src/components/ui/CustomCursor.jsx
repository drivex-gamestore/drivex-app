"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { usePageTransitionContext } from '@providers/PageTransitionProvider';
import { gsap, useGSAP, cx } from '@lib/vendor';


export default function CustomCursor({
  children,
  speed = 0.7,
  ease = "expo.out",
  maxRotation = 35,
  rotationDecay = 0.92,
  velocityMultiplier = 0.5
}) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const rotationRef = useRef(null);
  const textRef = useRef(null);
  const leftStripesRef = useRef(null);
  const rightStripesRef = useRef(null);
  
  const mousePosRef = useRef({ x: 0, y: 0 });
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  
  const currentRotationRef = useRef(0);
  const targetRotationRef = useRef(0);
  
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  
  const isVisibleRef = useRef(false);
  const isHoveringRef = useRef(false);
  const timeoutRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(hover: none)").matches
    );
    setMounted(true);
  }, []);

  const { phase } = usePageTransitionContext();
  const { contextSafe } = useGSAP({ scope: containerRef });

  const moveCursor = useCallback((x, y, immediate = false) => {
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        x: x,
        y: y,
        force3D: true,
        overwrite: true,
        ease: ease,
        duration: immediate ? 0 : speed
      });
    }
  }, [ease, speed]);

  const showCursor = useCallback(() => {
    if (!isVisibleRef.current) {
      isVisibleRef.current = true;
      setIsVisible(true);
    }
  }, []);

  const hideCursor = useCallback(() => {
    if (isVisibleRef.current) {
      isVisibleRef.current = false;
      setIsVisible(false);
    }
  }, []);

  const generateStripes = (count) => {
    return count <= 0 
      ? "" 
      : Array.from({ length: count }, () => '<div class="h-full w-[6px] bg-brand"></div>').join("");
  };

  const handleEnterText = contextSafe((text, bgColor, textColor, stripesLeft = 0, stripesRight = 0) => {
    if (textRef.current) {
      gsap.killTweensOf(textRef.current);
      if (leftStripesRef.current) gsap.killTweensOf(leftStripesRef.current);
      if (rightStripesRef.current) gsap.killTweensOf(rightStripesRef.current);

      textRef.current.innerHTML = text;
      isHoveringRef.current = true;
      textRef.current.style.backgroundColor = bgColor || "";
      textRef.current.style.color = textColor || "";

      if (leftStripesRef.current) {
        leftStripesRef.current.innerHTML = generateStripes(stripesLeft);
        gsap.fromTo(
          leftStripesRef.current,
          { scale: 0 },
          { scale: 1, duration: 0.35, ease: "back.out(1.7)", force3D: true }
        );
      }

      if (rightStripesRef.current) {
        rightStripesRef.current.innerHTML = generateStripes(stripesRight);
        gsap.fromTo(
          rightStripesRef.current,
          { scale: 0 },
          { scale: 1, duration: 0.35, ease: "back.out(1.7)", force3D: true }
        );
      }

      gsap.fromTo(
        textRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.35, ease: "back.out(1.7)", force3D: true }
      );
    }
  });

  const handleLeaveText = contextSafe(() => {
    if (textRef.current) {
      gsap.killTweensOf(textRef.current);
      if (leftStripesRef.current) gsap.killTweensOf(leftStripesRef.current);
      if (rightStripesRef.current) gsap.killTweensOf(rightStripesRef.current);

      isHoveringRef.current = false;

      if (leftStripesRef.current) {
        gsap.to(leftStripesRef.current, {
          scale: 0,
          duration: 0.25,
          ease: "power2.inOut",
          force3D: true,
          onComplete: () => {
            if (leftStripesRef.current) {
              leftStripesRef.current.innerHTML = "";
            }
          }
        });
      }

      if (rightStripesRef.current) {
        gsap.to(rightStripesRef.current, {
          scale: 0,
          duration: 0.25,
          ease: "power2.inOut",
          force3D: true,
          onComplete: () => {
            if (rightStripesRef.current) {
              rightStripesRef.current.innerHTML = "";
            }
          }
        });
      }

      gsap.to(textRef.current, {
        scale: 0,
        duration: 0.25,
        ease: "power2.inOut",
        force3D: true,
        onComplete: () => {
          if (!isHoveringRef.current && textRef.current) {
            textRef.current.innerHTML = "";
            textRef.current.style.backgroundColor = "";
            textRef.current.style.color = "";
          }
        }
      });
    }
  });

  useEffect(() => {
    if (phase === "entering" || phase === "holding") {
      handleLeaveText();
    }
  }, [phase, handleLeaveText]);

  useGSAP(() => {
    if (
      isTouchDevice || 
      window.matchMedia("(prefers-reduced-motion: reduce)").matches || 
      !cursorRef.current || 
      !textRef.current || 
      !containerRef.current || 
      phase !== "idle"
    ) {
      return;
    }

    gsap.set(textRef.current, { scale: 0, force3D: true });
    moveCursor(-window.innerWidth, -window.innerHeight, true);

    const elements = containerRef.current.querySelectorAll("[data-cursor-text]");
    const cleanupItems = [];

    elements.forEach(element => {
      const text = element.getAttribute("data-cursor-text");
      if (!text) return;

      const handleEnter = () => {
        handleEnterText(
          text,
          element.getAttribute("data-cursor-bg"),
          element.getAttribute("data-cursor-color"),
          Number.parseInt(element.getAttribute("data-cursor-stripes-left") ?? "0", 10) || 0,
          Number.parseInt(element.getAttribute("data-cursor-stripes-right") ?? "0", 10) || 0
        );
      };

      const handleLeave = () => {
        handleLeaveText();
      };

      element.addEventListener("mouseenter", handleEnter);
      element.addEventListener("mouseleave", handleLeave);
      cleanupItems.push({ element, handleEnter, handleLeave });
    });

    const handleMouseMove = (e) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
      moveCursor(mousePosRef.current.x, mousePosRef.current.y);
      showCursor();
    };

    const handleMouseEnter = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      showCursor();
    };

    const handleMouseLeave = () => {
      timeoutRef.current = setTimeout(() => {
        hideCursor();
      }, 300);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    const rafLoop = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const dx = mousePosRef.current.x - prevMousePosRef.current.x;
      if (deltaTime > 0) {
        velocityRef.current.x = 0.7 * velocityRef.current.x + 0.3 * dx;
      }

      prevMousePosRef.current.x = mousePosRef.current.x;
      prevMousePosRef.current.y = mousePosRef.current.y;

      targetRotationRef.current = Math.max(-maxRotation, Math.min(maxRotation, velocityRef.current.x * velocityMultiplier));

      if (isHoveringRef.current) {
        currentRotationRef.current += (targetRotationRef.current - currentRotationRef.current) * 0.2;
      } else {
        currentRotationRef.current *= rotationDecay;
      }

      if (rotationRef.current) {
        gsap.set(rotationRef.current, { rotation: currentRotationRef.current, force3D: true });
      }

      rafRef.current = requestAnimationFrame(rafLoop);
    };

    rafRef.current = requestAnimationFrame(rafLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      
      for (const { element, handleEnter, handleLeave } of cleanupItems) {
        element.removeEventListener("mouseenter", handleEnter);
        element.removeEventListener("mouseleave", handleLeave);
      }
      
      if (cursorRef.current) gsap.killTweensOf(cursorRef.current);
      if (rotationRef.current) gsap.killTweensOf(rotationRef.current);
      if (textRef.current) gsap.killTweensOf(textRef.current);
    };
  }, { scope: containerRef, dependencies: [isTouchDevice, speed, ease, maxRotation, rotationDecay, velocityMultiplier, phase] });

  const portalContent = mounted && !isTouchDevice && createPortal(
    <div
      ref={cursorRef}
      className={cx(
        "pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform",
        "opacity-0 transition-opacity duration-300 ease-out-expo",
        isVisible && "opacity-100"
      )}
    >
      <div
        ref={rotationRef}
        className="pointer-events-none absolute top-[-32px] left-0 flex origin-bottom -translate-x-1/2 -translate-y-full items-stretch gap-[2px]"
      >
        <div ref={leftStripesRef} className="flex items-stretch gap-[2px]" />
        <div
          ref={textRef}
          className="whitespace-nowrap bg-brand px-8 py-4 text-center text-accent-sm text-black"
        />
        <div ref={rightStripesRef} className="flex items-stretch gap-[2px]" />
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div ref={containerRef} data-custom-cursor={true}>
        {children}
      </div>
      {portalContent}
    </>
  );
}

export { CustomCursor };
