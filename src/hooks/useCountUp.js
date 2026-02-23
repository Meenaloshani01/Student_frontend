import { useState, useEffect, useRef } from 'react';

/**
 * Animates a number from 0 to target over duration (ms).
 * @param {number} target - Target value
 * @param {number} duration - Animation duration in ms
 * @param {boolean} enabled - Whether to run the animation
 */
export function useCountUp(target, duration = 800, enabled = true) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled || target == null) {
      setValue(target);
      return;
    }
    startRef.current = null;
    const start = (timestamp) => {
      if (startRef.current == null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 2; // ease-out quad
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(start);
    };
    rafRef.current = requestAnimationFrame(start);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled]);

  return value;
}
