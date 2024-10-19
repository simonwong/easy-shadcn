import React, { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { cn } from '@easy-shadcn/utils';
import {
  TooltipProvider,
  Tooltip as InternalTooltip,
  TooltipTrigger,
  TooltipContent,
} from '../../components/ui/tooltip';

export interface TooltipProps extends ComponentProps<typeof InternalTooltip> {
  /**
   * Trigger Props
   * @defaultValue { asChild: true }
   */
  triggerProps?: ComponentProps<typeof TooltipTrigger>;
  contentProps?: ComponentProps<typeof TooltipContent>;
  content: ReactNode;
  /**
   * The duration from when the pointer enters the trigger until the tooltip gets opened. This will
   * override the prop with the same name passed to Provider.
   * @defaultValue 300
   */
  delayDuration?: number;
}

export const Tooltip: React.FC<PropsWithChildren<TooltipProps>> = ({
  triggerProps,
  contentProps,
  content,
  delayDuration = 300,
  children,
  ...resetProps
}) => {
  return (
    <TooltipProvider>
      <InternalTooltip delayDuration={delayDuration} {...resetProps}>
        <TooltipTrigger asChild {...triggerProps}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          {...contentProps}
          className={cn(
            'bg-white text-black dark:bg-black dark:text-primary-foreground border text-sm',
            contentProps?.className
          )}
        >
          {content}
        </TooltipContent>
      </InternalTooltip>
    </TooltipProvider>
  );
};
