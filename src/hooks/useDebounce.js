import { useState, useEffect, useMemo } from 'react';

/**
 * Returns a debounced value that updates after `delay` ms of no changes.
 */
export function useDebounce(value, delay = 280) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
