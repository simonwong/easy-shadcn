"use client";

import { useEffect, useRef, useState } from "react";

export type UseDelayLoadingOptions = {
  /**
   * Controlled loading source. When provided, takes precedence over the
   * setLoading returned by this hook.
   */
  loading?: boolean;
  /**
   * Minimum visible duration (in ms) once the spinner appears. Prevents the
   * spinner from flashing briefly when the operation completes quickly.
   * Aligned with the `spin-delay` library convention. Set to 0 to disable.
   * @default 200
   */
  minDuration?: number;
};

export type UseDelayLoadingReturn = readonly [boolean, (next: boolean) => void];

export function useDelayLoading(
  options?: UseDelayLoadingOptions
): UseDelayLoadingReturn {
  const { loading: controlled, minDuration = 200 } = options ?? {};

  const initial = controlled ?? false;
  const [internalLoading, setInternalLoading] = useState(initial);
  const [shown, setShown] = useState(initial);

  const shownAtRef = useRef<number | null>(initial ? Date.now() : null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intent = controlled ?? internalLoading;
  // Derived value — guarantees the very first render matches the spec without
  // waiting for a post-commit effect to sync state.
  const display = intent || shown;

  useEffect(() => {
    if (controlled !== undefined) {
      setInternalLoading(controlled);
    }
  }, [controlled]);

  useEffect(() => {
    if (intent) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      if (!shown) {
        shownAtRef.current = Date.now();
        setShown(true);
      }
      return;
    }

    if (!shown || hideTimerRef.current) {
      return;
    }

    const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : 0;
    const remaining = Math.max(0, minDuration - elapsed);
    if (remaining === 0) {
      shownAtRef.current = null;
      setShown(false);
      return;
    }
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      shownAtRef.current = null;
      setShown(false);
    }, remaining);
  }, [intent, minDuration, shown]);

  useEffect(
    () => () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    },
    []
  );

  return [display, setInternalLoading] as const;
}
