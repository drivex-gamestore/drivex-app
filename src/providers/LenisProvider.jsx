"use client";

import React, { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';

export { useLenis };


let globalLenisInstance = null;
let isCssScrollLocked = false;

export function getLenis() {
  return globalLenisInstance;
}

export function setCssScrollLocked(isLocked) {
  if (isLocked !== isCssScrollLocked) {
    isCssScrollLocked = isLocked;
    if (isLocked) {
      document.documentElement.classList.add("scroll-locked");
    } else {
      document.documentElement.classList.remove("scroll-locked");
    }
  }
}

export function getCssScrollLocked() {
  return isCssScrollLocked;
}

export function scrollToTop(immediate = true) {
  const lenis = globalLenisInstance;
  if (lenis) {
    lenis.scrollTo(0, { immediate });
  } else {
    window.scrollTo(0, 0);
  }
}


function LenisTracker() {
  const lenis = useLenis();

  useEffect(() => {
    globalLenisInstance = lenis ?? null;
    
    return () => {
      globalLenisInstance = null;
    };
  }, [lenis]);

  return null;
}

function customEasing(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

export function Lenis(props) {
  return (
    <ReactLenis
      root={true}
      options={{
        anchors: {
          duration: 1.2,
          easing: customEasing
        }
      }}
      {...props}
    >
      <LenisTracker />
      {props.children}
    </ReactLenis>
  );
}

export { Lenis as LenisProvider };
