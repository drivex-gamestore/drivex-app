"use client";
import { useRef, Fragment } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ScrambleText } from '@animations/components/ScrambleText'
import { SanityMedia } from '@lib/sanity/components/SanityMedia'

export const springTransition = {
  stiffness: 300,
  damping: 30,
  mass: 0.5
}

export function WorkCard({ _id, title, uri, tags, mainImage, className }) {
  const scrambleRef = useRef(null)

  const handleMouseEnter = () => scrambleRef.current?.()

  const targetUri = uri ?? '#'

  return (
    <motion.div
      layoutId={_id}
      layout
      transition={{ layout: { type: 'spring', ...springTransition } }}
      className={className}
    >
      <Link
        href={targetUri}
        className="group block"
        data-cursor-text="VIEW PROJECT"
        onMouseEnter={handleMouseEnter}
      >
        <div className="relative w-full overflow-hidden" style={{ paddingBottom: '66.67%' }}>
          <div className="absolute inset-0">
            {mainImage && (
              <SanityMedia
                media={mainImage}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                imageProps={{
                  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
                  builderOptions: { sourceWidths: [400, 600, 800, 1000, 1200, 1400] }
                }}
              />
            )}
          </div>
        </div>

        <div className="mt-16 flex items-start justify-between gap-16">
          <h3 className="text-accent">
            <ScrambleText duration={0.5} onReady={(fn) => { scrambleRef.current = fn }}>
              {title}
            </ScrambleText>
          </h3>
          {tags && tags.length > 0 && (
            <div className="flex items-center gap-8 text-body text-foreground-muted">
              {tags.map((tag, index) => (
                <Fragment key={tag}>
                  {index > 0 && <span className="text-foreground-muted">—</span>}
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