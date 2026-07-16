"use client";

import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type { ClassValue } from "clsx";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  Sheet as SheetRoot,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

type SheetContentProps = ComponentProps<typeof SheetContent>;

interface SheetOwnedProps {
  /** The visible title and optional description own dialog semantics. */
  "aria-describedby"?: never;
  /** The visible title is the supported accessible-name path. */
  "aria-label"?: never;
  /** The primitive derives the title relationship. */
  "aria-labelledby"?: never;
  /** Modal semantics remain primitive-owned. */
  "aria-modal"?: never;
  /** Compose owns the complete child structure. */
  children?: never;
  className?: ClassValue;
  content: ReactNode;
  contentClassName?: ClassValue;
  /** Raw HTML conflicts with Compose-owned descendants. */
  dangerouslySetInnerHTML?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-closed"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-ending-style"?: never;
  /** Primitive nesting state is derived, not caller-owned. */
  "data-nested"?: never;
  /** Primitive nesting state is derived, not caller-owned. */
  "data-nested-dialog-open"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-open"?: never;
  /** Placement is derived from side. */
  "data-side"?: never;
  /** The primitive slot marker is Compose-owned. */
  "data-slot"?: never;
  /** Primitive state markers are derived, not caller-owned. */
  "data-starting-style"?: never;
  description?: ReactNode;
  descriptionClassName?: ClassValue;
  footer?: ReactNode;
  footerClassName?: ClassValue;
  headerClassName?: ClassValue;
  /** Root replacement is a primitive escape path. */
  render?: never;
  /** The primitive owns its dialog role. */
  role?: never;
  showCloseButton?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  title: ReactNode;
  titleClassName?: ClassValue;
  trigger?: ReactElement;
}

export interface SheetProps
  extends Omit<SheetContentProps, keyof SheetOwnedProps>,
    Pick<
      DialogPrimitive.Root.Props,
      | "defaultOpen"
      | "disablePointerDismissal"
      | "onOpenChange"
      | "onOpenChangeComplete"
      | "open"
    >,
    SheetOwnedProps {}

export const Sheet = ({
  "aria-describedby": _ignoredAriaDescribedBy,
  "aria-label": _ignoredAriaLabel,
  "aria-labelledby": _ignoredAriaLabelledBy,
  "aria-modal": _ignoredAriaModal,
  children: _ignoredChildren,
  className,
  content,
  contentClassName,
  dangerouslySetInnerHTML: _ignoredDangerouslySetInnerHTML,
  "data-closed": _ignoredDataClosed,
  "data-ending-style": _ignoredDataEndingStyle,
  "data-nested": _ignoredDataNested,
  "data-nested-dialog-open": _ignoredDataNestedDialogOpen,
  "data-open": _ignoredDataOpen,
  "data-side": _ignoredDataSide,
  "data-slot": _ignoredDataSlot,
  "data-starting-style": _ignoredDataStartingStyle,
  defaultOpen,
  description,
  descriptionClassName,
  disablePointerDismissal,
  footer,
  footerClassName,
  headerClassName,
  onOpenChange,
  onOpenChangeComplete,
  open,
  render: _ignoredRender,
  role: _ignoredRole,
  showCloseButton = true,
  side = "right",
  title,
  titleClassName,
  trigger,
  ...contentProps
}: SheetProps) => (
  <SheetRoot
    defaultOpen={defaultOpen}
    disablePointerDismissal={disablePointerDismissal}
    onOpenChange={onOpenChange}
    onOpenChangeComplete={onOpenChangeComplete}
    open={open}
  >
    {trigger && <SheetTrigger render={trigger} />}
    <SheetContent
      {...contentProps}
      className={cn(className)}
      showCloseButton={showCloseButton}
      side={side}
    >
      <SheetHeader className={cn(headerClassName)}>
        <SheetTitle className={cn(titleClassName)}>{title}</SheetTitle>
        {hasNode(description) && (
          <SheetDescription
            className={cn(descriptionClassName)}
            render={<div />}
          >
            {description}
          </SheetDescription>
        )}
      </SheetHeader>
      <div
        className={cn("min-h-0 flex-1 overflow-y-auto px-4", contentClassName)}
        data-slot="sheet-body"
      >
        {content}
      </div>
      {hasNode(footer) && (
        <SheetFooter className={cn(footerClassName)}>{footer}</SheetFooter>
      )}
    </SheetContent>
  </SheetRoot>
);

export default Sheet;
