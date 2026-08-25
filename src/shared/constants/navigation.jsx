"use client";

import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { usePageTransition } from '@shared/hooks/usePageTransition';

function isModifiedEvent(event) {
  const { nodeName } = event.currentTarget;
  if (nodeName.toUpperCase() === "A") {
    const target = event.currentTarget.getAttribute("target");
    return (
      (!!target && target !== "_self") ||
      !!event.metaKey ||
      !!event.ctrlKey ||
      !!event.shiftKey ||
      !!event.altKey ||
      (!!event.nativeEvent && event.nativeEvent.which === 2)
    );
  }
  return false;
}

function TransitionLink(props) {
  const { href, as, replace, scroll, onClick, ...rest } = props;
  
  const router = useRouter();
  const { startTransition, isTransitioning } = usePageTransition();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    
    if (event.defaultPrevented || isTransitioning || isModifiedEvent(event)) {
      return;
    }
    
    event.preventDefault();
    
    const targetPath = as || href;
    const targetPathStr = typeof targetPath === "string" ? targetPath : targetPath.toString();
    
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (replace) {
        router.replace(targetPathStr, { scroll: scroll ?? true });
      } else {
        router.push(targetPathStr, { scroll: scroll ?? true });
      }
    } else {
      startTransition(() => {
        if (replace) {
          router.replace(targetPathStr, { scroll: scroll ?? true });
        } else {
          router.push(targetPathStr, { scroll: scroll ?? true });
        }
      });
    }
  };

  return (
    <NextLink
      {...rest}
      href={href}
      as={as}
      replace={replace}
      scroll={scroll}
      onClick={handleClick}
    />
  );
}

export function Link(props) {
  return <TransitionLink {...props} />;
}