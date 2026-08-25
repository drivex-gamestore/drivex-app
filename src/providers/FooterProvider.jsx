"use client";

import { createContext, useState, use, useEffect } from 'react';

const FooterVisibilityContext = createContext(true);
const FooterSetterContext = createContext(() => {});

export function FooterVisibilityProvider({ children }) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <FooterVisibilityContext.Provider value={isVisible}>
      <FooterSetterContext.Provider value={setIsVisible}>
        {children}
      </FooterSetterContext.Provider>
    </FooterVisibilityContext.Provider>
  );
}

export function FooterSlot({ children }) {
  const isVisible = use(FooterVisibilityContext);
  
  return isVisible ? children : null;
}

export function useHideFooter() {
  const setIsVisible = use(FooterSetterContext);

  useEffect(() => {
    setIsVisible(false);
    
    return () => setIsVisible(true);
  }, [setIsVisible]);
}
