"use client";

import type { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import type { ClassValue } from "clsx";
import type { ReactElement, ReactNode } from "react";
import {
  ContextMenuContent,
  ContextMenuItem as ContextMenuItemPrimitive,
  ContextMenu as ContextMenuRoot,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

export interface ContextMenuItem {
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  inset?: boolean;
  itemClassName?: ClassValue;
  onClick?: ContextMenuPrimitive.Item.Props["onClick"];
  shortcut?: ReactNode;
  /** Stable, unique React identity. Not forwarded to the primitive. */
  value: string;
  variant?: "default" | "destructive";
}

export interface ContextMenuProps
  extends Pick<ContextMenuPrimitive.Positioner.Props, "align" | "side"> {
  contentClassName?: ClassValue;
  /** Disables custom invocation without changing the trigger element. */
  disabled?: boolean;
  itemClassName?: ClassValue;
  items: ContextMenuItem[];
  onOpenChange?: ContextMenuPrimitive.Root.Props["onOpenChange"];
  /** Controls visibility only after a real context-menu invocation establishes the anchor. */
  open?: boolean;
  shortcutClassName?: ClassValue;
  sideOffset?: number;
  /** A non-Fragment element that accepts a ref and DOM event handlers. */
  trigger: ReactElement;
}

const hasNode = (node: ReactNode): boolean =>
  node !== null && node !== undefined && typeof node !== "boolean";

export const ContextMenu = ({
  align,
  contentClassName,
  disabled,
  itemClassName,
  items,
  onOpenChange,
  open,
  side,
  sideOffset,
  shortcutClassName,
  trigger,
}: ContextMenuProps) => (
  <ContextMenuRoot disabled={disabled} onOpenChange={onOpenChange} open={open}>
    <ContextMenuTrigger render={trigger} />
    <ContextMenuContent
      align={align}
      className={cn(contentClassName)}
      side={side}
      sideOffset={sideOffset}
    >
      {items.map((item) => (
        <ContextMenuItemPrimitive
          className={cn(itemClassName, item.itemClassName)}
          disabled={item.disabled}
          inset={item.inset}
          key={item.value}
          onClick={item.onClick}
          variant={item.variant}
        >
          {hasNode(item.icon) ? (
            <span aria-hidden="true" data-slot="context-menu-item-icon">
              {item.icon}
            </span>
          ) : null}
          {item.content}
          {hasNode(item.shortcut) ? (
            <ContextMenuShortcut
              aria-hidden="true"
              className={cn(shortcutClassName)}
            >
              {item.shortcut}
            </ContextMenuShortcut>
          ) : null}
        </ContextMenuItemPrimitive>
      ))}
    </ContextMenuContent>
  </ContextMenuRoot>
);

export default ContextMenu;
