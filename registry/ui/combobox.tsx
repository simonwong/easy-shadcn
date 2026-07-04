"use client";

import type { ClassValue } from "clsx";
import type { AriaAttributes, ReactNode } from "react";
import { Select } from "@/registry/ui/select";

export interface ComboboxItem {
  /** Unselectable when true. */
  disabled?: boolean;
  /** Per-item class, merged AFTER the root-level `itemClassName`. */
  itemClassName?: ClassValue;
  /** Display label. string/number drive the default filter, else falls back to `value`. */
  label: ReactNode;
  /** Required; stable React key + controlled value. `""` is valid. */
  value: string;
}

export interface ComboboxProps {
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];

  /** `InputGroup` wrapper (the bordered control) className. */
  className?: ClassValue;
  /** Show an inline clear button when the field has a value. @default false */
  clearable?: boolean;
  /** Popover content container className. */
  contentClassName?: ClassValue;
  /** Uncontrolled initial open state. @default false */
  defaultOpen?: boolean;
  /** Uncontrolled initial value. */
  defaultValue?: string;

  /** Disable all interaction. */
  disabled?: boolean;
  /** `<ComboboxEmpty />` className. */
  emptyClassName?: ClassValue;
  /** Content shown when no items match the query. @default "No results" */
  emptyMessage?: ReactNode;
  /**
   * Custom filter predicate — overrides the default match.
   * @default case-insensitive `contains` against `label`, fallback `value`
   */
  filter?: (item: ComboboxItem, query: string) => boolean;
  /** Id applied to the input, for `<label htmlFor>` / the Field component. */
  id?: string;
  /** The `<input>` className. */
  inputClassName?: ClassValue;
  /** Default item className, merged with each `item.itemClassName`. */
  itemClassName?: ClassValue;
  /** Option list. An empty array renders the empty state. */
  items: ComboboxItem[];
  /** Native form field name for form submission. */
  name?: string;
  /** Called when the popover open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Called when the selection changes. `undefined` represents no selection. */
  onValueChange?: (value: string | undefined) => void;

  /** Controlled popover open state. */
  open?: boolean;

  /** Placeholder shown when no value is selected. @default "Pick an option" */
  placeholder?: string;

  /** Controlled value. Prop presence (incl. `undefined`) signals controlled mode. */
  value?: string;
}

/**
 * An always-searchable, single-select autocomplete. A thin, opinionated preset
 * over `Select` with `searchable` forced on and `multiple` unavailable — see
 * `docs/adr/0005-combobox-thin-preset-over-select.md`. The enumerated props are forwarded 1:1; anything
 * unlisted → use `Select` or the `components/ui/combobox` primitives.
 */
export const Combobox = (props: ComboboxProps) => {
  const {
    items,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    placeholder,
    emptyMessage,
    clearable,
    filter,
    disabled,
    name,
    id,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    className,
    inputClassName,
    contentClassName,
    itemClassName,
    emptyClassName,
  } = props;

  // `value` presence (even `undefined`) signals controlled mode. Forward the
  // key only when the caller passed it, so Select's `"value" in props` check
  // mirrors Combobox's own controlled/uncontrolled decision.
  const controlledValue: { value?: string } =
    "value" in props ? { value: props.value } : {};

  return (
    <Select
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid}
      className={className}
      clearable={clearable}
      contentClassName={contentClassName}
      defaultOpen={defaultOpen}
      defaultValue={defaultValue}
      disabled={disabled}
      emptyClassName={emptyClassName}
      emptyMessage={emptyMessage}
      filter={filter}
      id={id}
      inputClassName={inputClassName}
      itemClassName={itemClassName}
      items={items}
      name={name}
      onOpenChange={onOpenChange}
      onValueChange={onValueChange}
      open={open}
      placeholder={placeholder}
      searchable
      {...controlledValue}
    />
  );
};

export default Combobox;
