"use client";

import type { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import {
  AccordionContent,
  AccordionItem as AccordionItemPrimitive,
  Accordion as AccordionRoot,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  content: ReactNode;
  contentClassName?: ClassValue;
  disabled?: boolean;
  itemClassName?: ClassValue;
  trigger: ReactNode;
  triggerClassName?: ClassValue;
  value: string;
}

interface AccordionOwnedRootProps {
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-disabled"?: never;
  "data-orientation"?: never;
  "data-slot"?: never;
  render?: never;
}

export interface AccordionProps
  extends Omit<
      AccordionPrimitive.Root.Props<string>,
      "defaultValue" | "onValueChange" | "value" | keyof AccordionOwnedRootProps
    >,
    AccordionOwnedRootProps {
  contentClassName?: ClassValue;
  defaultValue?: string[];
  itemClassName?: ClassValue;
  items: AccordionItem[];
  onValueChange?: (
    value: string[],
    eventDetails: AccordionPrimitive.Root.ChangeEventDetails
  ) => void;
  triggerClassName?: ClassValue;
  value?: string[];
}

export const Accordion = ({
  children: _ignoredChildren,
  "data-disabled": _ignoredDataDisabled,
  "data-orientation": _ignoredDataOrientation,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  disabled = false,
  items,
  itemClassName,
  triggerClassName,
  contentClassName,
  className,
  orientation = "vertical",
  render: _ignoredRender,
  ...rootProps
}: AccordionProps) => (
  <AccordionRoot
    {...rootProps}
    className={className}
    data-disabled={disabled ? "" : undefined}
    data-orientation={orientation}
    disabled={disabled}
    orientation={orientation}
  >
    {items.map((item) => (
      <AccordionItemPrimitive
        className={cn(itemClassName, item.itemClassName)}
        disabled={item.disabled}
        key={item.value}
        value={item.value}
      >
        <AccordionTrigger
          className={cn(triggerClassName, item.triggerClassName)}
        >
          {item.trigger}
        </AccordionTrigger>
        <AccordionContent
          className={cn(contentClassName, item.contentClassName)}
        >
          {item.content}
        </AccordionContent>
      </AccordionItemPrimitive>
    ))}
  </AccordionRoot>
);

export default Accordion;
