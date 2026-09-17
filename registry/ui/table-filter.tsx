"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface TableFilterItem {
  disabled?: boolean;
  /** Non-interactive content naming this option. */
  label: ReactNode;
  value: string;
}

interface TableFilterBase {
  items: TableFilterItem[];
  /** Filter-button and popup name; required for titles without meaningful text. */
  label?: string;
  /** False permits one value; true permits multiple values combined with OR. @default true */
  multiple?: boolean;
}

export type TableColumnFilter<T> = TableFilterBase &
  (
    | {
        /** Local mode requires onFilter. It filters only supplied records, even with external pagination. */
        mode?: "local";
        /** Pure, non-throwing predicate. Active columns combine with AND. */
        onFilter: (value: string, record: T) => boolean;
      }
    | {
        /** External mode forbids onFilter and never filters supplied records. */
        mode: "external";
        onFilter?: never;
      }
  );

export type TableFilters = Record<string, string[]>;

export interface TableFilterChangeDetails {
  columnKey: string;
  /** Accept this page together with the filters; no separate page callback fires. */
  pagination: { value: 1 } | null;
}

type FilterColumn<T> = { key: string; filter?: TableColumnFilter<T> };

function validItems(items: TableFilterItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    counts.set(item.value, (counts.get(item.value) ?? 0) + 1);
  }
  return items.filter(
    (item) => typeof item.value === "string" && counts.get(item.value) === 1
  );
}

function selectedValues<T>(config: TableColumnFilter<T>, requested: unknown) {
  const values = new Set(Array.isArray(requested) ? requested : []);
  const matches = config.items
    .filter((item) => values.has(item.value))
    .map((item) => item.value);
  return config.multiple === false ? matches.slice(0, 1) : matches;
}

export function useTableFilters<T>({
  columns,
  filters,
  defaultFilters,
  onFiltersChange,
  paginated,
}: {
  columns: FilterColumn<T>[];
  filters?: TableFilters;
  defaultFilters?: TableFilters;
  onFiltersChange?: (
    filters: TableFilters,
    details: TableFilterChangeDetails
  ) => void;
  paginated: boolean;
}) {
  const [internalFilters, setInternalFilters] = useState<TableFilters>(
    defaultFilters ?? {}
  );
  const requested = filters === undefined ? internalFilters : filters;
  const counts = new Map<string, number>();
  for (const column of columns) {
    counts.set(column.key, (counts.get(column.key) ?? 0) + 1);
  }
  const resolved = new Map<
    string,
    { config: TableColumnFilter<T>; values: string[] }
  >();
  for (const column of columns) {
    const config = column.filter;
    if (
      counts.get(column.key) !== 1 ||
      !config ||
      !Array.isArray(config.items)
    ) {
      continue;
    }
    if (
      config.mode !== "external" &&
      !(
        (config.mode === undefined || config.mode === "local") &&
        typeof config.onFilter === "function"
      )
    ) {
      continue;
    }
    const normalized = { ...config, items: validItems(config.items) };
    const values = selectedValues(
      normalized,
      Object.hasOwn(requested, column.key) ? requested[column.key] : undefined
    );
    resolved.set(column.key, { config: normalized, values });
  }
  const fingerprint = JSON.stringify(
    [...resolved]
      .filter(([, entry]) => entry.values.length > 0)
      .map(
        ([key, entry]) =>
          [key, entry.config.mode ?? "local", [...entry.values].sort()] as const
      )
      .sort(([a], [b]) => a.localeCompare(b))
  );
  const requestFilter = (columnKey: string, values: string[]) => {
    const entry = resolved.get(columnKey);
    if (!entry) {
      return;
    }
    const nextValues = selectedValues(entry.config, values);
    if (JSON.stringify(nextValues) === JSON.stringify(entry.values)) {
      return;
    }
    const next = { ...requested, [columnKey]: nextValues };
    if (nextValues.length === 0) {
      delete next[columnKey];
    }
    if (filters === undefined) {
      setInternalFilters(next);
    }
    onFiltersChange?.(next, {
      columnKey,
      pagination: paginated ? { value: 1 } : null,
    });
  };
  const localFilters = [...resolved.values()].filter(
    ({ config, values }) => config.mode !== "external" && values.length > 0
  );
  function filterRows<M extends { record: T }>(rows: M[]) {
    if (localFilters.length === 0) {
      return rows;
    }
    return rows.filter(({ record }) =>
      localFilters.every(
        ({ config, values }) =>
          config.mode === "external" ||
          values.length === 0 ||
          values.some((value) => config.onFilter(value, record))
      )
    );
  }
  return { resolved, fingerprint, requestFilter, filterRows };
}

