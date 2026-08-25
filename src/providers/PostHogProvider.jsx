"use client";

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { env } from 'env';


let posthogInstance = null;
let posthogImportPromise = null;
let isInitialized = false;

export async function initPostHog(options) {
  const key = options?.key ?? env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = options?.host ?? env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) return null;
  if (isInitialized) return posthogInstance;

  const instance = await (posthogInstance
    ? Promise.resolve(posthogInstance)
    : (!posthogImportPromise && (posthogImportPromise = import('posthog-js').then(mod => posthogInstance = mod.default)), posthogImportPromise));

  if (instance) {
    instance.init(key, {
      api_host: host,
      defaults: "2026-01-30",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "memory",
      disable_session_recording: true,
      disable_surveys: true,
      capture_dead_clicks: false,
      capture_heatmaps: false,
      autocapture: false
    });
    isInitialized = true;
    return instance;
  }
  return null;
}

export async function captureEvent(eventName, properties) {
  const instance = await initPostHog();
  if (instance) {
    instance.capture(eventName, properties);
  }
}

export function PostHogProvider({ children }) {
  useEffect(() => {
    const reqIdle = globalThis.requestIdleCallback;
    if (reqIdle) {
      const timer = reqIdle(() => initPostHog(), { timeout: 1500 });
      return () => globalThis.cancelIdleCallback?.(timer);
    }
    const timer = globalThis.setTimeout(() => initPostHog(), 800);
    return () => globalThis.clearTimeout(timer);
  }, []);

  return <>{children}</>;
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    
    let url = window.origin + pathname;
    if (searchParams.toString()) {
      url = `${url}?${searchParams.toString()}`;
    }
    
    captureEvent("$pageview", {
      $current_url: url
    });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
