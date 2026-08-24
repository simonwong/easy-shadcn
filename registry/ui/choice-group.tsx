"use client";

import { CheckboxGroup as CheckboxGroupRoot } from "@base-ui/react/checkbox-group";
import type { ClassValue } from "clsx";
import { type ComponentProps, type ReactNode, useId } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RadioGroupItem as RadioGroupItemPrimitive,
  RadioGroup as RadioGroupRoot,
} from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export interface ChoiceGroupItem {
  ariaLabel?: string;
  controlClassName?: ClassValue;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  disabled?: boolean;
  label: ReactNode;
  labelClassName?: ClassValue;
  optionClassName?: ClassValue;
  value: string;
}

interface ChoiceGroupBaseProps
  extends Omit<
    ComponentProps<"div">,
    "children" | "defaultValue" | "onChange"
  > {
  controlClassName?: ClassValue;
  descriptionClassName?: ClassValue;
  disabled?: boolean;
  items: ChoiceGroupItem[];
  labelClassName?: ClassValue;
  optionClassName?: ClassValue;
  orientation?: "horizontal" | "vertical";
}

interface ChoiceGroupToggleProps {
  size?: "default" | "lg" | "sm";
  spacing?: number;
  variant?: "default" | "outline";
}

export interface ChoiceGroupSingleRadioProps extends ChoiceGroupBaseProps {
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  presentation?: "radio";
  selectionMode?: "single";
  size?: never;
  spacing?: never;
  value?: string;
  variant?: never;
}

export interface ChoiceGroupSingleToggleProps
  extends ChoiceGroupBaseProps,
    ChoiceGroupToggleProps {
  defaultValue?: string;
  onValueChange?: (value: string | undefined) => void;
  presentation: "toggle";
  selectionMode?: "single";
  value?: string;
}

export interface ChoiceGroupMultipleCheckboxProps extends ChoiceGroupBaseProps {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  presentation?: "checkbox";
  selectionMode: "multiple";
  size?: never;
  spacing?: never;
  value?: string[];
  variant?: never;
}

export interface ChoiceGroupMultipleToggleProps
  extends ChoiceGroupBaseProps,
    ChoiceGroupToggleProps {
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  presentation: "toggle";
  selectionMode: "multiple";
  value?: string[];
}

export type ChoiceGroupProps =
  | ChoiceGroupMultipleCheckboxProps
  | ChoiceGroupMultipleToggleProps
  | ChoiceGroupSingleRadioProps
  | ChoiceGroupSingleToggleProps;

interface ChoiceContentProps {
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  descriptionId?: string;
  label: ReactNode;
  labelClassName?: ClassValue;
  labelId: string;
}

const ChoiceContent = ({
  description,
  descriptionClassName,
  descriptionId,
  label,
  labelClassName,
  labelId,
}: ChoiceContentProps) => (
  <span className="grid gap-1 leading-none">
    <span className={cn("font-medium text-sm", labelClassName)} id={labelId}>
      {label}
    </span>
    {description === undefined ? null : (
      <span
        className={cn("text-muted-foreground text-sm", descriptionClassName)}
        id={descriptionId}
      >
        {description}
      </span>
    )}
  </span>
);

const getRootClassName = (
  orientation: "horizontal" | "vertical",
  className?: ClassValue
) =>
  cn(
    "w-full gap-2",
    orientation === "horizontal" ? "flex flex-wrap" : "grid",
    className
  );

const getChoiceIds = (
  baseId: string,
  index: number,
  hasDescription: boolean
) => ({
  descriptionId: hasDescription ? `${baseId}-${index}-description` : undefined,
  labelId: `${baseId}-${index}-label`,
});

const RadioChoiceGroup = (props: ChoiceGroupSingleRadioProps) => {
  const {
    className,
    controlClassName,
    defaultValue,
    descriptionClassName,
    disabled,
    items,
    labelClassName,
    onValueChange,
    optionClassName,
    orientation = "vertical",
    presentation: _presentation,
    selectionMode: _selectionMode,
    value,
    ...rootProps
  } = props;
  const baseId = useId();
  const valueControlled = "value" in props;
  const radioValueProps = valueControlled
    ? { value: value ?? null }
    : { defaultValue };

  return (
    <RadioGroupRoot
      {...rootProps}
      {...radioValueProps}
      aria-orientation={orientation}
      className={getRootClassName(orientation, className)}
      data-orientation={orientation}
      disabled={disabled}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
    >
      {items.map((item, index) => {
        const { descriptionId, labelId } = getChoiceIds(
          baseId,
          index,
          item.description !== undefined
        );

        return (
          // biome-ignore lint/a11y/noLabelWithoutControl: Base UI radio button is nested in this label.
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
              aria-label={item.ariaLabel}
              aria-labelledby={item.ariaLabel ? "" : labelId}
              className={cn(controlClassName, item.controlClassName)}
              disabled={item.disabled}
              value={item.value}
            />
            <ChoiceContent
              description={item.description}
              descriptionClassName={cn(
                descriptionClassName,
                item.descriptionClassName
              )}
              descriptionId={descriptionId}
              label={item.label}
              labelClassName={cn(labelClassName, item.labelClassName)}
              labelId={labelId}
            />
          </label>
        );
      })}
    </RadioGroupRoot>
  );
};

