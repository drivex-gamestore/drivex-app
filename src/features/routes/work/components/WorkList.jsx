import { Fragment } from 'react'
import Link from 'next/link'
import { cx } from '@lib/vendor'
import { motion, AnimatePresence } from 'framer-motion'
import { SanityMedia } from '@lib/sanity/components/SanityMedia'
import { springTransition } from '@routes/work/components/WorkCard'


export function WorkList({ items, className }) {
  return (
    <div className={cx('grid-container', className)}>
      <div className="divide-y divide-foreground/10">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <WorkListItem key={item._id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}


export function WorkListItem({ item }) {
  return (
    <motion.div
      layoutId={item._id}
      layout
      transition={{ layout: { type: 'spring', ...springTransition } }}
    >
      <Link
        href={item.uri ?? '#'}
        className="group flex items-stretch"
        data-cursor-text="VIEW PROJECT"
      >
        <div className="relative aspect-square w-80 shrink-0 overflow-hidden">
          {item.mainImage && (
            <SanityMedia
              media={item.mainImage}
              className="h-full w-full object-cover"
              imageProps={{
                sizes: '80px',
                builderOptions: { sourceWidths: [160, 240] }
              }}
            />
          )}
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-8 px-16 py-12">
          <h3 className="truncate text-accent">{item.title}</h3>
          {item.tags && item.tags.length > 0 && (
            <div className="xs:flex hidden shrink-0 items-center gap-8 text-body text-foreground-muted">
              {item.tags.map((tag, index) => (
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