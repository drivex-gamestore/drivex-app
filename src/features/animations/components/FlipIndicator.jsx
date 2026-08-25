
import { motion } from 'framer-motion';
const defaultEase = [0.68, -0.3, 0.32, 1.1];
export function FlipIndicator({
  layoutId,
  className = "h-12 w-12 bg-brand",
  duration,
  ease,
  rotate = 0
}) {
  const resolvedDuration = duration ?? 0.8;
  const resolvedEase = ease ?? defaultEase;

  const transition = {
    layout: { duration: resolvedDuration, ease: resolvedEase },
    rotate: { duration: resolvedDuration, ease: resolvedEase }
  };

  const animate = { rotate };
  const style = { flexShrink: 0 };

  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={transition}
      animate={animate}
      style={style}
    />
  );
}