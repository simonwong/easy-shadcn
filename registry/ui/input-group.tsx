"use client";

import type { ClassValue } from "clsx";
import type { ComponentProps, ReactNode } from "react";
import {
  InputGroupAddon,
  InputGroupInput,
  InputGroup as InputGroupRoot,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface InputGroupOwnedInputProps {
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-slot"?: never;
}

export interface InputGroupProps
  extends Omit<
      ComponentProps<typeof InputGroupInput>,
      "className" | keyof InputGroupOwnedInputProps
    >,
    InputGroupOwnedInputProps {
  /** Class override for the InputGroup root. All other inherited props target the input. */
  className?: ClassValue;
  /** Content for the logical inline-end addon. */
  endAddon?: ReactNode;
  /** Class override for the logical inline-end addon wrapper. */
  endAddonClassName?: ClassValue;
  /** Class override for the actual InputGroupInput. */
  inputClassName?: ClassValue;
  /** Content for the logical inline-start addon. */
  startAddon?: ReactNode;
  /** Class override for the logical inline-start addon wrapper. */
  startAddonClassName?: ClassValue;
}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const InputGroup = ({
  children: _ignoredChildren,
  className,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  inputClassName,
  startAddon,
  startAddonClassName,
  endAddon,
  endAddonClassName,
  ...inputProps
}: InputGroupProps) => (
  <InputGroupRoot className={cn(className)}>
    {hasNode(startAddon) ? (
      <InputGroupAddon align="inline-start" className={cn(startAddonClassName)}>
        {startAddon}
      </InputGroupAddon>
    ) : null}
    <InputGroupInput className={cn(inputClassName)} {...inputProps} />
    {hasNode(endAddon) ? (
      <InputGroupAddon align="inline-end" className={cn(endAddonClassName)}>
        {endAddon}
      </InputGroupAddon>
    ) : null}
  </InputGroupRoot>
);

export default InputGroup;
