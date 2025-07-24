'use client';

import type {
  TabsProps as InternalTabsProps,
  TabsContentProps,
  TabsListProps,
  TabsTriggerProps,
} from '@radix-ui/react-tabs';
import React, { type ReactNode } from 'react';
import {
  Tabs as InternalTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export interface TabsProps extends InternalTabsProps {
  option: {
    value: string;
    title: ReactNode;
    triggerProps?: Omit<TabsTriggerProps, 'value'>;
    content: ReactNode;
    contentProps?: Omit<TabsContentProps, 'value'>;
  }[];
  listProps?: TabsListProps;
  triggerProps?: Omit<TabsTriggerProps, 'value'>;
  contentProps?: Omit<TabsContentProps, 'value'>;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ option, listProps, triggerProps, contentProps, ...props }, ref) => {
    return (
      <InternalTabs ref={ref} {...props}>
        <TabsList {...listProps}>
          {option.map((opt) => (
            <TabsTrigger
              {...triggerProps}
              {...opt.triggerProps}
              key={opt.value}
              value={opt.value}
            >
              {opt.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {option.map((opt) => (
          <TabsContent
            {...contentProps}
            {...opt.contentProps}
            key={opt.value}
            value={opt.value}
          >
            {opt.content}
          </TabsContent>
        ))}
      </InternalTabs>
    );
  }
);

Tabs.displayName = 'Tabs';

export default Tabs;
