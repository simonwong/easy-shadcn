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
  contentClassName?: ClassValue;
  items: TabsItem[];
  listClassName?: ClassValue;
  triggerClassName?: ClassValue;
}

export const Tabs = ({
  items,
  listClassName,
  triggerClassName,
  contentClassName,
  className,
  ...rootProps
}: TabsProps) => (
  <TabsRoot className={className} {...rootProps}>
    <TabsList className={cn(listClassName)}>
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
        className={cn(contentClassName, item.contentClassName)}
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
