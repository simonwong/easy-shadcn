"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  TooltipContent,
  TooltipProvider,
  Tooltip as TooltipRoot,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RootProps = ComponentProps<typeof TooltipRoot>;
type ContentProps = ComponentProps<typeof TooltipContent>;
type ProviderProps = ComponentProps<typeof TooltipProvider>;

export interface TooltipProps
  extends Pick<ContentProps, "align" | "alignOffset" | "side" | "sideOffset">,
    Pick<RootProps, "defaultOpen" | "disabled" | "onOpenChange" | "open">,
    Pick<ProviderProps, "closeDelay" | "delay"> {
  children: ReactElement;
  content: ReactNode;
  contentClassName?: string;
}

export const Tooltip = ({
  children,
  content,
  contentClassName,
  side,
  sideOffset,
  align,
  alignOffset,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  delay,
  closeDelay,
}: TooltipProps) => (
  <TooltipProvider closeDelay={closeDelay} delay={delay}>
    <TooltipRoot
      defaultOpen={defaultOpen}
      disabled={disabled}
      onOpenChange={onOpenChange}
      open={open}
    >
      <TooltipTrigger render={children} />
      <TooltipContent
        align={align}
        alignOffset={alignOffset}
        className={contentClassName}
        side={side}
        sideOffset={sideOffset}
      >
        {content}
      </TooltipContent>
    </TooltipRoot>
  </TooltipProvider>
);

export default Tooltip;
