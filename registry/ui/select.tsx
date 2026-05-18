"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  SearchList01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import type { FocusEvent, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  /**
   * Show an inline clear button when the field has a value and the user hovers
   * the right-side icon area. Works in all three modes.
   */
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
  /**
   * Max selectable count in `multiple` mode. When the limit is reached every
   * unselected item is rendered as `disabled` so the user cannot exceed it.
   * Already-selected items stay clickable for deselection. Ignored in single mode.
   */
  maxCount?: number;
  /** Enable multi-select with chips. */
  multiple?: boolean;
  /** Form field name for native form submission. */
  name?: string;
  /** Called when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Called when the selection changes.
   * - Single mode: `string` when a value is selected, `undefined` when cleared.
   * - Multi mode: `string[]` — an empty array represents no selection.
   */
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

const ITEM_PRESS_REASON = "item-press";

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

function useAdornmentState() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
  const focusHandlers = {
    onBlurCapture: (e: FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setFocused(false);
      }
    },
    onFocusCapture: () => setFocused(true),
  };
  return { focusHandlers, focused, hoverHandlers, hovered };
}

type AdornmentKind = "clear" | "search" | "down";

function resolveAdornment({
  canSearch,
  clearable,
  focused,
  hasValue,
  hovered,
}: {
  canSearch: boolean;
  clearable: boolean;
  focused: boolean;
  hasValue: boolean;
  hovered: boolean;
}): AdornmentKind {
  if (clearable && hasValue && hovered) {
    return "clear";
  }
  if (canSearch && focused) {
    return "search";
  }
  return "down";
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent text-muted-foreground"
    />
  );
}

function StaticIcon({ icon }: { icon: typeof ArrowDown01Icon }) {
  return (
    <HugeiconsIcon
      aria-hidden
      className="pointer-events-none size-4 text-muted-foreground"
      icon={icon}
      strokeWidth={2}
    />
  );
}

