"use client";

import type { ClassValue } from "clsx";
import { type ComponentProps, Fragment } from "react";
import {
  InputOTPGroup,
  InputOTP as InputOTPPrimitive,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

export type InputOTPProps = Omit<
  ComponentProps<typeof InputOTPPrimitive>,
  | "children"
  | "className"
  | "containerClassName"
  | "dangerouslySetInnerHTML"
  | "data-slot"
  | "defaultValue"
  | "render"
> & {
  children?: never;
  className?: ClassValue;
  containerClassName?: ClassValue;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
  defaultValue?: string;
  groupClassName?: ClassValue;
  /**
   * Uniform slot count per group. Invalid values render one group; values at
   * least `maxLength` also render one group.
   */
  groupSize?: number;
  render?: never;
  /** Applied only when multiple groups produce separators. */
  separatorClassName?: ClassValue;
  slotClassName?: ClassValue;
};

export const InputOTP = ({
  "aria-invalid": ariaInvalid,
  children: _children,
  className,
  containerClassName,
  dangerouslySetInnerHTML: _dangerouslySetInnerHTML,
  "data-slot": _dataSlot,
  groupClassName,
  groupSize,
  maxLength,
  render: _render,
  separatorClassName,
  slotClassName,
  ...inputProps
}: InputOTPProps) => {
  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new RangeError("InputOTP maxLength must be a positive integer.");
  }

  const effectiveGroupSize =
    Number.isInteger(groupSize) && groupSize !== undefined && groupSize > 0
      ? Math.min(groupSize, maxLength)
      : maxLength;
  const groupCount = Math.ceil(maxLength / effectiveGroupSize);

  return (
    <InputOTPPrimitive
      aria-invalid={ariaInvalid}
      className={cn(className)}
      containerClassName={cn(containerClassName)}
      maxLength={maxLength}
      {...inputProps}
    >
      {Array.from({ length: groupCount }, (_, groupIndex) => {
        const start = groupIndex * effectiveGroupSize;
        const length = Math.min(effectiveGroupSize, maxLength - start);

        return (
          <Fragment key={start}>
            {groupIndex > 0 && (
              <InputOTPSeparator
                className={cn(
                  "flex items-center [&_svg:not([class*='size-'])]:size-4",
                  separatorClassName
                )}
              />
            )}
            <InputOTPGroup className={cn(groupClassName)}>
              {Array.from({ length }, (__, slotOffset) => {
                const index = start + slotOffset;

                return (
                  <InputOTPSlot
                    aria-invalid={ariaInvalid}
                    className={cn(slotClassName)}
                    index={index}
                    key={index}
                  />
                );
              })}
            </InputOTPGroup>
          </Fragment>
        );
      })}
    </InputOTPPrimitive>
  );
};

export default InputOTP;
