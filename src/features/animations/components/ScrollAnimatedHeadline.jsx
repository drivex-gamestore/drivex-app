import { AnimatedHeadline } from "@features/animations/components/AnimatedHeadline";   

import { cx } from '@lib/vendor';

function ScrollAnimatedHeadline({
  headline,
  displayAs,
  className,
  headlineClassName,
}) {
  if (!headline?.text || !headline?.level) return null;

  return (
    <AnimatedHeadline
      trigger="scroll"
      as={headline.level}
      displayAs={displayAs}
      className={cx(headlineClassName)}
      wrapperClassName={className}
    >
      {headline.text}
    </AnimatedHeadline>
  );
}

export { ScrollAnimatedHeadline };
