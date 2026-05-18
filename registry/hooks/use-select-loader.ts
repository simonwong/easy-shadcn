"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SelectItem } from "@/registry/hooks/use-select-items";

export type SelectItemsLoader = (
  query: string,
  signal: AbortSignal
) => Promise<SelectItem[]>;

export interface UseSelectLoaderOptions {
  debounceMs?: number;
  loadItems?: SelectItemsLoader;
  loadOn?: "mount" | "open";
  open?: boolean;
  query?: string;
  serverSideFilter?: boolean;
  value?: string | string[] | null;
}

export interface UseSelectLoaderReturn {
  enabled: boolean;
  error: unknown;
  items: SelectItem[];
  loading: boolean;
  refresh: () => void;
}

function toArray(value: string | string[] | null | undefined): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function useSelectLoader({
  loadItems,
  loadOn = "mount",
  serverSideFilter = false,
  debounceMs = 250,
  open,
  query = "",
  value,
}: UseSelectLoaderOptions): UseSelectLoaderReturn {
  const enabled = Boolean(loadItems);
  const [items, setItems] = useState<SelectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [selectedCache, setSelectedCache] = useState<Map<string, SelectItem>>(
    () => new Map()
  );
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const loadItemsRef = useRef(loadItems);
  const queryRef = useRef(query);
  const serverSideFilterRef = useRef(serverSideFilter);
  useEffect(() => {
    loadItemsRef.current = loadItems;
  }, [loadItems]);
  useEffect(() => {
    queryRef.current = query;
  }, [query]);
  useEffect(() => {
    serverSideFilterRef.current = serverSideFilter;
  }, [serverSideFilter]);

  const fetchItems = useCallback((q: string) => {
    const fn = loadItemsRef.current;
    if (!fn) {
      return;
    }
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    fn(q, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }
        setItems(result);
        hasLoadedRef.current = true;
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        if (e instanceof DOMException && e.name === "AbortError") {
          return;
        }
        setError(e);
        setLoading(false);
      });
  }, []);

  const refresh = useCallback(() => {
    hasLoadedRef.current = false;
    const q = serverSideFilterRef.current ? queryRef.current : "";
    fetchItems(q);
  }, [fetchItems]);

  // Eager mode: fetch once. loadOn === "mount" => on mount; loadOn === "open" => on first open.
  useEffect(() => {
    if (!enabled || serverSideFilter) {
      return;
    }
    if (hasLoadedRef.current) {
      return;
    }
    if (loadOn === "open" && !open) {
      return;
    }
    fetchItems("");
  }, [enabled, serverSideFilter, loadOn, open, fetchItems]);

  // Server-side filter mode: fetch on open + on every query change (debounced).
  useEffect(() => {
    if (!(enabled && serverSideFilter)) {
      return;
    }
    if (!open) {
      return;
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    const wait = query === "" && !hasLoadedRef.current ? 0 : debounceMs;
    debounceRef.current = setTimeout(() => {
      fetchItems(query);
    }, wait);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [enabled, serverSideFilter, open, query, debounceMs, fetchItems]);

  // When popup closes in server-side mode, reset hasLoadedRef so reopening refetches default list.
  useEffect(() => {
    if (!(enabled && serverSideFilter)) {
      return;
    }
    if (!open) {
      hasLoadedRef.current = false;
    }
  }, [enabled, serverSideFilter, open]);

  // Cleanup on unmount.
  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    []
  );

  // Maintain a cache of selected items so chips/triggers can still display labels
  // when async results no longer contain previously-selected values.
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const arr = toArray(value);
    if (arr.length === 0) {
      return;
    }
    const itemIndex = new Map<string, SelectItem>();
    for (const item of items) {
      itemIndex.set(item.value, item);
    }
    setSelectedCache((prev) => {
      let changed = false;
      const next = new Map(prev);
      for (const v of arr) {
        const found = itemIndex.get(v);
        if (found && next.get(v) !== found) {
          next.set(v, found);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [items, value, enabled]);

  const mergedItems = useMemo(() => {
    if (!enabled) {
      return [];
    }
    const arr = toArray(value);
    if (arr.length === 0) {
      return items;
    }
    const present = new Set(items.map((i) => i.value));
    const additions: SelectItem[] = [];
    for (const v of arr) {
      if (present.has(v)) {
        continue;
      }
      const cached = selectedCache.get(v);
      if (cached) {
        additions.push(cached);
      }
    }
    if (additions.length === 0) {
      return items;
    }
    return [...items, ...additions];
  }, [enabled, items, value, selectedCache]);

  return {
    enabled,
    error,
    items: mergedItems,
    loading,
    refresh,
  };
}
