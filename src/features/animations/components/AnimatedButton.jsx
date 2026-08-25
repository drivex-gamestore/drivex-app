"use client";

import React, { useRef } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, cx } from '@lib/vendor';
import useDualLayerScramble from '@features/animations/hooks/useDualLayerScramble';

const buttonVariants = cva(
  [
    "group inline-flex min-w-0 shrink-0 cursor-pointer items-center justify-center whitespace-nowrap",
    "font-medium font-mono uppercase",
    "outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50"
  ],
  {
    variants: {
      variant: {
        primary: []
      },
      size: {
        xs: "text-body-sm",
        sm: "text-body-sm",
        default: "text-body-sm lg:text-body",
        lg: "text-body lg:text-body-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

const iconVariants = cva(
  [
    "flex items-center justify-center",
    "transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]"
  ],
  {
    variants: {
      size: {
        xs: "size-32",
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
  }
);

const textWrapperVariants = cva(
  [
    "flex w-full flex-1 items-center justify-center",
    "transition-transform duration-700 [transition-timing-function:var(--ease-power4-in-out)]"
  ],
  {
    variants: {
      size: {
        xs: "h-32 -translate-x-[calc(32px+6px)] px-8",
        sm: "h-32 -translate-x-[calc(32px+6px)] px-8 lg:h-40 lg:-translate-x-[calc(40px+6px)] lg:px-12",
        default: "h-40 -translate-x-[calc(40px+6px)] px-12 lg:h-48 lg:-translate-x-[calc(48px+6px)] lg:px-16",
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
  }
);

function PlusIcon({ className }) {
  return (
    <svg
      className={cx("size-[0.75em]", className)}
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 1v10M1 6h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function AnimatedButton(props) {
  const {
    children,
    className,
    asChild,
    variant,
    size,
    theme,
    type,
    ...rest
  } = props;

  const resolvedType = type === undefined ? (asChild ? undefined : "button") : type;
  const Comp = asChild ? Slot : "button";

  const themeColors = theme === "brand" 
    ? { firstColorClass: "scramble-white", secondColorClass: "scramble-inherit" } 
    : { firstColorClass: "scramble-brand", secondColorClass: "scramble-inherit" };

  const scrambleConfig = {
    duration: 0.5,
    initiallyVisible: true,
    firstColorClass: themeColors.firstColorClass,
    secondColorClass: themeColors.secondColorClass
  };

  const scrambleResult = useDualLayerScramble(scrambleConfig);
  const isScramblingRef = useRef(false);

  const handleMouseEnter = () => {
    if (!isScramblingRef.current) {
      isScramblingRef.current = true;
      scrambleResult.scramble();
    }
  };

  const handleMouseLeave = () => {
    isScramblingRef.current = false;
  };

  const buttonClasses = buttonVariants({ variant, size, className });

  const renderContent = (content) => (
    <span className="relative flex w-full items-center gap-6">
      <span
        className={cx(
          iconVariants({ size, theme, position: "left" }),
          "group-hover:rotate-0 group-hover:scale-100"
        )}
      >
        <PlusIcon />
      </span>
      
      <span
        className={cx(
          textWrapperVariants({ size, theme }),
          "group-hover:translate-x-0"
        )}
      >
        <span ref={scrambleResult.ref}>{content}</span>
      </span>
      
      <span
        className={cx(
          iconVariants({ size, theme, position: "right" }),
          "group-hover:-rotate-45 group-hover:scale-0"
        )}
      >
        <PlusIcon />
      </span>
    </span>
  );

  return (
    <Comp
      type={resolvedType}
      className={buttonClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      <Slottable asChild={asChild} child={children}>
        {renderContent}
      </Slottable>
    </Comp>
  );
}













