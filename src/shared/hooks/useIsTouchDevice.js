"use client";

import { useState } from 'react';
import { useIsoLayoutEffect } from '@shared/hooks/useIsoLayoutEffect';
import { screens } from '@shared/constants/screens';

function useMediaQuery(query, initializeWithValue) {
  const [matches, setMatches] = useState(initializeWithValue !== undefined ? initializeWithValue : false);
  const [ready, setReady] = useState(false);

  useIsoLayoutEffect(() => {
    let isActive = true;
    
    const parsedQuery = query.substring(query.indexOf("(")).trim();
    const mediaQueryList = window.matchMedia(parsedQuery);
    const handleChange = () => {
      if (isActive) {
        setMatches(mediaQueryList.matches);
      }
    };
    
    mediaQueryList.addEventListener("change", handleChange);
    handleChange(); 
    setReady(true);
    
    return () => {
      isActive = false;
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return { matches, ready };
}

export function useBreakpoint(breakpoint, options) {
  const initializeWithValue = options?.initializeWithValue ?? false;
  const { matches } = useMediaQuery(`(min-width: ${screens[breakpoint]})`, initializeWithValue);
  
  return matches;
}

export function useIsTouchDevice(options) {
  const initializeWithValue = options?.initializeWithValue ?? false;
  const { matches } = useMediaQuery("(pointer: coarse)", initializeWithValue);
  
  return matches;
}
