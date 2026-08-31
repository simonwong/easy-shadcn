// biome-ignore-all lint/suspicious/noArrayIndexKey: A thumb's value position is its stable semantic identity; labels may change.

"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type SliderValue = number | number[];
type SliderRootProps = SliderPrimitive.Root.Props<SliderValue>;

const WHITESPACE_PATTERN = /\s+/;

const mergeIds = (...values: (string | undefined)[]): string | undefined => {
  const tokens = values
    .flatMap((current) => current?.split(WHITESPACE_PATTERN) ?? [])
    .filter(Boolean);
  const merged = [...new Set(tokens)].join(" ");

  return merged || undefined;
};

interface SliderCommonOwnedProps {
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
  /** Formatting is outside this Compose owner. */
  format?: never;
  label: ReactNode;
  labelClassName?: ClassValue;
  /** Locale/i18n mechanisms are outside this Compose owner. */
  locale?: never;
  /** Root replacement is a primitive escape path. */
  render?: never;
  /** The primitive owns slider roles; Compose only names its group. */
  role?: never;
  showValue?: boolean;
  valueClassName?: ClassValue;
}

type SliderRootPassThroughProps = Omit<
  SliderRootProps,
  | keyof SliderCommonOwnedProps
  | "defaultValue"
  | "minStepsBetweenValues"
  | "onValueChange"
  | "onValueCommitted"
  | "thumbCollisionBehavior"
  | "value"
>;

type SliderBaseProps = SliderRootPassThroughProps & SliderCommonOwnedProps;

export type SliderSingleProps = SliderBaseProps & {
  defaultValue?: number;
  /** Multi-thumb spacing requires `multiple=true`. */
  minStepsBetweenValues?: never;
  /** Scalar mode is the default and preserves the original number API. */
  multiple?: false;
  onValueChange?: (
    value: number,
    eventDetails: SliderPrimitive.Root.ChangeEventDetails
  ) => void;
  onValueCommitted?: (
    value: number,
    eventDetails: SliderPrimitive.Root.CommitEventDetails
  ) => void;
  /** Collision behavior requires `multiple=true`. */
  thumbCollisionBehavior?: never;
  /** Per-thumb names require `multiple=true`; scalar mode uses `label`. */
  thumbLabels?: never;
  value?: number;
};

export type SliderMultipleProps = SliderBaseProps & {
  defaultValue?: number[];
  /** Minimum step count between thumbs. Available only with `multiple=true`. */
  minStepsBetweenValues?: SliderPrimitive.Root.Props<
    number[]
  >["minStepsBetweenValues"];
  /** Selects the array-valued multi-thumb API and requires `thumbLabels`. */
  multiple: true;
  onValueChange?: (
    value: number[],
    eventDetails: SliderPrimitive.Root.ChangeEventDetails
  ) => void;
  onValueCommitted?: (
    value: number[],
    eventDetails: SliderPrimitive.Root.CommitEventDetails
  ) => void;
  /** Pointer collision policy. Available only with `multiple=true`. */
  thumbCollisionBehavior?: SliderPrimitive.Root.Props<
    number[]
  >["thumbCollisionBehavior"];
  /** Distinct accessible names in value order. Use at least two entries. */
  thumbLabels: readonly string[];
  value?: number[];
};

export type SliderProps = SliderSingleProps | SliderMultipleProps;

const getThumbLabel = (thumbLabels: readonly string[], index: number): string =>
  thumbLabels[index]?.trim() || `Value ${index + 1}`;

interface SliderPartsProps {
  multiple: boolean;
  thumbCount: number;
  thumbLabels?: readonly string[];
}

const SliderParts = ({
  multiple,
  thumbCount,
  thumbLabels,
}: SliderPartsProps) => (
  <SliderPrimitive.Control className="relative flex w-full touch-none select-none items-center data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col data-disabled:opacity-50">
    <SliderPrimitive.Track
      className="relative grow select-none overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-vertical:h-full data-horizontal:w-full data-vertical:w-1"
      data-slot="slider-track"
    >
      <SliderPrimitive.Indicator
        className="select-none bg-primary data-horizontal:h-full data-vertical:w-full"
        data-slot="slider-range"
      />
    </SliderPrimitive.Track>
    {Array.from({ length: thumbCount }, (_, index) => (
      <SliderPrimitive.Thumb
        className="relative block size-3 shrink-0 select-none rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:outline-hidden focus-visible:ring-3 active:ring-3 disabled:pointer-events-none disabled:opacity-50"
        data-slot="slider-thumb"
        getAriaLabel={
          multiple && thumbLabels
            ? () => getThumbLabel(thumbLabels, index)
            : undefined
        }
        index={multiple ? index : undefined}
        key={index}
      />
    ))}
  </SliderPrimitive.Control>
);