const CheckboxChoiceGroup = (props: ChoiceGroupMultipleCheckboxProps) => {
  const {
    className,
    controlClassName,
    defaultValue,
    descriptionClassName,
    disabled,
    items,
    labelClassName,
    onValueChange,
    optionClassName,
    orientation = "vertical",
    presentation: _presentation,
    selectionMode: _selectionMode,
    value,
    ...rootProps
  } = props;
  const baseId = useId();
  const valueControlled = "value" in props;
  const checkboxValueProps = valueControlled
    ? { value: value ?? [] }
    : { defaultValue };

  return (
    <CheckboxGroupRoot
      {...rootProps}
      {...checkboxValueProps}
      aria-orientation={orientation}
      className={getRootClassName(orientation, className)}
      data-orientation={orientation}
      disabled={disabled}
      onValueChange={(nextValue) => onValueChange?.(nextValue)}
    >
      {items.map((item, index) => {
        const { descriptionId, labelId } = getChoiceIds(
          baseId,
          index,
          item.description !== undefined
        );

        return (
          // biome-ignore lint/a11y/noLabelWithoutControl: Base UI checkbox button is nested in this label.
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
              aria-label={item.ariaLabel}
              aria-labelledby={item.ariaLabel ? "" : labelId}
              className={cn(controlClassName, item.controlClassName)}
              disabled={item.disabled}
              value={item.value}
            />
            <ChoiceContent
              description={item.description}
              descriptionClassName={cn(
                descriptionClassName,
                item.descriptionClassName
              )}
              descriptionId={descriptionId}
              label={item.label}
              labelClassName={cn(labelClassName, item.labelClassName)}
              labelId={labelId}
            />
          </label>
        );
      })}
    </CheckboxGroupRoot>
  );
};

type ToggleChoiceGroupProps =
  | ChoiceGroupMultipleToggleProps
  | ChoiceGroupSingleToggleProps;

const getToggleValue = (
  value: string | string[] | undefined,
  multiple: boolean
): string[] => {
  if (multiple) {
    return (value as string[] | undefined) ?? [];
  }
  if (value === undefined) {
    return [];
  }
  return [value as string];
};

const getToggleDefaultValue = (
  value: string | string[] | undefined,
  multiple: boolean
): string[] | undefined => {
  if (multiple) {
    return value as string[] | undefined;
  }
  if (value === undefined) {
    return;
  }
  return [value as string];
};

const ToggleChoiceGroup = (props: ToggleChoiceGroupProps) => {
  const {
    className,
    controlClassName,
    defaultValue,
    descriptionClassName,
    disabled,
    items,
    labelClassName,
    onValueChange,
    optionClassName,
    orientation = "vertical",
    presentation: _presentation,
    selectionMode = "single",
    size,
    spacing,
    value,
    variant,
    ...rootProps
  } = props;
  const baseId = useId();
  const multiple = selectionMode === "multiple";
  const valueControlled = "value" in props;
  const toggleValueProps = valueControlled
    ? { value: getToggleValue(value, multiple) }
    : { defaultValue: getToggleDefaultValue(defaultValue, multiple) };

  return (
    <ToggleGroup
      {...rootProps}
      {...toggleValueProps}
      className={getRootClassName(orientation, className)}
      disabled={disabled}
      multiple={multiple}
      onValueChange={(nextValue) => {
        if (multiple) {
          (onValueChange as ChoiceGroupMultipleToggleProps["onValueChange"])?.(
            nextValue
          );
        } else {
          (onValueChange as ChoiceGroupSingleToggleProps["onValueChange"])?.(
            nextValue[0]
          );
        }
      }}
      orientation={orientation}
      size={size}
      spacing={spacing}
      variant={variant}
    >
      {items.map((item, index) => {
        const { descriptionId, labelId } = getChoiceIds(
          baseId,
          index,
          item.description !== undefined
        );

        return (
          <ToggleGroupItem
            aria-describedby={descriptionId}
            aria-label={item.ariaLabel}
            aria-labelledby={item.ariaLabel ? "" : labelId}
            className={cn(
              item.description === undefined
                ? undefined
                : "h-auto items-start whitespace-normal px-3 py-2 text-left",
              optionClassName,
              item.optionClassName,
              controlClassName,
              item.controlClassName
            )}
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            <ChoiceContent
              description={item.description}
              descriptionClassName={cn(
                descriptionClassName,
                item.descriptionClassName
              )}
              descriptionId={descriptionId}
              label={item.label}
              labelClassName={cn(labelClassName, item.labelClassName)}
              labelId={labelId}
            />
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
};

export const ChoiceGroup = (props: ChoiceGroupProps) => {
  const selectionMode = props.selectionMode ?? "single";
  const presentation =
    props.presentation ?? (selectionMode === "multiple" ? "checkbox" : "radio");

  if (presentation === "radio") {
    return <RadioChoiceGroup {...(props as ChoiceGroupSingleRadioProps)} />;
  }
  if (presentation === "checkbox") {
    return (
      <CheckboxChoiceGroup {...(props as ChoiceGroupMultipleCheckboxProps)} />
    );
  }
  return <ToggleChoiceGroup {...(props as ToggleChoiceGroupProps)} />;
};

export default ChoiceGroup;
