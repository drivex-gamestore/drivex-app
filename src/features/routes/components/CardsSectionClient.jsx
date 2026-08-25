"use client";
import React, { useRef, useState, useEffect, createRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { easings } from '@shared/utils/easings';
import { RollerNumber } from '@animations/components/RollerNumber';
import { ScrambleText } from '@animations/components/ScrambleText';
import { SanityMedia } from '@lib/sanity/components/SanityMedia';
import { useIdleGSAP } from '@shared/hooks/useIdleGSAP';

const THEMES = ["light", "dark", "brand"];

gsap.registerPlugin(ScrollTrigger);

const easePower3Out = easings.power3Out;
const easeBackOut = easings.backOut;

const TYPOGRAPHY_CLASSES = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  h5: "text-h5",
  h6: "text-h6"
};

function getValidTheme(theme) {
  if (theme) {
    return THEMES.includes(theme) ? theme : undefined;
  }
}

function parseHeadlineNumber(text) {
  if (!text) return null;
  const match = text.trim().match(/^([€$£¥₹]?[+]?)(\d+)([MBKx%+]*)$/i);
  if (!match) return null;
  const [, prefix = "", numberStr = "", suffix = ""] = match;
  return {
    prefix,
    number: Number.parseInt(numberStr, 10),
    suffix
  };
}

function handleScrollRefresh() {
  ScrollTrigger.refresh();
}

export default function CardsSectionClient({ cards, fullHeight }) {
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const rollerTriggerRefs = useMemo(() => cards.map(() => createRef()), [cards]);

  const scrambleFns = useRef([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.matchMedia("(max-width: 1023px)").matches);
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useIdleGSAP(() => {
    const validRefs = cardRefs.current.filter(Boolean);
    if (validRefs.length !== 0) {
      gsap.fromTo(
        validRefs,
        { yPercent: 25, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            once: true
          },
          onComplete: handleScrollRefresh
        }
      );
    }
  }, { scope: sectionRef });

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const maxCols = Math.min(cards.length, 4);
  const gridColsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };
  const gridClass = gridColsMap[maxCols];

  return (
    <div
      ref={sectionRef}
      className={`relative grid gap-16 ${gridClass} ${fullHeight ? "h-full" : ""}`}
      onMouseLeave={handleMouseLeave}
    >
      {cards.map((card, index) => {
        if (card._type === "textCard" && card.headline?.text) {
          const isHovered = hoveredIndex === index;
          const parsedHeadline = parseHeadlineNumber(card.headline.text);

          return (
            <div
              key={card._key}
              ref={(element) => {
                cardRefs.current[index] = element;
                const triggerRef = rollerTriggerRefs[index];
                if (triggerRef) {
                  triggerRef.current = element;
                }
              }}
              data-theme={getValidTheme(card.cardTheme)}
              className="flex min-h-[250px] cursor-default flex-col justify-between bg-background-muted p-16 lg:min-h-[450px] lg:p-32"
              onMouseEnter={() => {
                setHoveredIndex(index);
                scrambleFns.current[index]?.();
              }}
            >
              <span className={`flex items-center font-light text-foreground ${TYPOGRAPHY_CLASSES[card.headlineDisplay ?? "h3"]}`}>
                {parsedHeadline ? (
                  <>
                    {parsedHeadline.prefix}
                    <RollerNumber
                      value={parsedHeadline.number}
                      minDigits={parsedHeadline.number.toString().length}
                      triggerMode="scroll"
                      triggerElement={rollerTriggerRefs[index]}
                      duration={2}
                      stagger={0.1}
                      suffix={parsedHeadline.suffix}
                    />
                  </>
                ) : (
                  card.headline.text
                )}
              </span>
              
              {card.text && (
                card.plainText ? (
                  <p className="text-body text-foreground-muted">{card.text}</p>
                ) : (
                  <span className="relative flex items-center overflow-hidden text-accent text-foreground">
                    {!isMobile && (
                      <motion.span
                        className="absolute top-0 bottom-0 left-0 my-auto size-12 bg-brand"
                        initial={false}
                        animate={{ rotate: isHovered ? 0 : -90, scale: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.5, ease: easeBackOut }}
                        aria-hidden="true"
                      />
                    )}
                    <motion.span
                      animate={isMobile ? {} : { x: isHovered ? 24 : 0 }}
                      transition={{ duration: 0.5, ease: easePower3Out }}
                    >
                      <ScrambleText
                        duration={0.5}
                        multiLine={true}
                        onReady={(fn) => {
                          scrambleFns.current[index] = fn;
                        }}
                      >
                        {card.text}
                      </ScrambleText>
                    </motion.span>
                  </span>
                )
              )}
            </div>
          );
        }

        if (card._type === "mediaCard" && card.media) {
          return (
            <div
              key={card._key}
              ref={(element) => {
                cardRefs.current[index] = element;
              }}
              className="min-h-[300px] overflow-hidden lg:min-h-[450px]"
            >
              <SanityMedia
                media={card.media}
                className="h-full w-full object-cover"
                imageProps={{ alt: card.alt || "" }}
                autoPlay={true}
                loop={true}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
