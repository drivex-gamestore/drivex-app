'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export function useSpamPrevention({
  honeypotField = "website",
  honeypotDuration = 2000,
  formRef,
  debug = false
} = {}) {
  const startTimeRef = useRef(Date.now());
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (debug) console.log("[Spam Prevention] User interaction detected");
      setHasInteracted(true);
    };

    const eventTypes = ["keydown", "mousemove", "touchstart", "click"];
    const targetElement = formRef?.current ?? document;

    if (debug) {
      console.log("[Spam Prevention] Initialized", {
        honeypotField,
        honeypotDuration,
        target: formRef?.current ? "form" : "document"
      });
    }

    for (const eventType of eventTypes) {
      targetElement.addEventListener(eventType, handleInteraction, { once: true });
    }

    return () => {
      for (const eventType of eventTypes) {
        targetElement.removeEventListener(eventType, handleInteraction);
      }
    };
  }, [formRef, debug, honeypotField, honeypotDuration]);

  const checkSpam = useCallback((formElement) => {
    const fillTime = Date.now() - startTimeRef.current;
    const isTooFast = fillTime < honeypotDuration;
    const honeypotInput = formElement.querySelector(`[name="${honeypotField}"]`);
    const hasHoneypotValue = !!honeypotInput?.value?.trim();
    const noInteraction = !hasInteracted;

    if (debug) {
      console.log("[Spam Prevention] Spam check:", {
        fillTime: `${fillTime}ms`,
        isTooFast,
        hasHoneypotValue,
        honeypotValue: honeypotInput?.value || "(empty)",
        noInteraction
      });
    }

    if (hasHoneypotValue) {
      return { 
        isSpam: true, 
        reason: "honeypot_filled", 
        message: "Invalid submission detected. Please refresh the page and try again." 
      };
    } else if (isTooFast) {
      return { 
        isSpam: true, 
        reason: "too_fast", 
        message: "Please take your time filling out the form. Form submissions are processed after a brief delay." 
      };
    } else if (noInteraction) {
      return { 
        isSpam: true, 
        reason: "no_interaction", 
        message: "Please interact with the form fields before submitting. Click or type in the fields to continue." 
      };
    } else {
      return { isSpam: false };
    }
  }, [honeypotField, honeypotDuration, hasInteracted, debug]);

  const getMetadata = useCallback(() => ({
    hasInteraction: hasInteracted,
    fillTime: Date.now() - startTimeRef.current,
    startTime: startTimeRef.current
  }), [hasInteracted]);

  const enhanceFormData = useCallback((formData) => {
    const submissionTime = Date.now() - startTimeRef.current;
    formData.append("_submissionTime", String(submissionTime));
    if (debug) console.log("[Spam Prevention] Enhanced form data with submission time:", `${submissionTime}ms`);
    return formData;
  }, [debug]);

  const reset = useCallback(() => {
    startTimeRef.current = Date.now();
    setHasInteracted(false);

    const handleInteraction = () => {
      if (debug) console.log("[Spam Prevention] User interaction detected");
      setHasInteracted(true);
    };

    const targetElement = formRef?.current ?? document;
    
    for (const eventType of ["keydown", "mousemove", "touchstart", "click"]) {
      targetElement.addEventListener(eventType, handleInteraction, { once: true });
    }
    
    if (debug) console.log("[Spam Prevention] Reset - timing and interaction tracking restarted");
  }, [formRef, debug]);

  return {
    checkSpam,
    getMetadata,
    enhanceFormData,
    reset
  };
}
