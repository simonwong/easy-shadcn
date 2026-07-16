"use client";

import type { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { useId, useState } from "react";
import { Slider as SliderControl } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type SliderControlProps = ComponentProps<typeof SliderControl>;

const WHITESPACE_PATTERN = /\s+/;

const mergeIds = (...values: (string | undefined)[]): string | undefined => {
  const tokens = values
    .flatMap((current) => current?.split(WHITESPACE_PATTERN) ?? [])
    .filter(Boolean);
  const merged = [...new Set(tokens)].join(" ");

  return merged || undefined;
};

const unwrapScalar = (value: number | readonly number[]): number =>
  (value as readonly [number])[0];

interface SliderOwnedProps {
  /** Descriptions require explicit primitive composition. */
  "aria-describedby"?: never;
  /** The visible label is the supported accessible-name path. */
  "aria-label"?: never;
  /** Orientation semantics are derived from orientation. */
  "aria-orientation"?: never;
  /** Numeric ARIA is derived by the primitive from max. */
  "aria-valuemax"?: never;
  /** Numeric ARIA is derived by the primitive from min. */
  "aria-valuemin"?: never;
  /** Numeric ARIA is derived by the primitive from value. */
  "aria-valuenow"?: never;
  /** Custom value text belongs to primitive composition. */
  "aria-valuetext"?: never;
  /** Compose owns the complete child structure. */
  children?: never;
  className?: ClassValue;
  /** Raw HTML conflicts with Compose-owned descendants. */
  dangerouslySetInnerHTML?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-dirty"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-disabled"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-dragging"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-filled"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-focused"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-invalid"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-orientation"?: never;
  /** The primitive slot marker is Compose-owned. */
  "data-slot"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-touched"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-valid"?: never;
  defaultValue?: number;
  /** Formatting is outside this thin wrapper. */
  format?: never;
  label: ReactNode;
  labelClassName?: ClassValue;
  /** Locale/i18n mechanisms are outside this thin wrapper. */
  locale?: never;
  /** Range spacing belongs to multi-thumb primitive composition. */
  minStepsBetweenValues?: never;
  onValueChange?: (
    value: number,
    eventDetails: SliderPrimitive.Root.ChangeEventDetails
  ) => void;
  onValueCommitted?: (
    value: number,
    eventDetails: SliderPrimitive.Root.CommitEventDetails
  ) => void;
  /** Root replacement is a primitive escape path. */
  render?: never;
  /** The primitive owns its group role. */
  role?: never;
  showValue?: boolean;
  /** Collision policy belongs to multi-thumb primitive composition. */
  thumbCollisionBehavior?: never;
  value?: number;
  valueClassName?: ClassValue;
}

export interface SliderProps
  extends Omit<SliderControlProps, keyof SliderOwnedProps>,
    SliderOwnedProps {}

export const Slider = ({
  "aria-describedby": _ignoredAriaDescribedBy,
  "aria-label": _ignoredAriaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-orientation": _ignoredAriaOrientation,
  "aria-valuemax": _ignoredAriaValueMax,
  "aria-valuemin": _ignoredAriaValueMin,
  "aria-valuenow": _ignoredAriaValueNow,
  "aria-valuetext": _ignoredAriaValueText,
  children: _ignoredChildren,
  className,
  "data-disabled": _ignoredDataDisabled,
  "data-dirty": _ignoredDataDirty,
  "data-dragging": _ignoredDataDragging,
  "data-filled": _ignoredDataFilled,
  "data-focused": _ignoredDataFocused,
  "data-invalid": _ignoredDataInvalid,
  "data-orientation": _ignoredDataOrientation,
  "data-slot": _ignoredDataSlot,
  "data-touched": _ignoredDataTouched,
  "data-valid": _ignoredDataValid,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  defaultValue,
  format: _ignoredFormat,
  label,
  labelClassName,
  locale: _ignoredLocale,
  min = 0,
  minStepsBetweenValues: _ignoredMinStepsBetweenValues,
  onValueChange,
  onValueCommitted,
  render: _ignoredRender,
  role: _ignoredRole,
  showValue = true,
  thumbCollisionBehavior: _ignoredThumbCollisionBehavior,
  value,
  valueClassName,
  ...controlProps
}: SliderProps) => {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? min
  );
  const displayValue = value ?? uncontrolledValue;
  const handleValueChange = (
    nextValue: number | readonly number[],
    eventDetails: SliderPrimitive.Root.ChangeEventDetails
  ) => {
    const nextScalar = unwrapScalar(nextValue);

    onValueChange?.(nextScalar, eventDetails);

    if (value === undefined && !eventDetails.isCanceled) {
      setUncontrolledValue(nextScalar);
    }
  };
  const handleValueCommitted = (
    nextValue: number | readonly number[],
    eventDetails: SliderPrimitive.Root.CommitEventDetails
  ) => {
    onValueCommitted?.(unwrapScalar(nextValue), eventDetails);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn("font-medium text-sm", labelClassName)}
          data-slot="slider-label"
          id={labelId}
        >
          {label}
        </span>
        {showValue ? (
          <span
            className={cn("text-muted-foreground text-sm", valueClassName)}
            data-slot="slider-value"
          >
            {displayValue}
          </span>
        ) : null}
      </div>
      <SliderControl
        {...controlProps}
        aria-labelledby={mergeIds(labelId, ariaLabelledBy)}
        className={cn(className)}
        defaultValue={value === undefined ? [defaultValue ?? min] : undefined}
        min={min}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        value={value === undefined ? undefined : [value]}
      />
    </div>
  );
};

export default Slider;
