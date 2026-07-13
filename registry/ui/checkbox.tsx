"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { Checkbox as CheckboxControl } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const WHITESPACE_PATTERN = /\s+/;

type CheckboxControlProps = ComponentProps<typeof CheckboxControl>;

interface CheckboxOwnedProps {
  /** Semantic and structural keys owned by the primitive and Compose layer. */
  "aria-checked"?: never;
  "aria-disabled"?: never;
  "aria-readonly"?: never;
  "aria-required"?: never;
  children?: never;
  /** Class override for the visible Checkbox control. */
  className?: ClassValue;
  dangerouslySetInnerHTML?: never;
  /** The primitive slot marker is owned by the Compose component. */
  "data-slot"?: never;
  /** Optional supporting content announced after the label. */
  description?: ReactNode;
  /** Class override for the description content. */
  descriptionClassName?: ClassValue;
  indeterminate?: never;
  /** Required caller-owned content that names the checkbox. */
  label: ReactNode;
  /** Class override for the label content. */
  labelClassName?: ClassValue;
  nativeButton?: never;
  /** Class override for the outer option layout. */
  optionClassName?: ClassValue;
  parent?: never;
  render?: never;
  role?: never;
}

export interface CheckboxProps
  extends Omit<CheckboxControlProps, keyof CheckboxOwnedProps>,
    CheckboxOwnedProps {}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

const mergeIds = (...values: (string | undefined)[]): string | undefined => {
  const tokens = values
    .flatMap((value) => value?.split(WHITESPACE_PATTERN) ?? [])
    .filter(Boolean);
  const merged = [...new Set(tokens)].join(" ");

  return merged || undefined;
};

export const Checkbox = ({
  "aria-checked": _ignoredAriaChecked,
  "aria-disabled": _ignoredAriaDisabled,
  "aria-describedby": ariaDescribedBy,
  "aria-labelledby": ariaLabelledBy,
  "aria-readonly": _ignoredAriaReadonly,
  "aria-required": _ignoredAriaRequired,
  className,
  children: _ignoredChildren,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  description,
  descriptionClassName,
  id,
  indeterminate: _ignoredIndeterminate,
  label,
  labelClassName,
  nativeButton: _ignoredNativeButton,
  optionClassName,
  parent: _ignoredParent,
  render: _ignoredRender,
  role: _ignoredRole,
  ...controlProps
}: CheckboxProps) => {
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
  const blockDescriptionAsLabel =
    hasDescription && !hasLabel && mergedLabelledBy === undefined;

  return (
    <div className={cn("flex items-start gap-3", optionClassName)}>
      <CheckboxControl
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

export default Checkbox;
