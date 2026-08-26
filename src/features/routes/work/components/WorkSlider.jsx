'use client'
import { useState, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, Fragment } from 'react'
import Link from 'next/link'
import { cx } from '@lib/vendor'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { gsap, useGSAP, Draggable, InertiaPlugin } from "@lib/vendor";
import { ScrambleText } from '@animations/components/ScrambleText'
import { SanityMedia } from '@lib/sanity/components/SanityMedia'
import { useMotionValueEvent } from '@shared/hooks/useMotionValueEvent'
import { easings } from '@shared/utils/easings'

export function WorkSlideTitle({ title, onRegisterScramble }) {
  return (
    <h3 className="text-accent">
      <ScrambleText duration={0.5} onReady={onRegisterScramble}>
        {title}
      </ScrambleText>
    </h3>
  )
}

export function WorkSlideItem({
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
  const scrambleRef = useRef(null)

  const calculateX = useCallback(
    (x) => {
      let currentPos = index * wrapWidth + x + centerOffset
      while (currentPos > containerWidth + wrapWidth) currentPos -= totalWidth
      while (currentPos < -(2 * wrapWidth)) currentPos += totalWidth
      return currentPos
    },
    [centerOffset, containerWidth, index, totalWidth, wrapWidth]
  )

  const itemX = useTransform(springX, calculateX)

  const calculateParallaxX = useCallback(
    (x) => -(((x + slideWidth / 2 - containerWidth / 2) / containerWidth) * 150),
    [containerWidth, slideWidth]
  )

  const parallaxX = useTransform(itemX, calculateParallaxX)

  const containerStyle = useMemo(
    () => ({
      x: itemX,
      width: slideWidth,
      position: 'absolute',
      left: 0,
      top: 0
    }),
    [slideWidth, itemX]
  )

  const targetUri = item.uri ?? '#'

  const handleMouseEnter = () => scrambleRef.current?.()

  const handleClick = (e) => {
    if (isDraggingRef.current || hasDraggedRef.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const handleRegister = (triggerFn) => {
    scrambleRef.current = triggerFn
    onRegisterScramble(index, triggerFn)
  }

  return (
    <motion.div style={containerStyle} className="will-change-transform">
      <Link
        href={targetUri}
        className="group block overflow-hidden"
        data-cursor-text="VIEW PROJECT"
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        draggable={false}
      >
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '66.67%' }}>
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ x: parallaxX, scale: 1.225 }}
          >
            {item.mainImage && (
              <SanityMedia
                media={item.mainImage}
                className="h-full w-full object-cover"
                imageProps={{
                  sizes: '150vw',
                  builderOptions: {
                    sourceWidths: [800, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 3000, 3840]
                  }
                }}
              />
            )}
          </motion.div>
        </div>
        <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <WorkSlideTitle title={item.title} onRegisterScramble={handleRegister} />
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-center gap-8 text-body text-foreground-muted">
              {item.tags.map((tag, idx) => (
                <Fragment key={tag}>
                  {idx > 0 && <span className="text-foreground-muted">—</span>}
                  <span className="text-accent-sm uppercase">[{tag}]</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export const WorkSlider = forwardRef(function WorkSlider(
  { items, onIndexChange, className, scrambleKey },
  ref
) {
  const containerRef = useRef(null)
  const dragTargetRef = useRef(null)
  const draggableInstanceRef = useRef(null)
  const dragStartXRef = useRef(0)
  const scrambleMapRef = useRef(new Map())
  const hasScrambledRef = useRef(false)

  useEffect(() => {
    if (scrambleKey === undefined) return
    const timer = setTimeout(() => {
      Array.from(scrambleMapRef.current.values()).forEach((triggerFn, idx) => {
        setTimeout(() => triggerFn(), 80 * idx)
      })
      hasScrambledRef.current = true
    }, 100)
    return () => clearTimeout(timer)
  }, [scrambleKey])

  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    slideWidth: 0,
    wrapWidth: 0,
    centerOffset: 0
  })

  const isDraggingRef = useRef(false)
  const hasDraggedRef = useRef(false)
  const dragDistanceRef = useRef(0)
  const itemCount = items.length

  const rawX = useMotionValue(0)
  const springX = useMotionValue(0)
  const currentIndexRef = useRef(0)

  const { extendedItems, cloneOffset } = useMemo(() => {
    if (itemCount === 0) return { extendedItems: [], cloneOffset: 0 }
    return {
      extendedItems: [
        ...items.map((item, idx) => ({
          ...item,
          _id: `clone-before-${item._id}`,
          originalIndex: idx,
          isClone: true
        })),
        ...items.map((item, idx) => ({
          ...item,
          originalIndex: idx,
          isClone: false
        })),
        ...items.map((item, idx) => ({
          ...item,
          _id: `clone-after-${item._id}`,
          originalIndex: idx,
          isClone: true
        }))
      ],
      cloneOffset: itemCount
    }
  }, [items, itemCount])

  const totalWidth = extendedItems.length * dimensions.wrapWidth

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const width = entry.contentRect.width
      if (width === 0) return

      const itemsPerView = window.matchMedia('(max-width: 767px)').matches ? 1.1 : 2
      const calculatedSlideWidth = (width - 16 * (Math.ceil(itemsPerView) - 1)) / itemsPerView

      setDimensions({
        containerWidth: width,
        slideWidth: calculatedSlideWidth,
        wrapWidth: calculatedSlideWidth + 16,
        centerOffset: (width - calculatedSlideWidth) / 2
      })
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (dimensions.wrapWidth === 0) return
    const initialX = -cloneOffset * dimensions.wrapWidth
    rawX.set(initialX)
    springX.set(initialX)
    if (dragTargetRef.current) {
      gsap.set(dragTargetRef.current, { x: initialX })
    }
  }, [cloneOffset, dimensions.wrapWidth, rawX, springX])

  const normalizeIndex = useCallback(
    (index) => ((index % itemCount) + itemCount) % itemCount,
    [itemCount]
  )

  useMotionValueEvent(springX, 'change', (latestX) => {
    if (dimensions.wrapWidth === 0) return
    const activeIndex = normalizeIndex(Math.round(-latestX / dimensions.wrapWidth))
    if (activeIndex !== currentIndexRef.current) {
      currentIndexRef.current = activeIndex
      onIndexChange(activeIndex)
    }
  })

  const animateToX = useCallback(
    (targetX) => {
      rawX.set(targetX)
      animate(springX, targetX, { duration: 0.8, ease: easings.power4InOut })
      if (dragTargetRef.current) {
        gsap.set(dragTargetRef.current, { x: targetX })
      }
    },
    [rawX, springX]
  )

  const goToNext = useCallback(() => {
    if (isDraggingRef.current || itemCount === 0 || dimensions.wrapWidth === 0) return
    animateToX(rawX.get() - dimensions.wrapWidth)
  }, [itemCount, dimensions.wrapWidth, rawX, animateToX])

  const goToPrev = useCallback(() => {
    if (isDraggingRef.current || itemCount === 0 || dimensions.wrapWidth === 0) return
    animateToX(rawX.get() + dimensions.wrapWidth)
  }, [itemCount, dimensions.wrapWidth, rawX, animateToX])

  const goToSlide = useCallback(
    (targetIndex) => {
      if (isDraggingRef.current || itemCount === 0 || dimensions.wrapWidth === 0) return
      const currentX = rawX.get()
      const normalizedTarget = ((targetIndex % itemCount) + itemCount) % itemCount
      const currentIndex = normalizeIndex(Math.round(-currentX / dimensions.wrapWidth))
      let diff = (normalizedTarget - currentIndex + itemCount) % itemCount
      if (diff === 0) diff = itemCount
      animateToX(currentX - diff * dimensions.wrapWidth)
    },
    [itemCount, normalizeIndex, animateToX, rawX, dimensions.wrapWidth]
  )

  useImperativeHandle(
    ref,
    () => ({
      goToSlide,
      goToNext,
      goToPrev
    }),
    [goToSlide, goToNext, goToPrev]
  )

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev()
      else if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrev, goToNext])

  useGSAP(
    () => {
      if (!dragTargetRef.current || !containerRef.current || dimensions.wrapWidth === 0) return
      const wrapWidth = dimensions.wrapWidth

      if (draggableInstanceRef.current) {
        draggableInstanceRef.current.forEach((instance) => instance.kill())
        draggableInstanceRef.current = null
      }

      const initialX = rawX.get()
      gsap.set(dragTargetRef.current, { x: initialX })

      draggableInstanceRef.current = Draggable.create(dragTargetRef.current, {
        type: 'x',
        trigger: containerRef.current,
        inertia: true,
        throwResistance: 1500,
        maxDuration: 1,
        minDuration: 0.2,
        overshootTolerance: 0,
        snap: {
          x: (val) => Math.round(val / wrapWidth) * wrapWidth
        },
        onPress: () => {
          hasDraggedRef.current = false
          dragDistanceRef.current = 0
        },
        onDragStart: function () {
          isDraggingRef.current = true
          hasDraggedRef.current = false
          dragStartXRef.current = this.x
          dragDistanceRef.current = 0
        },
        onDrag: function () {
          const dist = Math.abs(this.x - dragStartXRef.current)
          dragDistanceRef.current = dist
          if (dist > 10) hasDraggedRef.current = true
          rawX.set(this.x)
          springX.set(this.x)
        },
        onThrowUpdate: function () {
          rawX.set(this.x)
          springX.set(this.x)
        },
        onDragEnd: function () {
          if (this.tween === undefined) {
            setTimeout(() => {
              isDraggingRef.current = false
              setTimeout(() => {
                hasDraggedRef.current = false
              }, 100)
            }, 10)
          }
        },
        onThrowComplete: function () {
          rawX.set(this.x)
          springX.set(this.x)
          isDraggingRef.current = false
          setTimeout(() => {
            hasDraggedRef.current = false
          }, 100)
        }
      })

      if (draggableInstanceRef.current[0]) {
        draggableInstanceRef.current[0].update()
      }
    },
    { dependencies: [dimensions.wrapWidth], scope: containerRef }
  )

  const handleRegisterScramble = useCallback((index, triggerFn) => {
    scrambleMapRef.current.set(index, triggerFn)
  }, [])

  const hasContent = items.length > 0 && dimensions.containerWidth > 0

  return (
    <div className={cx('relative', className)}>
      <div
        ref={dragTargetRef}
        className="pointer-events-none invisible absolute"
        style={{ width: 1, height: 1 }}
      />
      <div
        ref={containerRef}
        className="relative cursor-grab touch-pan-y overflow-x-clip active:cursor-grabbing"
      >
        {hasContent && (
          <>
            <div className="pointer-events-none invisible" style={{ width: dimensions.slideWidth }}>
              <div className="relative w-full" style={{ paddingBottom: '66.67%' }} />
              <div className="mt-16 h-24" />
            </div>
            {extendedItems.map((item, index) => (
              <WorkSlideItem
                key={item._id}
                item={item}
                index={index}
                springX={springX}
                slideWidth={dimensions.slideWidth}
                wrapWidth={dimensions.wrapWidth}
                centerOffset={dimensions.centerOffset}
                totalWidth={totalWidth}
                containerWidth={dimensions.containerWidth}
                onRegisterScramble={handleRegisterScramble}
                isDraggingRef={isDraggingRef}
                hasDraggedRef={hasDraggedRef}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})