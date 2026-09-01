"use client";

import { CheckboxGroup as CheckboxGroupRoot } from "@base-ui/react/checkbox-group";
import type { ClassValue } from "clsx";
import { type ReactNode, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface CheckboxGroupItem {
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  disabled?: boolean;
  itemClassName?: ClassValue;
  label: ReactNode;
  labelClassName?: ClassValue;
  optionClassName?: ClassValue;
  value: string;
}

interface CheckboxGroupOwnedRootProps {
  "aria-disabled"?: never;
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-dirty"?: never;
  "data-disabled"?: never;
  "data-filled"?: never;
  "data-focused"?: never;
  "data-invalid"?: never;
  "data-slot"?: never;
  "data-touched"?: never;
  "data-valid"?: never;
  onChange?: never;
  render?: never;
  role?: never;
}

export interface CheckboxGroupProps
  extends Omit<
      CheckboxGroupRoot.Props,
      | "defaultValue"
      | "onValueChange"
      | "value"
      | keyof CheckboxGroupOwnedRootProps
    >,
    CheckboxGroupOwnedRootProps {
  defaultValue?: string[];
  descriptionClassName?: ClassValue;
  itemClassName?: ClassValue;
  items: CheckboxGroupItem[];
  labelClassName?: ClassValue;
  onValueChange?: (
    value: string[],
    eventDetails: CheckboxGroupRoot.ChangeEventDetails
  ) => void;
  optionClassName?: ClassValue;
  value?: string[];
}

export const CheckboxGroup = ({
  "aria-disabled": _ignoredAriaDisabled,
  children: _ignoredChildren,
  "data-dirty": _ignoredDataDirty,
  "data-disabled": _ignoredDataDisabled,
  "data-filled": _ignoredDataFilled,
  "data-focused": _ignoredDataFocused,
  "data-invalid": _ignoredDataInvalid,
  "data-slot": _ignoredDataSlot,
  "data-touched": _ignoredDataTouched,
  "data-valid": _ignoredDataValid,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  disabled = false,
  items,
  optionClassName,
  itemClassName,
  labelClassName,
  descriptionClassName,
  className,
  onChange: _ignoredOnChange,
  render: _ignoredRender,
  role: _ignoredRole,
  ...rootProps
}: CheckboxGroupProps) => {
  const baseId = useId();

  return (
    // The base-ui group root is unstyled; bake RadioGroup's layout here so
    // components/ui stays untouched (there is no styled checkbox-group there).
    <CheckboxGroupRoot
      {...rootProps}
      aria-disabled={disabled || undefined}
      className={cn("grid w-full gap-2", className)}
      data-slot="checkbox-group"
      disabled={disabled}
    >
      {items.map((item, index) => {
        // Derive ids from the index, not item.value: values may contain
        // whitespace, which would break the space-separated aria-labelledby /
        // aria-describedby token lists and drop the accessible name.
        const labelId = `${baseId}-${index}-label`;
        const descriptionId =
          item.description === undefined
            ? undefined
            : `${baseId}-${index}-description`;

        return (
          // biome-ignore lint/a11y/noLabelWithoutControl: the checkbox control is rendered inside.
          <label
            className={cn(
              "flex items-start gap-3",
              optionClassName,
              item.optionClassName
            )}
            key={item.value}
          >
            <Checkbox
              aria-describedby={descriptionId}
              aria-labelledby={labelId}
              className={cn(itemClassName, item.itemClassName)}
              disabled={item.disabled}
              value={item.value}
            />
            <span className="grid gap-1 leading-none">
              <span
                className={cn(
                  "font-medium text-sm",
                  labelClassName,
                  item.labelClassName
                )}
                id={labelId}
              >
                {item.label}
              </span>
              {item.description !== undefined && (
                <span
                  className={cn(
                    "text-muted-foreground text-sm",
                    descriptionClassName,
                    item.descriptionClassName
                  )}
                  id={descriptionId}
                >
                  {item.description}
                </span>
              )}
            </span>
          </label>
        );
      })}
    </CheckboxGroupRoot>
  );
};

export default CheckboxGroup;
