import { cx } from '@lib/vendor';
import { SanityButton } from "@lib/sanity/components/SanityButton"; 

const layoutClasses = {
  horizontal: "flex-row flex-wrap items-center",
  vertical: "flex-col",
};

const gapClasses = {
  0: "gap-0",
  4: "gap-4",
  8: "gap-8",
  16: "gap-16",
  24: "gap-24",
  32: "gap-32",
};

export function ButtonGroup({ buttonGroup, className }) {
  if (!buttonGroup.buttons || buttonGroup.buttons.length === 0) return null;

  const layoutClass = layoutClasses[buttonGroup.layout];
  const gapClass = gapClasses[buttonGroup.gap];

  return (
    <div className={cx("flex items-start", layoutClass, gapClass, className)}>
      {buttonGroup.buttons.map((button) => (
        <SanityButton key={button._key} button={button} />
      ))}
    </div>
  );
}

