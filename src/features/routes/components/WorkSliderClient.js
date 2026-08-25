import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  forwardRef,
  Fragment
} from "react";
import {
  LayoutGroupContext,
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
  frame,
  useIsomorphicLayoutEffect,
  useMotionValueEvent  
} from "framer-motion";

import { 
   gsap, 
   useGSAP,
   Draggable,
   InertiaPlugin 
} from "@lib/vendor";

import Link from "next/link";
import { cva, cx } from "@lib/vendor"; 

import { easings } from "@shared/utils/easings";
import { ScrambleText } from "@animations/components/ScrambleText";
import { ScrambleGroup } from '@shared/contexts/ScrambleContext';
import { SanityMedia } from "@lib/sanity/components/SanityMedia";
import { SanityImage } from "@lib/sanity/components/SanityImage";

const ForceRenderContext = createContext(null);

const markLayoutClean = (e) => !e.isLayoutDirty && e.willUpdate(false);

const ForceRenderLayoutGroup = ({ children, id, inherit = true }) => {
  const layoutGroupContext = useContext(LayoutGroupContext);
  const forceRenderContext = useContext(ForceRenderContext);

  const [forceRender, renderCount] = (function () {
    const isMounted = useRef(false);
    useIsomorphicLayoutEffect(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []);
    const [count, setCount] = useState(0);
    const increment = useCallback(() => {
      if (isMounted.current) setCount(count + 1);
    }, [count]);
    return [
      useCallback(() => frame.postRender(increment), [increment]),
      count
    ];
  })();

  const groupRef = useRef(null);
  const currentId = layoutGroupContext.id || forceRenderContext;

  if (groupRef.current === null) {
    let groupSet, nodeMap, dirtyFn, shouldInherit;
    if (inherit === true || inherit === "id") {
      if (currentId) {
        id = id ? currentId + "-" + id : currentId;
      }
    }
    groupRef.current = {
      id: id,
      group:
        (inherit === true && layoutGroupContext.group) ||
        ((groupSet = new Set()),
        (nodeMap = new WeakMap()),
        {
          add: (node) => {
            groupSet.add(node);
            nodeMap.set(node, node.addEventListener("willUpdate", dirtyFn));
          },
          remove: (node) => {
            groupSet.delete(node);
            const removeListener = nodeMap.get(node);
            if (removeListener) {
              removeListener();
              nodeMap.delete(node);
            }
            dirtyFn();
          },
          dirty: (dirtyFn = () => groupSet.forEach(markLayoutClean))
        })
    };
  }

  const contextValue = useMemo(
    () => ({ ...groupRef.current, forceRender: forceRender }),
    [forceRender]
  );

  return (
    <LayoutGroupContext.Provider value={contextValue}>
      {children}
    </LayoutGroupContext.Provider>
  );
};

const filterButtonStyles = cva({
  base: [
    "group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap",
    "text-accent-sm",
    "outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
  ],
  variants: {
    size: {
      sm: "text-body-sm",
      default: "text-body-sm lg:text-body",
      lg: "text-body lg:text-body-lg"
    }
  },
  defaultVariants: {
    size: "default"
  }
});

const filterIconStyles = cva({
  base: [
    "flex items-center justify-center",
    "transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]"
  ],
  variants: {
    size: {
      sm: "size-32 lg:size-40",
      default: "size-40 lg:size-48",
      lg: "size-48 lg:size-56"
    },
    position: {
      left: "origin-left -rotate-45 scale-0",
      right: "absolute right-0 z-10 origin-right rotate-0 scale-100"
    },
    theme: {
      light: "bg-foreground text-background",
      dark: "bg-foreground text-background",
      brand: "bg-brand text-black"
    }
  },
  defaultVariants: {
    size: "default",
    theme: "light"
  }
});

