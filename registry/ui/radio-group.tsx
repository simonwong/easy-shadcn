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

export interface RadioGroupProps
  extends Omit<
    RadioGroupPrimitive.Props<string>,
    "children" | "defaultValue" | "onValueChange" | "render" | "value"
  > {
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
  items,
  optionClassName,
  itemClassName,
  labelClassName,
  descriptionClassName,
  className,
  ...rootProps
}: RadioGroupProps) => {
  const baseId = useId();

  return (
    <RadioGroupRoot className={className} {...rootProps}>
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
