
import { screens } from '@shared/constants/screens';

function parseRem(value) {
  return Number.parseFloat(value.replace("rem", ""));
}

export function parseResponsiveValues(classNameStr) {
  const values = {};
  const screenKeys = Object.keys(screens).join("|");
  const regex = RegExp(`^(${screenKeys}):(.+)$`);

  for (const token of classNameStr.split(/\s+/)) {
    const match = token.match(regex);
    if (match) {
      const [, breakpoint, value] = match;
      if (value && breakpoint) {
        values[breakpoint] = { value, resolvedWidth: screens[breakpoint] };
      }
    } else {
      values.DEFAULT = { value: token };
    }
  }

  return Object.fromEntries(
    Object.entries(values).sort(([, { resolvedWidth: a }], [, { resolvedWidth: b }]) => {
      if (a || b) {
        if (a) {
          if (b) {
            return parseRem(b) - parseRem(a);
          }
          return -1;
        }
        return 1;
      }
      return 0;
    })
  );
}

export function parseAspectRatio(value) {
  if (typeof value === "number") return value;
  const [w = 1, h = 1] = value.split(/[:/]/).map(Number);
  return w / h;
}

export function createResponsiveRatios(ratioValue) {
  const parsed = parseResponsiveValues(String(ratioValue));
  const screenKeys = Object.keys(screens);
  const styles = {};

  const defaultRatio = parseAspectRatio(parsed.DEFAULT?.value);
  styles["--mx-ratio-DEFAULT"] = String(defaultRatio);

  let currentRatio = defaultRatio;
  for (const key of screenKeys) {
    const ratio = parseAspectRatio(parsed[key]?.value || currentRatio);
    styles[`--mx-ratio-${key}`] = String(ratio);
    currentRatio = ratio;
  }

  return {
    styles,
    className: [
      "aspect-[var(--mx-ratio)]",
      "[--mx-ratio:var(--mx-ratio-DEFAULT)]",
      "sm:[--mx-ratio:var(--mx-ratio-sm)]",
      "md:[--mx-ratio:var(--mx-ratio-md)]",
      "lg:[--mx-ratio:var(--mx-ratio-lg)]",
      "xl:[--mx-ratio:var(--mx-ratio-xl)]",
      "2xl:[--mx-ratio:var(--mx-ratio-2xl)]"
    ]
  };
}
// original module IDs: 601247, 2379