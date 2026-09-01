"use client";

import type { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import type { ClassValue } from "clsx";
import { type ReactNode, useId } from "react";
import {
  RadioGroupItem as RadioGroupItemPrimitive,
  RadioGroup as RadioGroupRoot,
} from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface RadioGroupItem {
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  disabled?: boolean;
  itemClassName?: ClassValue;
  label: ReactNode;
  labelClassName?: ClassValue;
  optionClassName?: ClassValue;
  value: string;
}

interface RadioGroupOwnedRootProps {
  "aria-disabled"?: never;
  "aria-readonly"?: never;
  "aria-required"?: never;
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-dirty"?: never;
  "data-disabled"?: never;
  "data-filled"?: never;
  "data-focused"?: never;
  "data-invalid"?: never;
  "data-readonly"?: never;
  "data-required"?: never;
  "data-slot"?: never;
  "data-touched"?: never;
  "data-valid"?: never;
  onChange?: never;
  render?: never;
  role?: never;
}

export interface RadioGroupProps
  extends Omit<
      RadioGroupPrimitive.Props<string>,
      | "defaultValue"
      | "onValueChange"
      | "value"
      | keyof RadioGroupOwnedRootProps
    >,
    RadioGroupOwnedRootProps {
  defaultValue?: string;
  descriptionClassName?: ClassValue;
  itemClassName?: ClassValue;
  items: RadioGroupItem[];
  labelClassName?: ClassValue;
  onValueChange?: (
    value: string,
    eventDetails: RadioGroupPrimitive.ChangeEventDetails
  ) => void;
  optionClassName?: ClassValue;
  value?: string;
}

export const RadioGroup = ({
  "aria-disabled": _ignoredAriaDisabled,
  "aria-readonly": _ignoredAriaReadonly,
  "aria-required": _ignoredAriaRequired,
  children: _ignoredChildren,
  "data-dirty": _ignoredDataDirty,
  "data-disabled": _ignoredDataDisabled,
  "data-filled": _ignoredDataFilled,
  "data-focused": _ignoredDataFocused,
  "data-invalid": _ignoredDataInvalid,
  "data-readonly": _ignoredDataReadonly,
  "data-required": _ignoredDataRequired,
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
  readOnly = false,
  render: _ignoredRender,
  required = false,
  role: _ignoredRole,
  ...rootProps
}: RadioGroupProps) => {
  const baseId = useId();

  return (
    <RadioGroupRoot
      {...rootProps}
      className={className}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
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
          // biome-ignore lint/a11y/noLabelWithoutControl: the radio control is rendered inside.
          <label
            className={cn(
              "flex items-start gap-3",
              optionClassName,
              item.optionClassName
            )}
            key={item.value}
          >
            <RadioGroupItemPrimitive
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
    </RadioGroupRoot>
  );
};

export default RadioGroup;
