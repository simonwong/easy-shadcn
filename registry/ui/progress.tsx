"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import {
  Progress as ProgressControl,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ProgressControlProps = ComponentProps<typeof ProgressControl>;

const WHITESPACE_PATTERN = /\s+/;

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

const mergeIds = (...values: (string | undefined)[]): string | undefined => {
  const tokens = values
    .flatMap((value) => value?.split(WHITESPACE_PATTERN) ?? [])
    .filter(Boolean);
  const merged = [...new Set(tokens)].join(" ");

  return merged || undefined;
};

export interface ProgressProps
  extends Omit<
    ProgressControlProps,
    | "aria-valuemax"
    | "aria-valuemin"
    | "aria-valuenow"
    | "children"
    | "className"
    | "dangerouslySetInnerHTML"
    | "format"
    | "getAriaValueText"
    | "locale"
    | "max"
    | "min"
    | "render"
    | "role"
    | "value"
  > {
  /** Compose owns the progress range derived from value. */
  "aria-valuemax"?: never;
  /** Compose owns the progress range derived from value. */
  "aria-valuemin"?: never;
  /** Compose owns the numeric value derived from value. */
  "aria-valuenow"?: never;
  /** Class override for the progressbar root. */
  className?: ClassValue;
  /** Raw HTML conflicts with Compose-owned descendants. */
  dangerouslySetInnerHTML?: never;
  /** Compose owns primitive-derived completion state. */
  "data-complete"?: never;
  /** Compose owns primitive-derived indeterminate state. */
  "data-indeterminate"?: never;
  /** Compose owns primitive-derived progressing state. */
  "data-progressing"?: never;
  /** Compose owns the primitive root slot marker. */
  "data-slot"?: never;
  /** Required caller-owned content that names the progressbar. */
  label: ReactNode;
  /** Class override for the label content. */
  labelClassName?: ClassValue;
  /** Whether to render the primitive-formatted visual value. @default true */
  showValue?: boolean;
  /**
   * Supported values are finite percentages from 0 to 100, or null.
   * Invalid values are not clamped, coerced, or validated; their behavior is
   * unspecified.
   */
  value: number | null;
  /** Class override for the visual value. */
  valueClassName?: ClassValue;
}

export const Progress = ({
  "aria-labelledby": ariaLabelledBy,
  "aria-valuetext": ariaValueText,
  className,
  "data-complete": _ignoredComplete,
  "data-indeterminate": _ignoredIndeterminate,
  "data-progressing": _ignoredProgressing,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  label,
  labelClassName,
  showValue = true,
  value,
  valueClassName,
  ...rootProps
}: ProgressProps) => {
  const autoId = useId();
  const labelId = `${autoId}-label`;
  const hasLabel = hasNode(label);

  return (
    <ProgressControl
      {...rootProps}
      {...(typeof ariaValueText === "string"
        ? { "aria-valuetext": ariaValueText }
        : {})}
      aria-labelledby={mergeIds(hasLabel ? labelId : undefined, ariaLabelledBy)}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={value ?? undefined}
      className={cn(className)}
      data-slot="progress"
      format={undefined}
      getAriaValueText={undefined}
      locale="en-US"
      max={100}
      min={0}
      render={undefined}
      role="progressbar"
      value={value}
    >
      {hasLabel ? (
        <ProgressLabel className={cn(labelClassName)} id={labelId}>
          {label}
        </ProgressLabel>
      ) : null}
      {showValue ? <ProgressValue className={cn(valueClassName)} /> : null}
    </ProgressControl>
  );
};

export default Progress;
