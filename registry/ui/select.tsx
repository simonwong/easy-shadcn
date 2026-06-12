"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  SearchList01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ClassValue } from "clsx";
import type { AriaAttributes, FocusEvent, ReactNode } from "react";
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

interface SelectBaseProps {
  /** Forwarded to the focusable control for screen-reader descriptions. */
  "aria-describedby"?: string;
  /** Forwarded to the focusable control for invalid-state semantics. */
  "aria-invalid"?: AriaAttributes["aria-invalid"];
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
  /**
   * Id applied to the focusable control (trigger button or input), so a
   * `<label htmlFor>` / the Field component can associate with it.
   */
  id?: string;
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
  /** Form field name for native form submission. */
  name?: string;
  /** Called when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Controlled popover open state. */
  open?: boolean;
  /** Placeholder shown when no value is selected. @default "Pick an option" */
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
}

export type SelectSingleProps = SelectBaseProps & {
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Single-select mode. */
  multiple?: false;
  /**
   * Called when the selection changes.
   * `undefined` represents no selection.
   */
  onValueChange?: (value: string | undefined) => void;
  /** Controlled value. */
  value?: string;
};

export type SelectMultipleProps = SelectBaseProps & {
  /** Uncontrolled initial values. */
  defaultValue?: string[];
  /** Enable multi-select with chips. */
  multiple: true;
  /**
   * Called when the selection changes.
   * An empty array represents no selection.
   */
  onValueChange?: (value: string[]) => void;
  /** Controlled values. */
  value?: string[];
};

export type SelectProps = SelectSingleProps | SelectMultipleProps;

// The query state only drives the async loader, so it should track explicit
// input edits — not programmatic refills (e.g. base-ui restoring the selected
// label on close, reason "none").
const QUERY_UPDATE_REASONS = new Set([
  "input-change",
  "input-clear",
  "input-paste",
  "clear-press",
]);

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

function renderSelectError(
  errorMessage: ReactNode | ((error: unknown) => ReactNode) | undefined,
  error: unknown
): ReactNode {
  if (errorMessage === undefined) {
    return defaultErrorRenderer(error);
  }
  if (typeof errorMessage === "function") {
    return errorMessage(error);
  }
  return errorMessage;
}

function useAdornmentState() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleBlurCapture = useCallback((e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocused(false);
    }
  }, []);
  const handleFocusCapture = useCallback(() => setFocused(true), []);

  const hoverHandlers = useMemo(
    () => ({
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    }),
    [handleMouseEnter, handleMouseLeave]
  );
  const focusHandlers = useMemo(
    () => ({
      onBlurCapture: handleBlurCapture,
      onFocusCapture: handleFocusCapture,
    }),
    [handleBlurCapture, handleFocusCapture]
  );

  return { focusHandlers, focused, hoverHandlers, hovered };
}

type AdornmentKind = "clear" | "search" | "down";
type SelectValue = string | string[] | undefined;
type SelectOnValueChange =
  | SelectSingleProps["onValueChange"]
  | SelectMultipleProps["onValueChange"];

function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) {
      return false;
    }
  }
  return true;
}

function areSelectValuesEqual(a: SelectValue, b: SelectValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return areStringArraysEqual(a, b);
  }
  return a === b;
}

function notifyValueChange({
  multiple,
  onValueChange,
  value,
}: {
  multiple: boolean;
  onValueChange?: SelectOnValueChange;
  value: SelectValue;
}) {
  if (multiple) {
    (onValueChange as SelectMultipleProps["onValueChange"] | undefined)?.(
      value as string[]
    );
    return;
  }
  (onValueChange as SelectSingleProps["onValueChange"] | undefined)?.(
    value as string | undefined
  );
}

function useSelectOpen({
  defaultOpen,
  onOpenChange,
  open,
}: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
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

  return { currentOpen, handleOpenChange, isOpenControlled };
}