const filterContentStyles = cva({
  base: [
    "flex w-full flex-1 items-center justify-center gap-8",
    "transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]"
  ],
  variants: {
    size: {
      sm: "h-32 -translate-x-[calc(32px+6px)] px-8 lg:h-40 lg:-translate-x-[calc(40px+6px)] lg:px-12",
      default:
        "h-40 -translate-x-[calc(40px+6px)] px-12 lg:h-48 lg:-translate-x-[calc(48px+6px)] lg:px-16",
      lg: "h-48 -translate-x-[calc(48px+6px)] px-16 lg:h-56 lg:-translate-x-[calc(56px+6px)] lg:px-24"
    },
    theme: {
      light: "bg-foreground text-background",
      dark: "bg-foreground text-background",
      brand: "bg-brand text-black"
    }
  },
  defaultVariants: {
    size: "default",
    theme: "light"
  }
});

function ArrowIcon({ className }) {
  return (
    <svg
      className={cx("size-[0.75em]", className)}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function WorkSliderFilter({
  label,
  options,
  value,
  onChange,
  className,
  size = "default",
  theme = "light"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleMouseDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useGSAP(
    () => {
      if (dropdownRef.current) {
        gsap.killTweensOf(dropdownRef.current);
        if (isOpen) {
          gsap.set(dropdownRef.current, { visibility: "visible" });
          gsap.fromTo(
            dropdownRef.current,
            { opacity: 0, scale: 0.95, y: -8 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.35,
              ease: "back.out(1.7)"
            }
          );
        } else {
          gsap.to(dropdownRef.current, {
            opacity: 0,
            scale: 0.95,
            y: -8,
            duration: 0.21,
            ease: "power2.out",
            onComplete: () => {
              if (dropdownRef.current) {
                gsap.set(dropdownRef.current, { visibility: "hidden" });
              }
            }
          });
        }
      }
    },
    { scope: containerRef, dependencies: [isOpen] }
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleOptionKeyDown = (e, val) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(val);
    }
  };

  const extendedOptions = [null, ...options];
  const activeLabel = value ?? (label === undefined ? "FILTER" : label);

  return (
    <div ref={containerRef} className={cx("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={cx(filterButtonStyles({ size }), isOpen && "group")}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-open={isOpen}
      >
        <span className="relative flex w-full items-center gap-6">
          <span
            className={cx(
              filterIconStyles({ size, theme, position: "left" }),
              isOpen && "rotate-0 scale-100"
            )}
          >
            <ArrowIcon className="rotate-180" />
          </span>
          <span
            className={cx(
              filterContentStyles({ size, theme }),
              isOpen && "translate-x-0"
            )}
          >
            {value && <span className="size-8 bg-brand" />}
            <span className="text-accent-sm">{activeLabel}</span>
          </span>
          <span
            className={cx(
              filterIconStyles({ size, theme, position: "right" }),
              isOpen && "-rotate-45 scale-0"
            )}
          >
            <ArrowIcon />
          </span>
        </span>
      </button>
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 z-50 mt-8 min-w-200 origin-top-left bg-background md:min-w-0"
        style={{ visibility: "hidden", opacity: 0 }}
        role="listbox"
        tabIndex={-1}
        data-theme="dark"
      >
        <div className="py-8">
          {extendedOptions.map((opt) => {
            const isSelected = opt === value;
            const displayLabel = opt ?? "All";
            return (
              <div
                key={opt ?? "all"}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onKeyDown={(e) => handleOptionKeyDown(e, opt)}
                onClick={() => handleSelect(opt)}
                className={cx(
                  "flex cursor-pointer items-center gap-8 px-16 py-8 transition-colors hover:bg-surface",
                  isSelected && "text-brand"
                )}
              >
                {isSelected && <span className="size-8 bg-brand" />}
                <span className="text-accent-sm">[{displayLabel}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };

function WorkSliderCard({ _id, title, uri, tags, mainImage, className }) {
  const hoverRef = useRef(null);
  const href = uri ?? "#";

  return (
    <motion.div
      layoutId={_id}
      layout={true}
      transition={{ layout: { type: "spring", ...springConfig } }}
      className={className}
    >
      <Link
        href={href}
        className="group block"
        data-cursor-text="VIEW PROJECT"
        onMouseEnter={() => hoverRef.current?.()}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "66.67%" }}
        >
          <div className="absolute inset-0">
            {mainImage && (
              <SanityMedia
                media={mainImage}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                imageProps={{
                  sizes:
                    "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
                  builderOptions: {
                    sourceWidths: [400, 600, 800, 1000, 1200, 1400]
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className="mt-16 flex items-start justify-between gap-16">
          <h3 className="text-accent">
            <ScrambleText
              duration={0.5}
              onReady={(fn) => {
                hoverRef.current = fn;
              }}
            >
              {title}
            </ScrambleText>
          </h3>
          {tags && tags.length > 0 && (
            <div className="flex items-center gap-8 text-body text-foreground-muted">
              {tags.map(renderTag)}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

function renderTag(tag, index) {
  return (
    <Fragment key={tag}>
      {index > 0 && <span className="text-foreground-muted">—</span>}
      <span className="text-accent-sm uppercase">[{tag}]</span>
    </Fragment>
  );
}

function WorkSliderDuoGrid({ items, className }) {
  return (
    <div className={cx("grid-container", className)}>
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <WorkSliderCard key={item._id} {...item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WorkSliderTriGrid({ items, className }) {
  return (
    <div className={cx("grid-container", className)}>
      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <WorkSliderCard key={item._id} {...item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const slideDragEasing = easings?.power4InOut ?? [0.76, 0, 0.24, 1]; 

function ScrambleTitleWrapper({ title, onRegisterScramble }) {
  return (
    <h3 className="text-accent">
      <ScrambleText
        duration={0.5}
        onReady={(fn) => {
          onRegisterScramble(fn);
        }}
      >
        {title}
      </ScrambleText>
    </h3>
  );
}

function WorkSliderSlide({
  item,
  index,
  springX,
  slideWidth,
  wrapWidth,
  centerOffset,
  totalWidth,
  containerWidth,
  onRegisterScramble,
  isDraggingRef,
  hasDraggedRef
}) {
  const hoverRef = useRef(null);

  const loopPosition = useTransform(springX, (x) => {
    let position = index * wrapWidth + x + centerOffset;
    while (position > containerWidth + wrapWidth) position -= totalWidth;
    while (position < -(wrapWidth * 2)) position += totalWidth;
    return position;
  });

  const parallaxOffset = useTransform(
    loopPosition,
    (x) => -(((x + slideWidth / 2 - containerWidth / 2) / containerWidth) * 150)
  );

  const href = item.uri ?? "#";

  return (
    <motion.div
      style={{
        x: loopPosition,
        width: slideWidth,
        position: "absolute",
        left: 0,
        top: 0
      }}
      className="will-change-transform"
    >
      <Link
        href={href}
        className="group block overflow-hidden"
        data-cursor-text="VIEW PROJECT"
        onMouseEnter={() => hoverRef.current?.()}
        onClick={(e) => {
          if (isDraggingRef.current || hasDraggedRef.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        draggable={false}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ paddingBottom: "66.67%" }}
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ x: parallaxOffset, scale: 1.225 }}
          >
            {item.mainImage && (
              <SanityMedia
                media={item.mainImage}
                className="h-full w-full object-cover"
                imageProps={{
                  sizes: "150vw",
                  builderOptions: {
                    sourceWidths: [
                      800, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 3000, 3840
                    ]
                  }
                }}
              />
            )}
          </motion.div>
        </div>
        <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <ScrambleTitleWrapper
            title={item.title}
            onRegisterScramble={(fn) => {
              hoverRef.current = fn;
              onRegisterScramble(index, fn);
            }}
          />
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-8 text-body text-foreground-muted">
              {item.tags.map(renderTag)}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

const WorkSliderEngine = forwardRef(function WorkSliderEngine(
  { items, onIndexChange, className, scrambleKey },
  ref
) {
  const containerRef = useRef(null);
  const proxyRef = useRef(null);
  const draggableRef = useRef(null);
  const startXRef = useRef(0);
  const scrambleFns = useRef(new Map());
  const scrambleTriggered = useRef(false);

  useEffect(() => {
    if (scrambleKey === undefined) return;
    const timeout = setTimeout(() => {
      Array.from(scrambleFns.current.values()).forEach((fn, i) => {
        setTimeout(() => fn(), 80 * i);
      });
      scrambleTriggered.current = true;
    }, 100);
    return () => clearTimeout(timeout);
  }, [scrambleKey]);

  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    slideWidth: 0,
    wrapWidth: 0,
    centerOffset: 0
  });

  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragDistance = useRef(0);
  const itemCount = items.length;
  const dragX = useMotionValue(0);
  const springX = useMotionValue(0);
  const activeIndex = useRef(0);
  const dimensionsRef = useRef(dimensions);

  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  const { extendedItems, cloneOffset } = useMemo(
    () =>
      itemCount === 0
        ? { extendedItems: [], cloneOffset: 0 }
        : {
            extendedItems: [
              ...items.map((item, i) => ({
                ...item,
                _id: `clone-before-${item._id}`,
                originalIndex: i,
                isClone: true
              })),
              ...items.map((item, i) => ({
                ...item,
                originalIndex: i,
                isClone: false
              })),
              ...items.map((item, i) => ({
                ...item,
                _id: `clone-after-${item._id}`,
                originalIndex: i,
                isClone: true
              }))
            ],
            cloneOffset: itemCount
          },
    [items, itemCount]
  );

  const totalWidth = extendedItems.length * dimensions.wrapWidth;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        const width = entry.contentRect.width;
        if (width === 0) return;
        const visibleSlides = window.matchMedia("(max-width: 767px)").matches
          ? 1.1
          : 2;
        const slideWidth =
          (width - 16 * (Math.ceil(visibleSlides) - 1)) / visibleSlides;
        setDimensions({
          containerWidth: width,
          slideWidth: slideWidth,
          wrapWidth: slideWidth + 16,
          centerOffset: (width - slideWidth) / 2
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.wrapWidth === 0) return;
    const initialX = -cloneOffset * dimensions.wrapWidth;
    dragX.set(initialX);
    springX.set(initialX);
    if (proxyRef.current) {
      gsap.set(proxyRef.current, { x: initialX });
    }
  }, [cloneOffset, dimensions.wrapWidth, dragX, springX]);

  const wrapIndex = useCallback(
    (index) => ((index % itemCount) + itemCount) % itemCount,
    [itemCount]
  );

  useMotionValueEvent(springX, "change", (x) => {
    if (dimensions.wrapWidth === 0) return;
    const index = wrapIndex(Math.round(-x / dimensions.wrapWidth));
    if (index !== activeIndex.current) {
      activeIndex.current = index;
      onIndexChange(index);
    }
  });

  const animateToX = useCallback(
    (x) => {
      dragX.set(x);
      animate(springX, x, { duration: 0.8, ease: slideDragEasing });
      if (proxyRef.current) {
        gsap.set(proxyRef.current, { x });
      }
    },
    [dragX, springX]
  );

  const goToNext = useCallback(() => {
    if (isDragging.current || itemCount === 0 || dimensions.wrapWidth === 0)
      return;
    animateToX(dragX.get() - dimensions.wrapWidth);
  }, [itemCount, dimensions.wrapWidth, dragX, animateToX]);

  const goToPrev = useCallback(() => {
    if (isDragging.current || itemCount === 0 || dimensions.wrapWidth === 0)
      return;
    animateToX(dragX.get() + dimensions.wrapWidth);
  }, [itemCount, dimensions.wrapWidth, dragX, animateToX]);

  const goToSlide = useCallback(
    (index) => {
      if (isDragging.current || itemCount === 0 || dimensions.wrapWidth === 0)
        return;
      const targetIndex = ((index % itemCount) + itemCount) % itemCount;
      const currentX = dragX.get();
      const currentIndex = wrapIndex(
        Math.round(-currentX / dimensions.wrapWidth)
      );
      let diff = (targetIndex - currentIndex + itemCount) % itemCount;
      if (diff === 0) diff = itemCount;
      animateToX(currentX - diff * dimensions.wrapWidth);
    },
    [itemCount, wrapIndex, animateToX, dragX, dimensions.wrapWidth]
  );

  useImperativeHandle(
    ref,
    () => ({
      goToSlide,
      goToNext,
      goToPrev
    }),
    [goToSlide, goToNext, goToPrev]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrev();
      else if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  useGSAP(
    () => {
      if (
        !proxyRef.current ||
        !containerRef.current ||
        dimensions.wrapWidth === 0
      )
        return;
      const wrapWidth = dimensions.wrapWidth;
      if (draggableRef.current) {
        draggableRef.current.forEach((d) => d.kill());
        draggableRef.current = null;
      }
      const currentX = dragX.get();
      gsap.set(proxyRef.current, { x: currentX });

      draggableRef.current = Draggable.create(proxyRef.current, {
        type: "x",
        trigger: containerRef.current,
        inertia: true,
        throwResistance: 1500,
        maxDuration: 1,
        minDuration: 0.2,
        overshootTolerance: 0,
        snap: { x: (x) => Math.round(x / wrapWidth) * wrapWidth },
        onPress: () => {
          hasDragged.current = false;
          dragDistance.current = 0;
        },
        onDragStart: function () {
          isDragging.current = true;
          hasDragged.current = false;
          startXRef.current = this.x;
          dragDistance.current = 0;
        },
        onDrag: function () {
          const distance = Math.abs(this.x - startXRef.current);
          dragDistance.current = distance;
          if (distance > 10) {
            hasDragged.current = true;
          }
          dragX.set(this.x);
          springX.set(this.x);
        },
        onThrowUpdate: function () {
          dragX.set(this.x);
          springX.set(this.x);
        },
        onDragEnd: function () {
          if (this.tween === undefined) {
            setTimeout(() => {
              isDragging.current = false;
              setTimeout(() => {
                hasDragged.current = false;
              }, 100);
            }, 10);
          }
        },
        onThrowComplete: function () {
          dragX.set(this.x);
          springX.set(this.x);
          isDragging.current = false;
          setTimeout(() => {
            hasDragged.current = false;
          }, 100);
        }
      });
      if (draggableRef.current[0]) {
        draggableRef.current[0].update();
      }
    },
    { dependencies: [dimensions.wrapWidth], scope: containerRef }
  );

  const registerScramble = useCallback((index, fn) => {
    scrambleFns.current.set(index, fn);
  }, []);

  const showSlides = items.length > 0 && dimensions.containerWidth > 0;

  return (
    <div className={cx("relative", className)}>
      <div
        ref={proxyRef}
        className="pointer-events-none invisible absolute"
        style={{ width: 1, height: 1 }}
      />
      <div
        ref={containerRef}
        className="relative cursor-grab touch-pan-y overflow-x-clip active:cursor-grabbing"
      >
        {showSlides && (
          <Fragment>
            <div
              className="pointer-events-none invisible"
              style={{ width: dimensions.slideWidth }}
            >
              <div
                className="relative w-full"
                style={{ paddingBottom: "66.67%" }}
              />
              <div className="mt-16 h-24" />
            </div>
            {extendedItems.map((item, index) => (
              <WorkSliderSlide
                key={item._id}
                item={item}
                index={index}
                springX={springX}
                slideWidth={dimensions.slideWidth}
                wrapWidth={dimensions.wrapWidth}
                centerOffset={dimensions.centerOffset}
                totalWidth={totalWidth}
                containerWidth={dimensions.containerWidth}
                onRegisterScramble={registerScramble}
                isDraggingRef={isDragging}
                hasDraggedRef={hasDragged}
              />
            ))}
          </Fragment>
        )}
      </div>
    </div>
  );
});

function WorkSliderArrows({ onPrev, onNext, className }) {
  return (
    <div className={cx("flex items-center gap-8", className)}>
      <button
        type="button"
        onClick={onPrev}
        className="flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface"
        aria-label="Previous slide"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface"
        aria-label="Next slide"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </button>
    </div>
  );
}

function WorkSliderList({ items, className }) {
  return (
    <div className={cx("grid-container", className)}>
      <div className="divide-y divide-foreground/10">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <WorkSliderListItem key={item._id} {...item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function WorkSliderListItem(item) {
  return (
    <motion.div
      layoutId={item._id}
      layout={true}
      transition={{ layout: { type: "spring", ...springConfig } }}
    >
      <Link
        href={item.uri ?? "#"}
        className="group flex items-stretch"
        data-cursor-text="VIEW PROJECT"
      >
        <div className="relative aspect-square w-80 shrink-0 overflow-hidden">
          {item.mainImage && (
            <SanityMedia
              media={item.mainImage}
              className="h-full w-full object-cover"
              imageProps={{
                sizes: "80px",
                builderOptions: { sourceWidths: [160, 240] }
              }}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-8 px-16 py-12">
          <h3 className="truncate text-accent">{item.title}</h3>
          {item.tags && item.tags.length > 0 && (
            <div className="xs:flex hidden shrink-0 items-center gap-8 text-body text-foreground-muted">
              {item.tags.map(renderTag)}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

const backInOutSubtle = easings?.backInOutSubtle ?? [0.68, -0.6, 0.32, 1.6]; 

function WorkSliderThumbnails({
  items,
  currentIndex,
  onSelect,
  rotationCount = 0,
  gap = 16,
  className
}) {
  const itemCount = items.length;
  if (itemCount === 0) return null;

  const totalWidth = 80 * itemCount + (itemCount - 1) * gap;
  const itemSlotWidth = 80 + gap;
  const activeX = currentIndex * itemSlotWidth;
  const indicatorX = currentIndex * itemSlotWidth + 40;

  const indicatorOffset = indicatorX - 4;
  const indicatorRotation = 90 * rotationCount;

  return (
    <div className={cx("relative flex flex-col items-center", className)}>
      <div className="relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute top-0 z-10 h-full border border-foreground/30"
          style={{ width: 80 }}
          animate={{ x: activeX }}
          transition={{ duration: 0.8, ease: backInOutSubtle }}
        />
        <div className="flex items-center" style={{ gap }}>
          {items.map((item, index) => {
            const isSelected = index === currentIndex;
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => onSelect(index)}
                className="group"
                aria-label={`Go to ${item.title ?? `slide ${index + 1}`}`}
                aria-current={isSelected ? "true" : undefined}
              >
                <div
                  className={cx(
                    "relative aspect-[16/9] w-80 overflow-hidden transition-opacity duration-300",
                    isSelected
                      ? "opacity-100"
                      : "opacity-40 group-hover:opacity-70"
                  )}
                >
                  {item.mainImage?.image && (
                    <SanityImage
                      image={item.mainImage.image}
                      alt={item.title ?? ""}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="relative mt-8" style={{ width: totalWidth }}>
        <motion.div
          className="absolute top-0 h-8 w-8 bg-brand"
          animate={{ x: indicatorOffset, rotate: indicatorRotation }}
          transition={{
            x: { duration: 0.8, ease: backInOutSubtle },
            rotate: { duration: 0.8, ease: backInOutSubtle }
          }}
        />
      </div>
    </div>
  );
}

const viewModes = [
  {
    mode: "slider",
    label: "Slider view",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="4"
          width="6"
          height="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="4"
          width="6"
          height="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
  {
    mode: "duo",
    label: "Two column view",
    visibility: "hidden md:flex",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="6"
          height="14"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="9"
          y="1"
          width="6"
          height="14"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
  {
    mode: "grid",
    label: "Grid view",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="6"
          y="1"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="1"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="1"
          y="6"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="6"
          y="6"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="6"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="1"
          y="11"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="6"
          y="11"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <rect
          x="11"
          y="11"
          width="4"
          height="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
  {
    mode: "list",
    label: "List view",
    visibility: "flex md:hidden",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <line
          x1="1"
          y1="4"
          x2="15"
          y2="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="1"
          y1="8"
          x2="15"
          y2="8"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="1"
          y1="12"
          x2="15"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    )
  }
];

function WorkSliderViewMode({ value, onChange, className }) {
  return (
    <div
      className={cx("flex items-center gap-4", className)}
      role="group"
      aria-label="View mode"
    >
      {viewModes.map(({ mode, label, icon, visibility }) => {
        const isActive = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cx(
              "size-32 cursor-pointer items-center justify-center transition-colors duration-400",
              isActive
                ? "bg-brand text-black"
                : "bg-surface/75 text-foreground hover:bg-surface",
              visibility ?? "flex"
            )}
            aria-label={label}
            aria-pressed={isActive}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}

export default function WorkSliderClient({ section }) {
  const content = section.content ?? {};
  const { filterLabel, caseStudies } = content;

  const [activeTag, setActiveTag] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationCount, setRotationCount] = useState(0);
  const [viewMode, setViewMode] = useState("slider");

  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState("auto");

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;
      if (entry) setContainerHeight(entry.contentRect.height);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const uniqueTags = useMemo(() => {
    if (!caseStudies) return [];
    const tagsSet = new Set();
    for (const study of caseStudies) {
      if (study.tags) {
        for (const tag of study.tags) {
          tagsSet.add(tag);
        }
      }
    }
    return Array.from(tagsSet).sort();
  }, [caseStudies]);

  const filteredStudies = useMemo(() => {
    if (!caseStudies) return [];
    if (!activeTag) return caseStudies;
    return caseStudies.filter((study) => study.tags?.includes(activeTag));
  }, [caseStudies, activeTag]);

  useEffect(() => {
    setCurrentIndex(0);
    setRotationCount(0);
  }, [filteredStudies]);

  const mappedProjects = useMemo(() => {
    return filteredStudies.map((study) => ({
      _id: study._id,
      title: study.title,
      uri: study.uri,
      tags: study.tags,
      mainImage: study.mainImage
    }));
  }, [filteredStudies]);

  const mappedThumbnails = useMemo(() => {
    return filteredStudies.map((study) => ({
      _id: study._id,
      title: study.title,
      mainImage:
        study.mainImage?.type === "image"
          ? { type: "image", image: study.mainImage.image }
          : null
    }));
  }, [filteredStudies]);

  const handlePrev = useCallback(() => {
    sliderRef.current?.goToPrev();
  }, []);

  const handleNext = useCallback(() => {
    sliderRef.current?.goToNext();
  }, []);

  const handleSelect = useCallback((index) => {
    sliderRef.current?.goToSlide(index);
  }, []);

  const handleIndexChange = useCallback((index) => {
    setCurrentIndex(index);
    setRotationCount((prev) => prev + 1);
  }, []);

  const [scrambleKey, setScrambleKey] = useState(0);
  const [isTransitioningView, setIsTransitioningView] = useState(false);

  const handleViewModeChange = useCallback(
    (mode) => {
      setIsTransitioningView(viewMode === "slider" || mode === "slider");
      setViewMode(mode);
      setCurrentIndex(0);
      setRotationCount(0);
      setScrambleKey((prev) => prev + 1);
    },
    [viewMode]
  );

  const isSliderMode = viewMode === "slider";

  if (!caseStudies || caseStudies.length === 0) return null;

  const displayFilterLabel = filterLabel ?? "FILTER";
  const thumbnailsOpacity = isSliderMode ? 1 : 0;
  const thumbnailsPointerEvents = isSliderMode ? "auto" : "none";
  const gridTemplateColumns = isSliderMode ? "1fr" : "0fr";

  return (
    <ForceRenderLayoutGroup id="work-slider">
      <div className="grid-container">
        <div className="mb-16 flex items-end justify-between lg:grid lg:grid-cols-12 lg:items-center">
          <WorkSliderFilter
            label={displayFilterLabel}
            options={uniqueTags}
            value={activeTag}
            onChange={setActiveTag}
            className="lg:col-span-4"
          />
          <motion.div
            className="hidden justify-center md:flex lg:col-span-4"
            animate={{ opacity: thumbnailsOpacity }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: thumbnailsPointerEvents }}
          >
            <WorkSliderThumbnails
              items={mappedThumbnails}
              currentIndex={currentIndex}
              onSelect={handleSelect}
              rotationCount={rotationCount}
            />
          </motion.div>
          <div className="flex items-center lg:col-span-4 lg:justify-end">
            <WorkSliderViewMode
              value={viewMode}
              onChange={handleViewModeChange}
            />
            <div
              className="grid transition-[grid-template-columns] duration-300 ease-in-out"
              style={{ gridTemplateColumns }}
            >
              <div className="overflow-hidden">
                <div className="pl-16">
                  <WorkSliderArrows onPrev={handlePrev} onNext={handleNext} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className="overflow-hidden transition-[height] duration-400 [transition-timing-function:var(--ease-power4-in-out)]"
        style={{ height: containerHeight }}
      >
        <div ref={containerRef}>
          <AnimatePresence mode="popLayout">
            {viewMode === "slider" && (
              <motion.div
                key="slider"
                className="flex flex-col gap-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WorkSliderEngine
                  ref={sliderRef}
                  items={mappedProjects}
                  onIndexChange={handleIndexChange}
                  className="page-enter-fade"
                  scrambleKey={scrambleKey}
                />
                <div className="grid-container">
                  <WorkSliderThumbnails
                    items={mappedThumbnails}
                    currentIndex={currentIndex}
                    onSelect={handleSelect}
                    rotationCount={rotationCount}
                    gap={8}
                    className="mt-32 md:hidden"
                  />
                </div>
              </motion.div>
            )}
            {viewMode === "duo" && (
              <motion.div
                key="duo"
                initial={isTransitioningView ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isTransitioningView ? { opacity: 0 } : undefined}
              >
                <ScrambleGroup key={`duo-${scrambleKey}`} stagger={0.08} start="top 85%">
                  <WorkSliderDuoGrid items={filteredStudies} />
                </ScrambleGroup>
              </motion.div>
            )}
            {viewMode === "grid" && (
              <motion.div
                key="grid"
                initial={isTransitioningView ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isTransitioningView ? { opacity: 0 } : undefined}
              >
                <ScrambleGroup key={`grid-${scrambleKey}`} stagger={0.08} start="top 85%">
                  <WorkSliderTriGrid items={filteredStudies} />
                </ScrambleGroup>
              </motion.div>
            )}
            {viewMode === "list" && (
              <motion.div
                key="list"
                initial={isTransitioningView ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isTransitioningView ? { opacity: 0 } : undefined}
              >
                <WorkSliderList items={filteredStudies} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ForceRenderLayoutGroup>
  );
}

