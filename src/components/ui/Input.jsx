import { forwardRef } from 'react';
import { cva, cx } from '@lib/vendor';

export const inputVariants = cva({
  base: [
    "flex w-full border border-border bg-surface font-sans text-foreground",
    "file:border-0 file:bg-transparent file:font-medium",
    "placeholder:text-foreground-muted",
    "outline-none transition-colors duration-200 ease-out focus:border-foreground",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ],
  variants: {
    size: {
      default: "h-48 px-16 py-12 text-body file:text-body",
      sm: "h-40 px-12 py-8 text-body-sm file:text-body-sm"
    }
  },
  defaultVariants: {
    size: "default"
  }
});

export const Input = forwardRef(({ className, type, size, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cx(inputVariants({ size }), className)}
    {...props}
  />
));

Input.displayName = "Input";
