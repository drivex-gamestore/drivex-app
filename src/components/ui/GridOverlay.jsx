"use client";

import React, { useState, useEffect } from 'react';

export function GridOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [animState, setAnimState] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "g") {
        e.preventDefault();
        setIsOpen((prevIsOpen) => {
          setAnimState(prevIsOpen ? "out" : "in");
          return !prevIsOpen;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (animState !== "out") return;
    
    const timer = setTimeout(() => {
      setAnimState(null);
    }, 1830);
    
    return () => clearTimeout(timer);
  }, [animState]);

  const visibility = isOpen || animState === "out" ? "visible" : "hidden";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{ visibility }}
      aria-hidden="true"
    >
      <div className="grid-container h-full">
        <div className="grid-layout h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`col-${i}`}
              className="h-full origin-top bg-brand/10"
              style={{
                transform: isOpen ? "scaleY(1)" : "scaleY(0)",
                transitionProperty: "transform",
                transitionDuration: "1500ms",
                transitionTimingFunction: "var(--ease-power3-in-out)",
                transitionDelay: `${30 * i}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