function useSelectValue({
  defaultValue,
  isValueControlled,
  multiple,
  onValueChange,
  value,
}: {
  defaultValue?: SelectValue;
  isValueControlled: boolean;
  multiple: boolean;
  onValueChange?: SelectOnValueChange;
  value?: SelectValue;
}) {
  const [internalValue, setInternalValue] = useState<SelectValue>(defaultValue);
  const currentValue = isValueControlled ? value : internalValue;

  const handleValueChange = useCallback(
    (next: string | string[] | null | undefined) => {
      const normalized = normalizeValue(next, multiple);
      if (!isValueControlled) {
        setInternalValue((current) => {
          if (areSelectValuesEqual(current, normalized)) {
            return current;
          }
          return normalized;
        });
      }
      notifyValueChange({ multiple, onValueChange, value: normalized });
    },
    [isValueControlled, multiple, onValueChange]
  );

  return { currentValue, handleValueChange };
}

function normalizeValue(
  next: string | string[] | null | undefined,
  multiple: boolean
): SelectValue {
  if (multiple) {
    return Array.isArray(next) ? next : [];
  }
  if (typeof next === "string") {
    return next;
  }
  return;
}

function getUncontrolledDefaultValue<T>(
  defaultValue: T | undefined,
  isValueControlled: boolean
): T | undefined {
  if (isValueControlled) {
    return;
  }
  return defaultValue;
}

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
  if (clearable && hasValue && (hovered || focused)) {
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

function SelectStatus({
  error,
  errorMessage,
  loading,
  loadingMessage,
  refresh,
}: {
  error: unknown;
  errorMessage?: ReactNode | ((error: unknown) => ReactNode);
  loading: boolean;
  loadingMessage: ReactNode;
  refresh: () => void;
}) {
  if (loading) {
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
  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 px-2 py-3 text-destructive text-sm"
        data-slot="combobox-status"
      >
        <span className="text-center">
          {renderSelectError(errorMessage, error)}
        </span>
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
}

function SelectList({
  findItem,
  itemClassName,
  selectedSet,
}: {
  findItem: (value: string) => SelectItem | undefined;
  itemClassName?: ClassValue;
  selectedSet: Set<string> | null;
}) {
  return (
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
        "inline-flex size-6 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      data-slot="combobox-clear"
      render={<button type="button" />}
    >
      <HugeiconsIcon
        aria-hidden
        className="size-4"
        icon={Cancel01Icon}
        strokeWidth={2}
      />
    </ComboboxPrimitive.Clear>
  );
}

function Adornment({ kind }: { kind: AdornmentKind }) {
  let child: ReactNode;
  if (kind === "clear") {
    child = <ClearButton className="pointer-events-auto" />;
  } else if (kind === "search") {
    child = <StaticIcon icon={SearchList01Icon} />;
  } else {
    child = <StaticIcon icon={ArrowDown01Icon} />;
  }
  return (
    <span
      className="inline-flex size-6 items-center justify-center"
      data-select-adornment-frame
    >
      {child}
    </span>
  );
}

export const Select = (props: SelectProps) => {
  const {
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
    placeholder = "Pick an option",
    emptyMessage = "No results",
    disabled,
    open,
    defaultOpen,
    onOpenChange,
    filter,
    name,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    triggerClassName,
    inputClassName,
    contentClassName,
    itemClassName,
    chipClassName,
    emptyClassName,
  } = props;
  const isAsync = Boolean(loadItems);
  const effectiveSearchable = searchable || (isAsync && serverSideFilter);
  const hasInput = multiple || effectiveSearchable;

  const { currentOpen, handleOpenChange, isOpenControlled } = useSelectOpen({
    defaultOpen,
    onOpenChange,
    open,
  });
  const isValueControlled = "value" in props;
  const { currentValue, handleValueChange } = useSelectValue({
    defaultValue,
    isValueControlled,
    multiple,
    onValueChange,
    value,
  });

  const [query, setQuery] = useState<string>("");

  // Drop the residual search query on close so reopening loads/filters the
  // default list instead of replaying the stale query.
  const handleOpenChangeWithReset = useCallback(
    (next: boolean) => {
      if (!next) {
        setQuery("");
      }
      handleOpenChange(next);
    },
    [handleOpenChange]
  );

  const handleInputValueChange = useCallback(
    (next: string, details: { reason: string }) => {
      if (QUERY_UPDATE_REASONS.has(details.reason)) {
        setQuery((current) => {
          if (current === next) {
            return current;
          }
          return next;
        });
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
  const {
    hovered: adornmentHovered,
    focused,
    hoverHandlers: adornmentHoverHandlers,
    focusHandlers,
  } = useAdornmentState();

  const valueArr = useMemo(() => {
    if (currentValue === undefined) {
      return [];
    }
    return Array.isArray(currentValue) ? currentValue : [currentValue];
  }, [currentValue]);

  const hasValue = valueArr.length > 0;
  const adornmentKind = resolveAdornment({
    canSearch: hasInput,
    clearable,
    focused,
    hasValue,
    hovered: adornmentHovered,
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

  const empty = (
    <ComboboxEmpty className={cn(emptyClassName)}>{emptyMessage}</ComboboxEmpty>
  );

  // Keep list mounted across loading/error so base-ui keeps collection state.
  const showEmpty = !(asyncLoading || asyncError);
  const popupBody = (
    <>
      <SelectStatus
        error={asyncError}
        errorMessage={errorMessage}
        loading={asyncLoading}
        loadingMessage={loadingMessage}
        refresh={refresh}
      />
      <SelectList
        findItem={findItem}
        itemClassName={itemClassName}
        selectedSet={selectedSet}
      />
      {showEmpty && empty}
    </>
  );

  const sharedRootProps = {
    defaultOpen: isOpenControlled ? undefined : defaultOpen,
    disabled,
    filter: serverSideFilter ? null : filterFn,
    items: stringItems,
    itemToStringLabel,
    name,
    onInputValueChange: handleInputValueChange,
    onOpenChange: handleOpenChangeWithReset,
    open,
  } as const;

  const controlProps = {
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    id,
  } as const;

  if (multiple) {
    const multipleValue = isValueControlled
      ? ((value as string[] | undefined) ?? [])
      : undefined;
    return (
      <Combobox<string, true>
        {...sharedRootProps}
        defaultValue={getUncontrolledDefaultValue(
          defaultValue as string[] | undefined,
          isValueControlled
        )}
        multiple
        onValueChange={handleValueChange}
        value={multipleValue}
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
                  {...controlProps}
                  className={cn("flex-1", inputClassName)}
                  placeholder={values.length === 0 ? placeholder : undefined}
                />
              </>
            )}
          </ComboboxValue>
          <span
            {...adornmentHoverHandlers}
            className="ml-auto inline-flex size-6 shrink-0 items-center justify-center"
            data-select-adornment
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

  const singleValue = isValueControlled
    ? ((value as string | undefined) ?? null)
    : undefined;

  if (effectiveSearchable) {
    return (
      <Combobox<string, false>
        {...sharedRootProps}
        defaultValue={getUncontrolledDefaultValue(
          defaultValue as string | undefined,
          isValueControlled
        )}
        onValueChange={handleValueChange}
        value={singleValue}
      >
        <InputGroup
          {...focusHandlers}
          className={cn("w-auto", triggerClassName, className)}
        >
          <ComboboxPrimitive.Input
            {...controlProps}
            className={cn(inputClassName)}
            disabled={disabled}
            placeholder={placeholder}
            render={<InputGroupInput />}
          />
          <InputGroupAddon
            {...adornmentHoverHandlers}
            align="inline-end"
            className="w-8 shrink-0 px-1"
            data-select-adornment
          >
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
      defaultValue={getUncontrolledDefaultValue(
        defaultValue as string | undefined,
        isValueControlled
      )}
      onValueChange={handleValueChange}
      value={singleValue}
    >
      <div {...focusHandlers} className={cn("relative", className)}>
        <ComboboxPrimitive.Trigger
          {...controlProps}
          className={cn(
            "w-full justify-between pr-10 [&_svg:not([class*='size-'])]:size-4",
            triggerClassName
          )}
          data-slot="combobox-trigger"
          disabled={disabled}
          render={<Button variant="outline" />}
        >
          <ComboboxValue placeholder={placeholder}>
            {(selected: string | null) => {
              if (selected === null) {
                return (
                  <span className="text-muted-foreground">{placeholder}</span>
                );
              }
              const item = findItem(selected);
              return (
                <span className="truncate">{item?.label ?? selected}</span>
              );
            }}
          </ComboboxValue>
        </ComboboxPrimitive.Trigger>
        <span
          {...adornmentHoverHandlers}
          className={cn(
            "absolute top-1/2 right-1 inline-flex size-8 -translate-y-1/2 items-center justify-center",
            clearable && hasValue
              ? "pointer-events-auto"
              : "pointer-events-none"
          )}
          data-select-adornment
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
