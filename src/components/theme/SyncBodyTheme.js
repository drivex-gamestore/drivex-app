"use client";

import { useEffect } from 'react';
export function SyncBodyTheme() {
  useEffect(() => {
    const syncTheme = () => {
      const firstSection = document.querySelector("[data-page-builder-section][data-theme]");
      if (firstSection) {
        const theme = firstSection.getAttribute("data-theme");
        if (theme) {
          document.body.setAttribute("data-theme", theme);
        }
      }
    };

    syncTheme();

    const observer = new MutationObserver(() => {
      syncTheme();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
