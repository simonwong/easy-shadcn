"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { Switch as SwitchControl } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const WHITESPACE_PATTERN = /\s+/;

type SwitchControlProps = ComponentProps<typeof SwitchControl>;

export interface SwitchProps
  extends Omit<
    SwitchControlProps,
    | "children"
    | "className"
    | "dangerouslySetInnerHTML"
    | "nativeButton"
    | "render"
  > {
  /** Class override for the visible Switch control. */
  className?: ClassValue;
  /** Optional supporting content announced after the label. */
  description?: ReactNode;
  /** Class override for the description content. */
  descriptionClassName?: ClassValue;
  /** Required caller-owned content that names the switch. */
  label: ReactNode;
  /** Class override for the label content. */
  labelClassName?: ClassValue;
  /** Class override for the outer option layout. */
  optionClassName?: ClassValue;
}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

const mergeIds = (...values: (string | undefined)[]): string | undefined => {
  const tokens = values
    .flatMap((value) => value?.split(WHITESPACE_PATTERN) ?? [])
    .filter(Boolean);
  const merged = [...new Set(tokens)].join(" ");

  return merged || undefined;
};

export const Switch = ({
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  className,
  description,
  descriptionClassName,
  label,
  labelClassName,
  optionClassName,
  id,
  ...controlProps
}: SwitchProps) => {
  const autoId = useId();
  const controlId = id ?? `${autoId}-control`;
  const labelId = `${autoId}-label`;
  const descriptionId = `${autoId}-description`;
  const hasLabel = hasNode(label);
  const hasDescription = hasNode(description);
  const mergedLabelledBy = mergeIds(
    hasLabel ? labelId : undefined,
    ariaLabelledBy
  );
  // Prevent Base UI's native-label fallback from promoting description-only
  // content into the accessible name while keeping the label clickable.
  const blockDescriptionAsLabel =
    hasDescription && !hasLabel && mergedLabelledBy === undefined;

  return (
    <div className={cn("flex items-start gap-3", optionClassName)}>
      <SwitchControl
        aria-describedby={mergeIds(
          hasDescription ? descriptionId : undefined,
          ariaDescribedBy
        )}
        aria-labelledby={blockDescriptionAsLabel ? "" : mergedLabelledBy}
        className={cn(className)}
        id={controlId}
        {...controlProps}
      />
      {hasLabel || hasDescription ? (
        <label className="grid gap-1 leading-none" htmlFor={controlId}>
          {hasLabel ? (
            <span
              className={cn("font-medium text-sm", labelClassName)}
              id={labelId}
            >
              {label}
            </span>
          ) : null}
          {hasDescription ? (
            <span
              className={cn(
                "text-muted-foreground text-sm",
                descriptionClassName
              )}
              id={descriptionId}
            >
              {description}
            </span>
          ) : null}
        </label>
      ) : null}
    </div>
  );
};

export default Switch;