function ClearButton({ className }: { className?: ClassValue }) {
  return (
    <ComboboxPrimitive.Clear
      aria-label="Clear"
      className={cn(
        "size-4 cursor-pointer text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
      data-slot="combobox-clear"
      render={
        <HugeiconsIcon icon={Cancel01Icon} role="button" strokeWidth={2} />
      }
    />
  );
}

function Adornment({ kind }: { kind: AdornmentKind }) {
  if (kind === "clear") {
    return <ClearButton />;
  }
  if (kind === "search") {
    return <StaticIcon icon={SearchList01Icon} />;
  }
  return <StaticIcon icon={ArrowDown01Icon} />;
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
  maxCount,
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
  const hasInput = multiple || effectiveSearchable;

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

  // Mirror selection so adornment/maxCount work for uncontrolled usage too.
  const [internalValue, setInternalValue] = useState<
    string | string[] | undefined
  >(defaultValue);
  const isValueControlled = value !== undefined;
  const currentValue = isValueControlled ? value : internalValue;

  const handleValueChange = useCallback(
    (next: string | string[] | null | undefined) => {
      const normalized = next ?? undefined;
      if (!isValueControlled) {
        setInternalValue(normalized);
      }
      onValueChange?.(normalized);
    },
    [isValueControlled, onValueChange]
  );

  const [inputValue, setInputValue] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const handleInputValueChange = useCallback(
    (next: string, details: { reason: string }) => {
      setInputValue(next);
      if (details.reason !== ITEM_PRESS_REASON) {
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
    debounceMs,
    loadItems,
    loadOn,
    open: currentOpen,
    query,
    serverSideFilter,
    value: currentValue,
  });

  const resolvedItems = asyncEnabled ? asyncItems : (items ?? []);

  const { stringItems, findItem, itemToStringLabel, filterFn } = useSelectItems(
    {
      filter,
      items: resolvedItems,
    }
  );

  const anchorRef = useComboboxAnchor();
  const { hovered, focused, hoverHandlers, focusHandlers } =
    useAdornmentState();

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

  const valueArr = useMemo(() => {
    if (currentValue === undefined) {
      return [];
    }
    return Array.isArray(currentValue) ? currentValue : [currentValue];
  }, [currentValue]);

  const adornmentKind = resolveAdornment({
    canSearch: hasInput,
    clearable,
    focused,
    hasValue: valueArr.length > 0,
    hovered,
  });

  // multi-only: when at limit, mark every unselected item as disabled.
  const maxReached =
    multiple &&
    typeof maxCount === "number" &&
    maxCount > 0 &&
    valueArr.length >= maxCount;
  const selectedSet = useMemo(
    () => (maxReached ? new Set(valueArr) : null),
    [maxReached, valueArr]
  );

  const statusContent = (() => {
    if (asyncLoading) {
      return (
        <div
          className="flex items-center justify-center gap-2 px-2 py-3 text-muted-foreground text-sm"
          data-slot="combobox-status"
        >
          <Spinner />
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
        const disabledByMax =
          selectedSet !== null && !selectedSet.has(itemValue);
        return (
          <ComboboxItem
            className={cn(itemClassName, item.itemClassName)}
            disabled={item.disabled || disabledByMax}
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

  // Keep list mounted across loading/error so base-ui keeps collection state.
  const showEmpty = !(asyncLoading || asyncError);
  const popupBody = (
    <>
      {statusContent}
      {list}
      {showEmpty && empty}
    </>
  );

  const sharedRootProps = {
    defaultOpen: isOpenControlled ? undefined : defaultOpen,
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
        onValueChange={handleValueChange}
        value={value as string[] | undefined}
      >
        <ComboboxChips
          {...focusHandlers}
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
                  className={cn("flex-1", inputClassName)}
                  placeholder={values.length === 0 ? placeholder : undefined}
                />
              </>
            )}
          </ComboboxValue>
          <span
            {...hoverHandlers}
            className="ml-auto inline-flex shrink-0 items-center pl-1"
          >
            <Adornment kind={adornmentKind} />
          </span>
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
        onValueChange={handleValueChange}
        value={value as string | undefined}
      >
        <InputGroup
          {...focusHandlers}
          className={cn("w-auto", triggerClassName, className)}
        >
          <ComboboxPrimitive.Input
            className={cn(inputClassName)}
            disabled={disabled}
            placeholder={placeholder}
            render={<InputGroupInput />}
          />
          <InputGroupAddon {...hoverHandlers} align="inline-end">
            <Adornment kind={adornmentKind} />
          </InputGroupAddon>
        </InputGroup>
        <ComboboxContent className={cn(contentClassName)}>
          {popupBody}
        </ComboboxContent>
      </Combobox>
    );
  }

  // Trigger is a <button>; nesting another <button> (clear) is invalid HTML,
  // so the clear button rides above as an absolute-positioned sibling.
  return (
    <Combobox<string, false>
      {...sharedRootProps}
      defaultValue={defaultValue as string | undefined}
      onValueChange={handleValueChange}
      value={value as string | undefined}
    >
      <div {...focusHandlers} className={cn("relative", className)}>
        <ComboboxPrimitive.Trigger
          className={cn(
            "w-full justify-between pr-9 [&_svg:not([class*='size-'])]:size-4",
            triggerClassName
          )}
          data-slot="combobox-trigger"
          disabled={disabled}
          render={<Button variant="outline" />}
        >
          <ComboboxValue placeholder={placeholder}>
            {(selected: string | null) => {
              if (!selected) {
                return placeholder;
              }
              const item = findItem(selected);
              return (
                <span className="truncate">{item?.label ?? selected}</span>
              );
            }}
          </ComboboxValue>
        </ComboboxPrimitive.Trigger>
        <span
          {...hoverHandlers}
          className="absolute top-1/2 right-2 inline-flex -translate-y-1/2 items-center"
        >
          <Adornment kind={adornmentKind} />
        </span>
      </div>
      <ComboboxContent className={cn(contentClassName)}>
        {popupBody}
      </ComboboxContent>
    </Combobox>
  );
};

export default Select;
