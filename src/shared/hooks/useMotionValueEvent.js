import { useInsertionEffect } from "react";

function useMotionValueEvent(motionValue, event, callback) {
  useInsertionEffect(() => motionValue.on(event, callback), [
    motionValue,
    event,
    callback,
  ]);
}

export { useMotionValueEvent };
