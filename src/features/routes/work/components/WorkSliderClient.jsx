'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { ScrambleGroup } from '@shared/contexts/ScrambleContext'
import { FilterDropdown } from '@routes/work/components/FilterDropdown'
import { WorkGridDuo, WorkGridTrio } from '@routes/work/components/WorkGrid'
import { WorkList } from '@routes/work/components/WorkList'
import { WorkSlider } from '@routes/work/components/WorkSlider'
import { SliderControls, WorkSliderPagination, ViewModeToggle } from '@routes/work/components/WorkSliderControls'

function transformWorkItem(item) {
  return {
    _id: item._id,
    title: item.title,
    uri: item.uri,
    tags: item.tags,
    mainImage: item.mainImage
  }
}

function transformSlideItem(item) {
  return {
    _id: item._id,
    title: item.title,
    mainImage: item.mainImage?.type === 'image'
      ? { type: 'image', image: item.mainImage.image }
      : null
  }
}

export default function WorkSliderClient({ section }) {
  const content = section.content ?? {}
  const { filterLabel, caseStudies } = content

  const [selectedTag, setSelectedTag] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [rotationCount, setRotationCount] = useState(0)
  const [viewMode, setViewMode] = useState('slider')

  const sliderRef = useRef(null)
  const containerRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState('auto')

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const allTags = useMemo(() => {
    if (!caseStudies) return []
    const tagSet = new Set()
    for (const item of caseStudies) {
      if (item.tags) {
        for (const tag of item.tags) {
          tagSet.add(tag)
        }
      }
    }
    return Array.from(tagSet).sort()
  }, [caseStudies])

  const filteredItems = useMemo(() => {
    if (!caseStudies) return []
    if (!selectedTag) return caseStudies
    return caseStudies.filter((item) => item.tags?.includes(selectedTag))
  }, [caseStudies, selectedTag])

  useEffect(() => {
    setActiveIndex(0)
    setRotationCount(0)
  }, [filteredItems])

  const formattedWorkItems = useMemo(() => filteredItems.map(transformWorkItem), [filteredItems])
  const formattedSlideItems = useMemo(() => filteredItems.map(transformSlideItem), [filteredItems])

  const handlePrev = () => sliderRef.current?.goToPrev()
  const handleNext = () => sliderRef.current?.goToNext()
  const handleSelectSlide = (idx) => sliderRef.current?.goToSlide(idx)

  const handleIndexChange = (idx) => {
    setActiveIndex(idx)
    setRotationCount((prev) => prev + 1)
  }

  const [scrambleKey, setScrambleKey] = useState(0)
  const [isInitialTransition, setIsInitialTransition] = useState(false)

  const handleViewModeChange = (newMode) => {
    setIsInitialTransition(viewMode === 'slider' || newMode === 'slider')
    setViewMode(newMode)
    setActiveIndex(0)
    setRotationCount(0)
    setScrambleKey((prev) => prev + 1)
  }

  const isSliderMode = viewMode === 'slider'

  if (!caseStudies || caseStudies.length === 0) return null

  const displayFilterLabel = filterLabel ?? 'FILTER'
  const sliderOpacity = isSliderMode ? 1 : 0
  const sliderPointerEvents = isSliderMode ? 'auto' : 'none'
  const gridTemplateColumns = isSliderMode ? '1fr' : '0fr'

  return (
    <LayoutGroup id="work-slider">
      <div className="grid-container">
        <div className="mb-16 flex items-end justify-between lg:grid lg:grid-cols-12 lg:items-center">
          <FilterDropdown
            label={displayFilterLabel}
            options={allTags}
            value={selectedTag}
            onChange={setSelectedTag}
            className="lg:col-span-4"
          />

          <motion.div
            className="hidden justify-center md:flex lg:col-span-4"
            animate={{ opacity: sliderOpacity }}
            transition={{ duration: 0.3 }}
            style={{ pointerEvents: sliderPointerEvents }}
          >
            <WorkSliderPagination
              items={formattedSlideItems}
              currentIndex={activeIndex}
              onSelect={handleSelectSlide}
              rotationCount={rotationCount}
            />
          </motion.div>

          <div className="flex items-center lg:col-span-4 lg:justify-end">
            <ViewModeToggle value={viewMode} onChange={handleViewModeChange} />
            <div
              className="grid transition-[grid-template-columns] duration-300 ease-in-out"
              style={{ gridTemplateColumns }}
            >
              <div className="overflow-hidden">
                <div className="pl-16">
                  <SliderControls onPrev={handlePrev} onNext={handleNext} />
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
            {viewMode === 'slider' && (
              <motion.div
                key="slider"
                className="flex flex-col gap-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <WorkSlider
                  ref={sliderRef}
                  items={formattedWorkItems}
                  onIndexChange={handleIndexChange}
                  className="page-enter-fade"
                  scrambleKey={scrambleKey}
                />
                <div className="grid-container">
                  <WorkSliderPagination
                    items={formattedSlideItems}
                    currentIndex={activeIndex}
                    onSelect={handleSelectSlide}
                    rotationCount={rotationCount}
                    gap={8}
                    className="mt-32 md:hidden"
                  />
                </div>
              </motion.div>
            )}

            {viewMode === 'duo' && (
              <motion.div
                key="duo"
                initial={isInitialTransition ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isInitialTransition ? { opacity: 0 } : undefined}
              >
                <ScrambleGroup key={`duo-${scrambleKey}`} stagger={0.08} start="top 85%">
                  <WorkGridDuo items={filteredItems} />
                </ScrambleGroup>
              </motion.div>
            )}

            {viewMode === 'grid' && (
              <motion.div
                key="grid"
                initial={isInitialTransition ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isInitialTransition ? { opacity: 0 } : undefined}
              >
                <ScrambleGroup key={`grid-${scrambleKey}`} stagger={0.08} start="top 85%">
                  <WorkGridTrio items={filteredItems} />
                </ScrambleGroup>
              </motion.div>
            )}

            {viewMode === 'list' && (
              <motion.div
                key="list"
                initial={isInitialTransition ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                exit={isInitialTransition ? { opacity: 0 } : undefined}
              >
                <WorkList items={filteredItems} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  )
}