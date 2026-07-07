"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Debounced callback: invocations are delayed by `ms`, pending calls are
 * cancelled on unmount. The timer lives in a ref, so identity changes of
 * `fn` do not drop an in-flight delay window.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  fn: (...args: Args) => void,
  ms: number,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback(
    (...args: Args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fn(...args), ms);
    },
    [fn, ms],
  );
}
