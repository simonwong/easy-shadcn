"use client";

import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import type { SelectItem } from "@/registry/hooks/use-select-items";
import { useSelectItems } from "@/registry/hooks/use-select-items";
import type { SelectItemsLoader } from "@/registry/hooks/use-select-loader";
import { useSelectLoader } from "@/registry/hooks/use-select-loader";

export type { SelectItem } from "@/registry/hooks/use-select-items";
export type { SelectItemsLoader } from "@/registry/hooks/use-select-loader";

export interface SelectProps {
  /** Chip className for `multiple` mode. */
  chipClassName?: ClassValue;
  /** Root wrapper className. */
  className?: ClassValue;
  /** Show a clear button. Single (non-multiple) modes only. */
  clearable?: boolean;
  /** Popover content className. */
  contentClassName?: ClassValue;
  /**
   * Debounce for `loadItems` calls when `serverSideFilter` is true, in milliseconds.
   * Ignored when `serverSideFilter` is false.
   * @default 250
   */
  debounceMs?: number;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Uncontrolled initial value. `string` in single mode, `string[]` in multiple mode. */
  defaultValue?: string | string[];
  /** Disable all interaction. */
  disabled?: boolean;
  /** `<ComboboxEmpty />` className. */
  emptyClassName?: ClassValue;
  /** Content rendered when no items match the query. @default "No results" */
  emptyMessage?: ReactNode;
  /**
   * Message shown when `loadItems` rejects.
   * - `ReactNode`: static content.
   * - `(error) => ReactNode`: receives the rejected value.
   *
   * The default formatter extracts `error.message` or `error.error` from the rejected value,
   * falling back to `"Failed to load options"`.
   */
  errorMessage?: ReactNode | ((error: unknown) => ReactNode);
  /**
   * Custom filter predicate. Applies only in static / eager-async modes.
   * Ignored when `serverSideFilter` is `true` (the server is the filter).
   * @default case-insensitive `contains` against `label`
   */
  filter?: (item: SelectItem, query: string) => boolean;
  /** `<ComboboxInput />` className. Used in `searchable` and `multiple` modes. */
  inputClassName?: ClassValue;
  /** Default item className. Merged with each `item.itemClassName`. */
  itemClassName?: ClassValue;
  /**
   * Static option list. Use either this or `loadItems`. When `loadItems` is provided
   * the `items` prop is ignored.
   */
  items?: SelectItem[];
  /**
   * Async loader. Receives the current query string and an `AbortSignal` for
   * race-condition cleanup. Resolves to the next option list.
   *
   * Behavior depends on `serverSideFilter`:
   * - `false` (default): called once with `query === ""`. Timing controlled by `loadOn`.
   *   Subsequent typing is filtered locally via `filter`.
   * - `true`: called on popup open (`query === ""`) and on every input change
   *   (debounced by `debounceMs`). The client-side filter is disabled —
   *   the server is the filter. Already-selected items are merged back into the result
   *   so chips / triggers continue to render their labels.
   */
  loadItems?: SelectItemsLoader;
  /** Content shown in the popup while a fetch is pending. @default "Loading…" */
  loadingMessage?: ReactNode;
  /**
   * When the first eager fetch fires. Applies only when `loadItems` is provided
   * and `serverSideFilter` is false.
   * - `"mount"` (default): fire immediately on mount.
   * - `"open"`: fire the first time the popup opens.
   */
  loadOn?: "mount" | "open";
  /** Enable multi-select with chips. */
  multiple?: boolean;
  /** Form field name for native form submission. */
  name?: string;
  /** Called when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Called when the selection changes. `undefined` indicates the value was cleared. */
  onValueChange?: (value: string | string[] | undefined) => void;
  /** Controlled popover open state. */
  open?: boolean;
  /** Placeholder shown when no value is selected. @default "Select…" */
  placeholder?: string;
  /** Render an input that filters the list. Ignored (treated as `true`) when `multiple` is true. */
  searchable?: boolean;
  /**
   * Use server-side filtering: every input change re-invokes `loadItems(query)`
   * (debounced by `debounceMs`) and the client-side filter is disabled.
   * Implicitly enables an input (searchable/multiple) — a plain dropdown without
   * an input cannot drive a search query.
   * @default false
   */
  serverSideFilter?: boolean;
  /** Trigger / input / chips-container className depending on mode. */
  triggerClassName?: ClassValue;
  /** Controlled value. `string` in single mode, `string[]` in multiple mode. */
  value?: string | string[];
}

function defaultErrorRenderer(error: unknown): ReactNode {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.error === "string") {
      return obj.error;
    }
    if (typeof obj.message === "string") {
      return obj.message;
    }
  }
  return "Failed to load options";
}

