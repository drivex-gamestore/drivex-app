"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { NewsletterForm } from '@features/newsletters/NewsletterForm';
import { trackPopupShown, trackPopupClosed } from '@lib/analytics/utils/posthog';

import { easings } from '@shared/utils/easings';

const DISMISSED_KEY = "newsletter-popup-dismissed";

export function NewsletterPopupClient({ data }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const delaySeconds = data?.delaySeconds ?? 5;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!data || !isMounted || sessionStorage.getItem(DISMISSED_KEY) === data._id) {
      return;
    }

    let timeoutId = setTimeout(() => {
      setIsVisible(true);
      trackPopupShown({ 
        popup_id: data._id, 
        title: data.headline ?? undefined 
      });
    }, 1000 * delaySeconds);

    return () => clearTimeout(timeoutId);
  }, [isMounted, delaySeconds, data?._id, data?.headline]);

  const handleClose = () => {
    setIsVisible(false);
    trackPopupClosed({ popup_id: data?._id });
    if (data?._id) sessionStorage.setItem(DISMISSED_KEY, data._id);
  };

  if (!isMounted || !data) return null;

  const popupState = isVisible
    ? { opacity: 1, y: 0, pointerEvents: "auto" }
    : { opacity: 0, y: "100%", pointerEvents: "none" };

  const popupContent = (
    <motion.div
      data-theme="dark"
      className="fixed inset-x-16 bottom-16 z-[9996] bg-background text-foreground sm:inset-x-auto sm:right-24 sm:bottom-24 sm:w-[360px]"
      initial={false}
      animate={popupState}
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
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M15 5L5 15M5 5L15 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </motion.button>
      <div className="p-16">
        <NewsletterForm
          heading={data.headline ?? undefined}
          description={data.description ?? undefined}
          buttonText={data.buttonText ?? undefined}
          successMessage={data.successMessage ?? undefined}
          buttonTheme="light"
        />
      </div>
    </motion.div>
  );

  return createPortal(popupContent, document.body);
}

