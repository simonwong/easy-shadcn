"use client";

import type {
  TabsProps as InternalTabsProps,
  TabsContentProps,
} from "@radix-ui/react-tabs";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import type { ClassValue } from "class-variance-authority/types";
import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabsProps extends InternalTabsProps {
  option: {
    value: string;
    title: ReactNode;
    triggerClassName?: ClassValue;
    content: ReactNode;
    contentClassName?: ClassValue;
    forceMount?: true;
  }[];
  tabBarLoop?: boolean;
  tabBarClassName?: ClassValue;
  triggerClassName?: ClassValue;
  contentProps?: Omit<TabsContentProps, "value">;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      option,
      tabBarLoop,
      tabBarClassName,
      triggerClassName,
      contentProps,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Root
        className={cn("flex flex-col gap-2", className)}
        ref={ref}
        {...props}
      >
        <TabsPrimitive.List
          className={cn(
            "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
            tabBarClassName
          )}
          data-slot="tabs-list"
          loop={tabBarLoop}
        >
          {option.map((opt) => (
            <TabsPrimitive.Trigger
              className={cn(
                "inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-2 py-1 font-medium text-foreground text-sm transition-[color,box-shadow] focus-visible:border-ring focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                triggerClassName,
                opt.triggerClassName
              )}
              data-slot="tabs-trigger"
              key={opt.value}
              value={opt.value}
            >
              {opt.title}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
        {option.map((opt) => (
          <TabsPrimitive.Content
            className={cn(
              "flex-1 outline-none",
              opt.contentClassName,
              className
            )}
            data-slot="tabs-content"
            forceMount={opt.forceMount}
            key={opt.value}
            value={opt.value}
          >
            {opt.content}
          </TabsPrimitive.Content>
        ))}
      </TabsPrimitive.Root>
    );
  }
);

Tabs.displayName = "Tabs";

export default Tabs;