function FilterOptions<T>({
  config,
  draft,
  setDraft,
  loading,
}: {
  config: TableColumnFilter<T>;
  draft: string[];
  setDraft: (values: string[]) => void;
  loading?: boolean;
}) {
  const id = useId();
  const options = config.items.map((item, index) => (
    <label
      className="flex min-h-9 cursor-pointer items-center gap-3 rounded-sm px-1 has-disabled:cursor-not-allowed has-disabled:opacity-50"
      htmlFor={`${id}-${index}`}
      key={item.value}
    >
      {config.multiple === false ? (
        <RadioGroupItem
          disabled={loading || item.disabled}
          id={`${id}-${index}`}
          value={item.value}
        />
      ) : (
        <Checkbox
          checked={draft.includes(item.value)}
          disabled={loading || item.disabled}
          id={`${id}-${index}`}
          onCheckedChange={(checked) =>
            setDraft(
              checked
                ? [...draft, item.value]
                : draft.filter((value) => value !== item.value)
            )
          }
        />
      )}
      <span className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">
        {item.label}
      </span>
    </label>
  ));
  if (config.multiple === false) {
    return (
      <RadioGroup
        aria-label="Filter options"
        disabled={loading}
        onValueChange={(value) => setDraft([value as string])}
        value={draft[0] ?? null}
      >
        {options}
      </RadioGroup>
    );
  }
  return <fieldset aria-label="Filter options">{options}</fieldset>;
}

export function TableFilterButton<T>({
  config,
  values,
  label,
  loading,
  onApply,
}: {
  config: TableColumnFilter<T>;
  values: string[];
  label: string;
  loading?: boolean;
  onApply: (values: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const snapshot = JSON.stringify([
    values,
    config.mode,
    config.multiple,
    config.items.map((item) => [item.value, item.disabled]),
  ]);
  const [previousSnapshot, setPreviousSnapshot] = useState(snapshot);
  if (snapshot !== previousSnapshot) {
    setPreviousSnapshot(snapshot);
    setDraft(values);
  }
  const apply = (next: string[]) => {
    if (loading) {
      return;
    }
    onApply(next);
    setOpen(false);
  };
  return (
    <Popover
      onOpenChange={(next) => {
        if (next && loading) {
          return;
        }
        setDraft(values);
        setOpen(next);
      }}
      open={open}
    >
      <PopoverTrigger
        aria-label={`${label}${values.length ? ` (${values.length} active)` : ""}`}
        className="ml-2 inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-sm px-1 text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-active:text-primary"
        data-active={values.length ? "" : undefined}
        disabled={loading}
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="14"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          width="14"
        >
          <path d="M3 4h18l-7 8v7l-4 2v-9Z" />
        </svg>
        {values.length ? (
          <span aria-hidden="true" className="text-xs">
            {values.length}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="max-w-[calc(100vw-2rem)]">
        <PopoverTitle>{label}</PopoverTitle>
        <div className="max-h-[min(18rem,50vh)] overflow-y-auto">
          {config.items.length ? (
            <FilterOptions
              config={config}
              draft={draft}
              loading={loading}
              setDraft={setDraft}
            />
          ) : (
            <p className="text-muted-foreground">No options</p>
          )}
        </div>
        <div className="flex justify-between gap-2 border-t pt-2">
          <Button
            disabled={loading || (values.length === 0 && draft.length === 0)}
            onClick={() => apply([])}
            size="sm"
            type="button"
            variant="ghost"
          >
            Reset
          </Button>
          <Button
            disabled={loading}
            onClick={() => apply(draft)}
            size="sm"
            type="button"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
