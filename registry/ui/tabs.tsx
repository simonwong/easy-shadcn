"use client";

import type { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { ClassValue } from "clsx";
import type { ReactNode } from "react";
import {
  TabsContent,
  TabsList,
  Tabs as TabsRoot,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabsItem {
  content: ReactNode;
  contentClassName?: ClassValue;
  disabled?: boolean;
  keepMounted?: boolean;
  trigger: ReactNode;
  triggerClassName?: ClassValue;
  value: string;
}

interface TabsOwnedRootProps {
  children?: never;
  dangerouslySetInnerHTML?: never;
  "data-activation-direction"?: never;
  "data-orientation"?: never;
  "data-slot"?: never;
  render?: never;
}

export interface TabsProps
  extends Omit<
      TabsPrimitive.Root.Props,
      "defaultValue" | "onValueChange" | "value" | keyof TabsOwnedRootProps
    >,
    TabsOwnedRootProps {
  contentClassName?: ClassValue;
  defaultValue?: string;
  items: TabsItem[];
  keepMounted?: boolean;
  listClassName?: ClassValue;
  onValueChange?: (
    value: string,
    eventDetails: TabsPrimitive.Root.ChangeEventDetails
  ) => void;
  triggerClassName?: ClassValue;
  value?: string;
  variant?: "default" | "line";
}

export const Tabs = ({
  children: _ignoredChildren,
  "data-activation-direction": _ignoredDataActivationDirection,
  "data-orientation": _ignoredDataOrientation,
  "data-slot": _ignoredDataSlot,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  items,
  keepMounted,
  listClassName,
  triggerClassName,
  contentClassName,
  className,
  orientation,
  render: _ignoredRender,
  variant,
  ...rootProps
}: TabsProps) => (
  <TabsRoot {...rootProps} className={className} orientation={orientation}>
    {items.length > 0 && (
      <TabsList className={cn(listClassName)} variant={variant}>
        {items.map((item) => (
          <TabsTrigger
            className={cn(triggerClassName, item.triggerClassName)}
            disabled={item.disabled}
            key={item.value}
            value={item.value}
          >
            {item.trigger}
          </TabsTrigger>
        ))}
      </TabsList>
    )}
    {items.map((item) => (
      <TabsContent
        className={cn(contentClassName, item.contentClassName)}
        keepMounted={item.keepMounted ?? keepMounted}
        key={item.value}
        value={item.value}
      >
        {item.content}
      </TabsContent>
    ))}
  </TabsRoot>
);

export default Tabs;
