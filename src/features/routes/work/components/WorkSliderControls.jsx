import { cx } from '@lib/vendor'
import { motion } from 'framer-motion'
import { SanityImage } from '@lib/sanity/components/SanityImage'
import { easings } from '@shared/utils/easings'


export function SliderControls({ onPrev, onNext, className }) {
  return (
    <div className={cx('flex items-center gap-8', className)}>
      <button
        type="button"
        onClick={onPrev}
        className="flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface"
        aria-label="Previous slide"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNext}
        className="flex size-32 cursor-pointer items-center justify-center bg-surface/75 transition-colors duration-400 hover:bg-surface"
        aria-label="Next slide"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  )
}

// Original mangled identifier: $ -> WorkSliderPagination
export function WorkSliderPagination({
  items,
  currentIndex,
  onSelect,
  rotationCount = 0,
  gap = 16,
  className
}) {
  const count = items.length
  if (count === 0) return null

  const totalWidth = 80 * count + (count - 1) * gap
  const step = 80 + gap
  const activeX = currentIndex * step
  const indicatorCenter = currentIndex * step + 40
  const indicatorOffset = indicatorCenter - 4
  const rotationDegrees = 90 * rotationCount

  return (
    <div className={cx('relative flex flex-col items-center', className)}>
      <div className="relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute top-0 z-10 h-full border border-foreground/30"
          style={{ width: 80 }}
          animate={{ x: activeX }}
          transition={{ duration: 0.8, ease: easings.backInOutSubtle }}
        />
        <div className="flex items-center" style={{ gap }}>
          {items.map((item, idx) => {
            const isActive = idx === currentIndex
            return (
              <button
                key={item._id}
                type="button"
                onClick={() => onSelect(idx)}
                className="group"
                aria-label={`Go to ${item.title ?? `slide ${idx + 1}`}`}
                aria-current={isActive ? 'true' : undefined}
              >
                <div
                  className={cx(
                    'relative aspect-[16/9] w-80 overflow-hidden transition-opacity duration-300',
                    isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'
                  )}
                >
                  {item.mainImage?.image && (
                    <SanityImage
                      image={item.mainImage.image}
                      alt={item.title ?? ''}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="relative mt-8" style={{ width: totalWidth }}>
        <motion.div
          className="absolute top-0 h-8 w-8 bg-brand"
          animate={{ x: indicatorOffset, rotate: rotationDegrees }}
          transition={{
            x: { duration: 0.8, ease: easings.backInOutSubtle },
            rotate: { duration: 0.8, ease: easings.backInOutSubtle }
          }}
        />
      </div>
    </div>
  )
}

const VIEW_MODES = [
  {
    mode: 'slider',
    label: 'Slider view',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="4" width="6" height="8" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="4" width="6" height="8" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    mode: 'duo',
    label: 'Two column view',
    visibility: 'hidden md:flex',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6" height="14" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="14" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    mode: 'grid',
    label: 'Grid view',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="6" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="6" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="6" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="11" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="11" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="4" height="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    mode: 'list',
    label: 'List view',
    visibility: 'flex md:hidden',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <line x1="1" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" />
        <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" />
        <line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
]

// Original mangled identifier: J -> ViewModeToggle
export function ViewModeToggle({ value, onChange, className }) {
  return (
    <div className={cx('flex items-center gap-4', className)} role="group" aria-label="View mode">
      {VIEW_MODES.map(({ mode, label, icon, visibility }) => {
        const isActive = value === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cx(
              'size-32 cursor-pointer items-center justify-center transition-colors duration-400',
              isActive ? 'bg-brand text-black' : 'bg-surface/75 text-foreground hover:bg-surface',
              visibility ?? 'flex'
            )}
            aria-label={label}
            aria-pressed={isActive}
          >
            {icon}
          </button>
        )
      })}
    </div>
  )
}