"use client";

import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  Popover as PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

type RootProps = ComponentProps<typeof PopoverRoot>;
type TriggerProps = ComponentProps<typeof PopoverTrigger>;
type ContentProps = ComponentProps<typeof PopoverContent>;

export interface PopoverProps
  extends Omit<ContentProps, "children" | "content" | "title">,
    Pick<RootProps, "defaultOpen" | "onOpenChange" | "open">,
    Pick<TriggerProps, "disabled"> {
  children: ReactElement;
  content: ReactNode;
  contentClassName?: string;
  description?: ReactNode;
  descriptionClassName?: string;
  footer?: ReactNode;
  footerClassName?: string;
  headerClassName?: string;
  title?: ReactNode;
  titleClassName?: string;
}

// Mirrors React's own rendering rules: null/undefined/boolean render nothing,
// but valid falsy nodes like 0 and "" must not be swallowed.
const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const Popover = ({
  children,
  content,
  contentClassName,
  title,
  titleClassName,
  description,
  descriptionClassName,
  footer,
  footerClassName,
  headerClassName,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
  ...contentProps
}: PopoverProps) => (
  <PopoverRoot
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    open={open}
  >
    <PopoverTrigger disabled={disabled} render={children} />
    <PopoverContent {...contentProps}>
      {(hasNode(title) || hasNode(description)) && (
        <PopoverHeader className={headerClassName}>
          {hasNode(title) && (
            <PopoverTitle className={titleClassName}>{title}</PopoverTitle>
          )}
          {hasNode(description) && (
            <PopoverDescription className={descriptionClassName}>
              {description}
            </PopoverDescription>
          )}
        </PopoverHeader>
      )}
      {hasNode(content) && (
        <div className={contentClassName} data-slot="popover-body">
          {content}
        </div>
      )}
      {hasNode(footer) && (
        <div className={footerClassName} data-slot="popover-footer">
          {footer}
        </div>
      )}
    </PopoverContent>
  </PopoverRoot>
);

export default Popover;
