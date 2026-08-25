"use client";

import { cx } from '@lib/vendor';

export function MenuButton({
  isOpen,
  onClick,
  className
}) {
  const textTranslateY = isOpen ? "calc(-1em - 2px)" : "0px";
  const topLineTransform = isOpen ? "rotate(45deg) translateY(0px)" : "rotate(0deg) translateY(-3px)";
  const bottomLineTransform = isOpen ? "rotate(-45deg) translateY(0px)" : "rotate(0deg) translateY(3px)";
  const ariaLabelText = isOpen ? "Close" : "Menu";

  const mergedClassName = cx(
    "group flex cursor-pointer items-center gap-8 transition-colors transition-opacity duration-300 hover:opacity-70",
    "text-accent uppercase tracking-tight",
    className
  );

  const textTransformStr = `translateY(${textTranslateY})`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label={ariaLabelText}
      className={mergedClassName}>
      <span className="relative h-[1em] w-[3.5em] overflow-hidden">
        <span
          className="flex flex-col gap-2 transition-transform duration-300 ease-out"
          style={{ transform: textTransformStr }}>
          <span className="block h-[1em] leading-none">Menu</span>
          <span className="block h-[1em] leading-none">Close</span>
        </span>
      </span>
      <span className="relative flex h-16 w-16 flex-col items-center justify-center">
        <span
          className="absolute h-[2px] w-full origin-center bg-current"
          style={{
            transform: topLineTransform,
            transition: "transform 250ms ease-out"
          }}/>
        <span
          className="absolute h-[2px] w-full origin-center bg-current"
          style={{
            transform: bottomLineTransform,
            transition: "transform 250ms ease-out"
          }}
        />
      </span>
    </button>
  );
}
