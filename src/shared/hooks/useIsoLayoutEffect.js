"use client";

import { useLayoutEffect } from 'react';

export function useIsoLayoutEffect(effect, deps) {
  useLayoutEffect(effect, deps);
}