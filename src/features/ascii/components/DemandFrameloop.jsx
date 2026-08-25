"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";


export function DemandFrameloop({ frameloop }) {
  const invalidate = useThree((state) => state.invalidate);
  const hasScheduled = useRef(false);

  useEffect(() => {
    if (frameloop !== "demand" || hasScheduled.current) return;
    hasScheduled.current = true;

    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => invalidate());
      return () => cancelIdleCallback(id);
    }

    const id = setTimeout(() => invalidate(), 0);
    return () => clearTimeout(id);
  }, [frameloop, invalidate]);

  return null;
}
