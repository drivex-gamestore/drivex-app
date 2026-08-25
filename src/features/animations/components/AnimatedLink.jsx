import React, { forwardRef } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cx } from '@lib/vendor';

export const AnimatedLink = forwardRef(function AnimatedLink(props, ref) {
  const {
    children,
    className,
    asChild,
    indicator,
    ...restProps
  } = props;

  
  const Component = asChild ? Slot : "a";
  const displayClass = indicator ? "inline-flex items-center" : "inline-block";

  
  const combinedClassName = cx(
    "group relative w-fit cursor-pointer",
    displayClass,
    "outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    className
  );
  
  const renderChildren = (childContent) => (
    <>
      {indicator && (
        <span
          className={cx(
            "absolute left-0 size-8 bg-brand lg:size-12",
            "-rotate-90 scale-0",
            "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
            "group-hover:rotate-0 group-hover:scale-100",
            "group-focus-visible:rotate-0 group-focus-visible:scale-100"
          )}
          aria-hidden="true"
        />
      )}

      {indicator ? (
        <span
          className={cx(
            "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]",
            "group-hover:translate-x-24",
            "group-focus-visible:translate-x-24"
          )}
        >
          {childContent}
        </span>
      ) : (
        childContent
      )}

      <span
        className={cx(
          "pointer-events-none absolute inset-x-0 -bottom-1",
          indicator && [
            "transition-transform duration-500 [transition-timing-function:cubic-bezier(0.33,1,0.68,1)]",
            "group-hover:translate-x-24 group-focus-visible:translate-x-24"
          ]
        )}
        aria-hidden="true"
      >
        <span
          className={cx(
            "absolute inset-x-0 top-0 h-px bg-current",
            "origin-left scale-x-100",
            "transition-transform duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)]",
            "delay-300 group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0",
            "group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0"
          )}
        />
        <span
          className={cx(
            "absolute inset-x-0 top-0 h-px bg-current",
            "origin-right scale-x-0",
            "transition-transform duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)]",
            "delay-0 group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300",
            "group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300"
          )}
        />
      </span>
    </>
  );

  return (
    <Component ref={ref} className={combinedClassName} {...restProps}>
      <Slottable asChild={asChild} child={children}>
        {renderChildren}
      </Slottable>
    </Component>
  );
});
