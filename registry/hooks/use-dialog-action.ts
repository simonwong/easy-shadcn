"use client";

import { useEffect, useRef } from "react";

export function useDialogAction(open: boolean, close: () => void) {
  const session = useRef<symbol | null>(null);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);
  useEffect(() => {
    session.current = open ? Symbol("dialog session") : null;
    return () => {
      session.current = null;
    };
  }, [open]);

  return async (action: (() => void | Promise<void>) | undefined) => {
    const token = session.current;
    await action?.();
    if (token && token === session.current) {
      closeRef.current();
    }
  };
}