export const Select = ({
  items,
  loadItems,
  loadOn = "mount",
  serverSideFilter = false,
  debounceMs = 250,
  loadingMessage = "Loading…",
  errorMessage,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  searchable = false,
  clearable = false,
  placeholder = "Select…",
  emptyMessage = "No results",
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  filter,
  name,
  className,
  triggerClassName,
  inputClassName,
  contentClassName,
  itemClassName,
  chipClassName,
  emptyClassName,
}: SelectProps) => {
  const isAsync = Boolean(loadItems);
  const effectiveSearchable = searchable || (isAsync && serverSideFilter);

  const [internalOpen, setInternalOpen] = useState<boolean>(
    defaultOpen ?? false
  );
  const isOpenControlled = open !== undefined;
  const currentOpen = isOpenControlled ? open : internalOpen;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange]
  );

  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const handleInputValueChange = useCallback(
    (next: string, details: { reason: string }) => {
      setInputValue(next);
      if (details.reason !== "item-press") {
        setQuery(next);
      }
    },
    []
  );

  const {
    items: asyncItems,
    loading: asyncLoading,
    error: asyncError,
    enabled: asyncEnabled,
    refresh,
  } = useSelectLoader({
    loadItems,
    loadOn,
    serverSideFilter,
    debounceMs,
    open: currentOpen,
    query,
    value,
  });

  const resolvedItems = asyncEnabled ? asyncItems : (items ?? []);

  const { stringItems, findItem, itemToStringLabel, filterFn } = useSelectItems(
    {
      items: resolvedItems,
      value,
      filter,
    }
  );

  const anchorRef = useComboboxAnchor();

  const renderError = useCallback(
    (e: unknown): ReactNode => {
      if (errorMessage === undefined) {
        return defaultErrorRenderer(e);
      }
      if (typeof errorMessage === "function") {
        return errorMessage(e);
      }
      return errorMessage;
    },
    [errorMessage]
  );

  const statusContent = (() => {
    if (asyncLoading) {
      return (
        <div
          className="flex items-center justify-center gap-2 px-2 py-3 text-muted-foreground text-sm"
          data-slot="combobox-status"
        >
          <span
            aria-hidden
            className="inline-block size-3 animate-spin rounded-full border border-current border-r-transparent"
          />
          <span>{loadingMessage}</span>
        </div>
      );
    }
    if (asyncError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-2 px-2 py-3 text-destructive text-sm"
          data-slot="combobox-status"
        >
          <span className="text-center">{renderError(asyncError)}</span>
          <Button
            className="h-7 px-2 text-xs"
            onClick={refresh}
            size="sm"
            type="button"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      );
    }
    return null;
  })();

  const list = (
    <ComboboxList>
      {(itemValue: string) => {
        const item = findItem(itemValue);
        if (!item) {
          return null;
        }
        return (
          <ComboboxItem
            className={cn(itemClassName, item.itemClassName)}
            disabled={item.disabled}
            key={itemValue}
            value={itemValue}
          >
            {item.label}
          </ComboboxItem>
        );
      }}
    </ComboboxList>
  );

  const empty = (
    <ComboboxEmpty className={cn(emptyClassName)}>{emptyMessage}</ComboboxEmpty>
  );

  const popupBody = (
    <>
      {statusContent}
      {!(asyncLoading || asyncError) && (
        <>
          {list}
          {empty}
        </>
      )}
    </>
  );

  const sharedRootProps = {
    defaultOpen,
    disabled,
    filter: serverSideFilter ? null : filterFn,
    inputValue,
    items: stringItems,
    itemToStringLabel,
    name,
    onInputValueChange: handleInputValueChange,
    onOpenChange: handleOpenChange,
    open,
  } as const;

  if (multiple) {
    return (
      <Combobox<string, true>
        {...sharedRootProps}
        defaultValue={defaultValue as string[] | undefined}
        multiple
        onValueChange={(next) => onValueChange?.(next ?? undefined)}
        value={value as string[] | undefined}
      >
        <ComboboxChips
          className={cn(triggerClassName, className)}
          ref={anchorRef}
        >
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((v) => {
                  const item = findItem(v);
                  return (
                    <ComboboxChip className={cn(chipClassName)} key={v}>
                      <span className="truncate">{item?.label ?? v}</span>
                    </ComboboxChip>
                  );
                })}
                <ComboboxChipsInput
                  className={cn(inputClassName)}
                  placeholder={values.length === 0 ? placeholder : undefined}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef} className={cn(contentClassName)}>
          {popupBody}
        </ComboboxContent>
      </Combobox>
    );
  }

  if (effectiveSearchable) {
    return (
      <Combobox<string, false>
        {...sharedRootProps}
        defaultValue={defaultValue as string | undefined}
        onValueChange={(next) => onValueChange?.(next ?? undefined)}
        value={value as string | undefined}
      >
        <ComboboxInput
          className={cn(triggerClassName, inputClassName, className)}
          disabled={disabled}
          placeholder={placeholder}
          showClear={clearable}
        />
        <ComboboxContent className={cn(contentClassName)}>
          {popupBody}
        </ComboboxContent>
      </Combobox>
    );
  }

  return (
    <Combobox<string, false>
      {...sharedRootProps}
      defaultValue={defaultValue as string | undefined}
      onValueChange={(next) => onValueChange?.(next ?? undefined)}
      value={value as string | undefined}
    >
      <ComboboxTrigger
        className={cn("justify-between", className, triggerClassName)}
        disabled={disabled}
        render={<Button variant="outline" />}
      >
        <ComboboxValue placeholder={placeholder}>
          {(selected: string | null) => {
            if (!selected) {
              return placeholder;
            }
            const item = findItem(selected);
            return <span className="truncate">{item?.label ?? selected}</span>;
          }}
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent className={cn(contentClassName)}>
        {popupBody}
      </ComboboxContent>
    </Combobox>
  );
};

export default Select;
