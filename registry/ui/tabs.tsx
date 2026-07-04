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

export interface TabsProps
  extends Omit<
    TabsPrimitive.Root.Props,
    "children" | "defaultValue" | "onValueChange" | "render" | "value"
  > {
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
  items,
  keepMounted,
  listClassName,
  triggerClassName,
  contentClassName,
  className,
  variant,
  ...rootProps
}: TabsProps) => (
  <TabsRoot className={className} {...rootProps}>
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
