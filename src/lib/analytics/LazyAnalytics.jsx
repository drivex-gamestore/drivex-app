import React from 'react';
import dynamic from 'next/dynamic';

const PostHogProvider = dynamic(
  () => import('@providers/PostHogProvider').then((mod) => mod.PostHogProvider),
  { ssr: false }
);

const PostHogPageView = dynamic(
  () => import('@providers/PostHogProvider').then((mod) => mod.PostHogPageView),
  { ssr: false }
);

export function LazyAnalytics({ children }) {
  return (
    <PostHogProvider>
      <PostHogPageView />
      {children}
    </PostHogProvider>
  );
}