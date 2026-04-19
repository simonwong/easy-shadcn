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
  keepMounted?: boolean;
  label: ReactNode;
  triggerClassName?: ClassValue;
  value: string;
}

export interface TabsProps
  extends Omit<TabsPrimitive.Root.Props, "children" | "render"> {
  contentProps?: Omit<TabsPrimitive.Panel.Props, "value">;
  items: TabsItem[];
  tabBarClassName?: ClassValue;
  triggerClassName?: ClassValue;
}

export const Tabs = ({
  items,
  tabBarClassName,
  triggerClassName,
  contentProps,
  className,
  ...rootProps
}: TabsProps) => (
  <TabsRoot className={cn(className)} {...rootProps}>
    <TabsList className={cn(tabBarClassName)}>
      {items.map((item) => (
        <TabsTrigger
          className={cn(triggerClassName, item.triggerClassName)}
          key={item.value}
          value={item.value}
        >
          {item.label}
        </TabsTrigger>
      ))}
    </TabsList>
    {items.map((item) => (
      <TabsContent
        {...contentProps}
        className={cn(contentProps?.className, item.contentClassName)}
        keepMounted={item.keepMounted}
        key={item.value}
        value={item.value}
      >
        {item.content}
      </TabsContent>
    ))}
  </TabsRoot>
);

export default Tabs;
