"use client";

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const PreloaderContext = createContext(null);

const defaultContextValue = {
  phase: "hidden",
  setPhase: () => {},
  isInitialLoad: false
};

export default function PreloaderProvider({ children }) {
  const [phase, setPhase] = useState("loading");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (phase === "revealing") {
      const timer = setTimeout(() => {
        setPhase("hidden");
        setIsInitialLoad(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const contextValue = useMemo(() => ({
    phase,
    setPhase,
    isInitialLoad
  }), [phase, isInitialLoad]);

  return (
    <PreloaderContext.Provider value={contextValue}>
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader() {
  return useContext(PreloaderContext) ?? defaultContextValue;
}