interface SliderAdapterProps {
  ariaLabelledBy?: string;
  className?: ClassValue;
  defaultValue: SliderValue;
  label: ReactNode;
  labelClassName?: ClassValue;
  minStepsBetweenValues?: number;
  multiple: boolean;
  onValueChange?: (
    value: SliderValue,
    eventDetails: SliderPrimitive.Root.ChangeEventDetails
  ) => void;
  onValueCommitted?: (
    value: SliderValue,
    eventDetails: SliderPrimitive.Root.CommitEventDetails
  ) => void;
  rootProps: SliderRootPassThroughProps;
  showValue: boolean;
  thumbCollisionBehavior?: "none" | "push" | "swap";
  thumbLabels?: readonly string[];
  value?: SliderValue;
  valueClassName?: ClassValue;
}

const SliderAdapter = ({
  ariaLabelledBy,
  className,
  defaultValue,
  label,
  labelClassName,
  minStepsBetweenValues,
  multiple,
  onValueChange,
  onValueCommitted,
  rootProps,
  showValue,
  thumbCollisionBehavior,
  thumbLabels,
  value,
  valueClassName,
}: SliderAdapterProps) => {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const displayValue = value ?? uncontrolledValue;
  const displayedText = Array.isArray(displayValue)
    ? displayValue.join(" – ")
    : displayValue;
  const thumbCount = Array.isArray(displayValue) ? displayValue.length : 1;
  const { thumbAlignment, ...remainingRootProps } = rootProps;
  const handleValueChange = (
    nextValue: SliderValue,
    eventDetails: SliderPrimitive.Root.ChangeEventDetails
  ) => {
    onValueChange?.(nextValue, eventDetails);

    if (value === undefined && !eventDetails.isCanceled) {
      setUncontrolledValue(nextValue);
    }
  };
  const handleValueCommitted = (
    nextValue: SliderValue,
    eventDetails: SliderPrimitive.Root.CommitEventDetails
  ) => {
    onValueCommitted?.(nextValue, eventDetails);
  };

  const sliderContent = (
    <>
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
            {displayedText}
          </span>
        ) : null}
      </div>
      <SliderPrimitive.Root<SliderValue>
        {...remainingRootProps}
        aria-labelledby={mergeIds(labelId, ariaLabelledBy)}
        className={cn("data-vertical:h-full data-horizontal:w-full", className)}
        data-slot="slider"
        defaultValue={value === undefined ? defaultValue : undefined}
        minStepsBetweenValues={minStepsBetweenValues}
        onValueChange={handleValueChange}
        onValueCommitted={handleValueCommitted}
        thumbAlignment={thumbAlignment ?? "edge"}
        thumbCollisionBehavior={thumbCollisionBehavior}
        value={value}
      >
        <SliderParts
          multiple={multiple}
          thumbCount={thumbCount}
          thumbLabels={thumbLabels}
        />
      </SliderPrimitive.Root>
    </>
  );

  return <div className="grid gap-2">{sliderContent}</div>;
};

const SingleSlider = ({
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
  multiple: _multiple,
  onValueChange,
  onValueCommitted,
  render: _ignoredRender,
  role: _ignoredRole,
  showValue = true,
  thumbCollisionBehavior: _ignoredThumbCollisionBehavior,
  thumbLabels: _ignoredThumbLabels,
  value,
  valueClassName,
  ...rootProps
}: SliderSingleProps) => (
  <SliderAdapter
    ariaLabelledBy={ariaLabelledBy}
    className={className}
    defaultValue={defaultValue ?? min}
    label={label}
    labelClassName={labelClassName}
    multiple={false}
    onValueChange={
      onValueChange
        ? (nextValue, details) => onValueChange(nextValue as number, details)
        : undefined
    }
    onValueCommitted={
      onValueCommitted
        ? (nextValue, details) => onValueCommitted(nextValue as number, details)
        : undefined
    }
    rootProps={{ ...rootProps, min }}
    showValue={showValue}
    value={value}
    valueClassName={valueClassName}
  />
);

const MultipleSlider = ({
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
  max = 100,
  min = 0,
  minStepsBetweenValues,
  multiple: _multiple,
  onValueChange,
  onValueCommitted,
  render: _ignoredRender,
  role: _ignoredRole,
  showValue = true,
  thumbCollisionBehavior,
  thumbLabels,
  value,
  valueClassName,
  ...rootProps
}: SliderMultipleProps) => (
  <SliderAdapter
    ariaLabelledBy={ariaLabelledBy}
    className={className}
    defaultValue={defaultValue ?? [min, max]}
    label={label}
    labelClassName={labelClassName}
    minStepsBetweenValues={minStepsBetweenValues}
    multiple
    onValueChange={
      onValueChange
        ? (nextValue, details) => onValueChange(nextValue as number[], details)
        : undefined
    }
    onValueCommitted={
      onValueCommitted
        ? (nextValue, details) =>
            onValueCommitted(nextValue as number[], details)
        : undefined
    }
    rootProps={{ ...rootProps, max, min }}
    showValue={showValue}
    thumbCollisionBehavior={thumbCollisionBehavior}
    thumbLabels={thumbLabels}
    value={value}
    valueClassName={valueClassName}
  />
);

export const Slider = (props: SliderProps) => {
  if (props.multiple) {
    return <MultipleSlider {...props} />;
  }

  return <SingleSlider {...props} />;
};

export default Slider;
