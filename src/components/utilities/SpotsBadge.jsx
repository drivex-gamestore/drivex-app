import { cx } from '@lib/vendor';

export function SpotsBadge({ spots, className }) {
  if (!spots || spots <= 0) {
    return null;
  }

  const pluralSuffix = spots === 1 ? "" : "s";

  return (
    <span
      className={cx(
        "inline-flex items-center gap-8 text-accent-sm text-foreground-muted",
        className
      )}
    >
      <span className="inline-block size-8 shrink-0 animate-pulse bg-brand" />
      <span>
        Only {spots} spot{pluralSuffix} left
      </span>
    </span>
  );
}