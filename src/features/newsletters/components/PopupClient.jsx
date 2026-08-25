'use client'

import React, { useState, useRef, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { trackPopupShown, trackPopupClosed, trackPopupClicked } from '@lib/analytics/utils/posthog'
import { easings } from '@shared/utils/easings'
import { SanityMedia } from '@lib/sanity/components/SanityMedia'

const DISMISSED_KEY = "promotional-popup-dismissed";

function PopupContent({ data }) {
  return (
    <Fragment>
      {data.media && (
        <div className="aspect-video w-full overflow-hidden">
          <SanityMedia
            media={data.media}
            className="size-full object-cover"
            autoPlay="in-view"
            loop={true}
            imageProps={{ sizes: "360px" }}
          />
        </div>
      )}
      <div className="p-16">
        {data.label && (
          <p className="mb-4 text-accent-sm text-foreground/70 uppercase">
            {data.label}
          </p>
        )}
        {data.title && (
          <h3 className="text-h5">{data.title}</h3>
        )}
        {data.subheadline && (
          <p className="mt-4 text-body text-foreground/70">
            {data.subheadline}
          </p>
        )}
      </div>
    </Fragment>
  );
}


export function PopupClient({ data }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hasScrolledRef = useRef(false);

  const scrollThreshold = data.scrollThreshold ?? 10;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || (!data.showOnEveryVisit && sessionStorage.getItem(DISMISSED_KEY) === data._id)) {
      return;
    }

    const handleScroll = () => {
      if (hasScrolledRef.current) return;
      
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollableHeight <= 0 || (window.scrollY / scrollableHeight) * 100 >= scrollThreshold) {
        hasScrolledRef.current = true;
        window.removeEventListener('scroll', handleScroll);
        setIsVisible(true);
        trackPopupShown({ popup_id: data._id, title: data.title ?? undefined });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted, scrollThreshold, data._id, data.showOnEveryVisit, data.title]);


  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
    trackPopupClosed({ popup_id: data._id });
    if (!data.showOnEveryVisit) {
      sessionStorage.setItem(DISMISSED_KEY, data._id);
    }
  };

  const handleClick = () => {
    setIsVisible(false);
    trackPopupClicked({
      popup_id: data._id,
      title: data.title ?? undefined,
      destination: data.link?.href ?? undefined
    });
    if (!data.showOnEveryVisit) {
      sessionStorage.setItem(DISMISSED_KEY, data._id);
    }
  };

  if (!isMounted) return null;

  const motionAnimate = isVisible 
    ? { opacity: 1, y: 0, pointerEvents: "auto" } 
    : { opacity: 0, y: "100%", pointerEvents: "none" };

  const closeIcon = (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );

  const popupContentWrap = data.link?.href ? (
    <Link 
      href={data.link.href} 
      target={data.link.openInNewTab ? "_blank" : undefined} 
      rel={data.link.openInNewTab ? "noopener noreferrer" : undefined} 
      onClick={handleClick} 
      className="block"
    >
      <PopupContent data={data} />
    </Link>
  ) : (
    <PopupContent data={data} />
  );

  const portalContent = (
    <motion.div
      data-theme="brand"
      className="fixed inset-x-16 bottom-16 z-[9996] bg-background text-foreground sm:inset-x-auto sm:right-24 sm:bottom-24 sm:w-[360px]"
      initial={false}
      animate={motionAnimate}
      transition={{ duration: 0.7, ease: easings.power3Out }}
    >
      <motion.button
        type="button"
        onClick={handleClose}
        aria-label="Close popup"
        className="absolute top-12 right-12 z-10 flex size-32 cursor-pointer items-center justify-center border-none bg-foreground text-background"
        whileHover={{ scale: 0.9 }}
        transition={{ duration: 0.3, ease: easings.power2Out }}
      >
        {closeIcon}
      </motion.button>
      
      {popupContentWrap}
    </motion.div>
  );

  return createPortal(portalContent, document.body);
}