"use client";
import { useState, useRef, useEffect } from 'react'
import { cva, cx } from '@lib/vendor'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const filterButtonVariants = cva(
  [
    'group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap',
    'text-accent-sm',
    'outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
  ],
  {
    variants: {
      size: {
        sm: 'text-body-sm',
        default: 'text-body-sm lg:text-body',
        lg: 'text-body lg:text-body-lg'
      }
    },
    defaultVariants: {
      size: 'default'
    }
  }
)

const iconBoxVariants = cva(
  [
    'flex items-center justify-center',
    'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'
  ],
  {
    variants: {
      size: {
        sm: 'size-32 lg:size-40',
        default: 'size-40 lg:size-48',
        lg: 'size-48 lg:size-56'
      },
      position: {
        left: 'origin-left -rotate-45 scale-0',
        right: 'absolute right-0 z-10 origin-right rotate-0 scale-100'
      },
      theme: {
        light: 'bg-foreground text-background',
        dark: 'bg-foreground text-background',
        brand: 'bg-brand text-black'
      }
    },
    defaultVariants: {
      size: 'default',
      theme: 'light'
    }
  }
)

const contentBoxVariants = cva(
  [
    'flex w-full flex-1 items-center justify-center gap-8',
    'transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]'
  ],
  {
    variants: {
      size: {
        sm: 'h-32 -translate-x-[calc(32px+6px)] px-8 lg:h-40 lg:-translate-x-[calc(40px+6px)] lg:px-12',
        default: 'h-40 -translate-x-[calc(40px+6px)] px-12 lg:h-48 lg:-translate-x-[calc(48px+6px)] lg:px-16',
        lg: 'h-48 -translate-x-[calc(48px+6px)] px-16 lg:h-56 lg:-translate-x-[calc(56px+6px)] lg:px-24'
      },
      theme: {
        light: 'bg-foreground text-background',
        dark: 'bg-foreground text-background',
        brand: 'bg-brand text-black'
      }
    },
    defaultVariants: {
      size: 'default',
      theme: 'light'
    }
  }
)


export function DropdownChevronIcon({ className }) {
  return (
    <svg
      className={cx('size-[0.75em]', className)}
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
  )
}


export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className,
  size = 'default',
  theme = 'light'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useGSAP(
    () => {
      if (!dropdownRef.current) return
      gsap.killTweensOf(dropdownRef.current)

      if (isOpen) {
        gsap.set(dropdownRef.current, { visibility: 'visible' })
        gsap.fromTo(
          dropdownRef.current,
          { opacity: 0, scale: 0.95, y: -8 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            ease: 'back.out(1.7)'
          }
        )
      } else {
        gsap.to(dropdownRef.current, {
          opacity: 0,
          scale: 0.95,
          y: -8,
          duration: 0.21,
          ease: 'power2.out',
          onComplete: () => {
            if (dropdownRef.current) {
              gsap.set(dropdownRef.current, { visibility: 'hidden' })
            }
          }
        })
      }
    },
    { scope: containerRef, dependencies: [isOpen] }
  )

  const handleSelect = (option) => {
    onChange(option)
    setIsOpen(false)
  }

  const handleOptionKeyDown = (e, option) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleSelect(option)
    }
  }

  const allOptions = [null, ...options]

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const handleButtonKeyDown = (e) => {
    if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  const displayLabel = value ?? label ?? 'FILTER'

  return (
    <div ref={containerRef} className={cx('relative', className)}>
      <button
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleButtonKeyDown}
        className={cx(filterButtonVariants({ size }), isOpen && 'group')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-open={isOpen}
      >
        <span className="relative flex w-full items-center gap-6">
          <span
            className={cx(
              iconBoxVariants({ size, theme, position: 'left' }),
              isOpen && 'rotate-0 scale-100'
            )}
          >
            <DropdownChevronIcon className="rotate-180" />
          </span>

          <span className={cx(contentBoxVariants({ size, theme }), isOpen && 'translate-x-0')}>
            {value && <span className="size-8 bg-brand" />}
            <span className="text-accent-sm">{displayLabel}</span>
          </span>

          <span
            className={cx(
              iconBoxVariants({ size, theme, position: 'right' }),
              isOpen && '-rotate-45 scale-0'
            )}
          >
            <DropdownChevronIcon />
          </span>
        </span>
      </button>

      <div
        ref={dropdownRef}
        className="absolute top-full left-0 z-50 mt-8 min-w-200 origin-top-left bg-background md:min-w-0"
        style={{ visibility: 'hidden', opacity: 0 }}
        role="listbox"
        tabIndex={-1}
        data-theme="dark"
      >
        <div className="py-8">
          {allOptions.map((option) => {
            const isSelected = option === value
            const optionText = option ?? 'All'
            return (
              <div
                key={option ?? 'all'}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                onClick={() => handleSelect(option)}
                className={cx(
                  'flex cursor-pointer items-center gap-8 px-16 py-8 transition-colors hover:bg-surface',
                  isSelected && 'text-brand'
                )}
              >
                {isSelected && <span className="size-8 bg-brand" />}
                <span className="text-accent-sm">[{optionText}]</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}