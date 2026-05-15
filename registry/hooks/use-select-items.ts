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
  value?: string | string[] | null;
}

export interface UseSelectItemsReturn {
  filterFn: (itemValue: string, query: string) => boolean;
  findItem: (value: string) => SelectItem | undefined;
  itemToStringLabel: (value: string) => string;
  selectedItems: SelectItem[];
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
  value,
  filter,
}: UseSelectItemsOptions): UseSelectItemsReturn {
  const stringItems = useMemo(() => items.map((i) => i.value), [items]);

  const findItem = useCallback(
    (v: string) => items.find((i) => i.value === v),
    [items]
  );

  const itemToStringLabel = useCallback(
    (v: string): string => {
      const item = findItem(v);
      if (!item) {
        return v;
      }
      return labelToString(item.label, v);
    },
    [findItem]
  );

  const filterFn = useCallback(
    (itemValue: string, query: string): boolean => {
      const item = findItem(itemValue);
      if (!item) {
        return true;
      }
      if (filter) {
        return filter(item, query);
      }
      const labelStr = labelToString(item.label, item.value).toLowerCase();
      return labelStr.includes(query.toLowerCase());
    },
    [findItem, filter]
  );

  const selectedItems = useMemo(() => {
    if (value === null || value === undefined) {
      return [];
    }
    const arr = Array.isArray(value) ? value : [value];
    const result: SelectItem[] = [];
    for (const v of arr) {
      const item = findItem(v);
      if (item) {
        result.push(item);
      }
    }
    return result;
  }, [value, findItem]);

  return {
    stringItems,
    findItem,
    itemToStringLabel,
    filterFn,
    selectedItems,
  };
}
