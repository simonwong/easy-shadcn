"use client";

import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";

export interface SelectItem {
  disabled?: boolean;
  itemClassName?: ClassValue;
  label: ReactNode;
  value: string;
}

export interface UseSelectItemsOptions {
  filter?: (item: SelectItem, query: string) => boolean;
  items: SelectItem[];
}

export interface UseSelectItemsReturn {
  filterFn: (itemValue: string, query: string) => boolean;
  findItem: (value: string) => SelectItem | undefined;
  itemToStringLabel: (value: string) => string;
  stringItems: string[];
}

interface SelectItemsIndex {
  index: Map<string, SelectItem>;
  stringItems: string[];
}

function labelToString(label: ReactNode, fallback: string): string {
  if (typeof label === "string") {
    return label;
  }
  if (typeof label === "number") {
    return String(label);
  }
  return fallback;
}

export function useSelectItems({
  items,
  filter,
}: UseSelectItemsOptions): UseSelectItemsReturn {
  const { index, stringItems } = useMemo<SelectItemsIndex>(() => {
    const map = new Map<string, SelectItem>();
    const values: string[] = [];
    for (const item of items) {
      map.set(item.value, item);
      values.push(item.value);
    }
    return { index: map, stringItems: values };
  }, [items]);

  const findItem = useCallback((v: string) => index.get(v), [index]);

  const itemToStringLabel = useCallback(
    (v: string): string => {
      const item = index.get(v);
      if (!item) {
        return v;
      }
      return labelToString(item.label, v);
    },
    [index]
  );

  const filterFn = useCallback(
    (itemValue: string, query: string): boolean => {
      const item = index.get(itemValue);
      if (!item) {
        return true;
      }
      if (filter) {
        return filter(item, query);
      }
      const normalizedQuery = query.toLowerCase();
      const labelStr = labelToString(item.label, item.value).toLowerCase();
      return labelStr.includes(normalizedQuery);
    },
    [index, filter]
  );

  return {
    stringItems,
    findItem,
    itemToStringLabel,
    filterFn,
  };
}
